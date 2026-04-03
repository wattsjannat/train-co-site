/**
 * MCP tool invocation bridge — Next.js App Router port of server/mcpInvoke.ts.
 *
 *   POST /api/invoke/:toolName  { ...args }
 *   → opens SSE to MCP server, runs initialize → tools/call → returns result
 *
 * Requires MCP_SERVER_URL env var (server-side only, not NEXT_PUBLIC_).
 * Example: MCP_SERVER_URL=http://127.0.0.1:3000
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * With output: 'export' (Mobeus static deploy) Next.js requires generateStaticParams
 * for every dynamic segment. The route is not invoked in static mode (mcpBridge falls
 * back to the remote URL on 405), but the build must not fail.
 */
export function generateStaticParams() {
  return [
    { toolName: "get_jobs_by_skills" },
    { toolName: "get_skill_progression" },
    { toolName: "get_market_relevance" },
    { toolName: "get_career_growth" },
    { toolName: "get_candidate" },
    { toolName: "get_job_applicants" },
  ];
}

const MCP_URL = (process.env.MCP_SERVER_URL ?? "http://127.0.0.1:3000").replace(/\/mcp\/?$/, "");
const MCP_ORIGIN = (() => {
  try {
    return new URL(MCP_URL).origin;
  } catch {
    return MCP_URL;
  }
})();
const SESSION_TIMEOUT_MS = 15_000;

interface JsonRpcResponse {
  jsonrpc: string;
  id?: number;
  result?: unknown;
  error?: { code: number; message: string };
}

async function postMessage(
  endpoint: string,
  method: string,
  params: Record<string, unknown>,
  id?: number,
): Promise<void> {
  const body: Record<string, unknown> = { jsonrpc: "2.0", method, params };
  if (id !== undefined) body.id = id;

  await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Parse an SSE text/event-stream response using Node.js native fetch + ReadableStream.
 * Calls onEvent(eventType, data) for every complete SSE event.
 * Returns a cancel() function that aborts the stream.
 */
function parseSseStream(
  url: string,
  onEvent: (eventType: string, data: string) => void,
  onError: (err: Error) => void,
): { cancel: () => void } {
  const controller = new AbortController();

  void (async () => {
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Accept: "text/event-stream", "Cache-Control": "no-cache" },
        signal: controller.signal,
      });
    } catch (err) {
      if (!(err instanceof Error && err.name === "AbortError")) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
      return;
    }

    if (!res.ok || !res.body) {
      onError(new Error(`SSE connect failed: ${res.status}`));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let currentEvent = "message";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("event:")) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            const data = line.slice(5).trimStart();
            onEvent(currentEvent, data);
            currentEvent = "message";
          } else if (line === "") {
            currentEvent = "message";
          }
        }
      }
    } catch (err) {
      if (!(err instanceof Error && err.name === "AbortError")) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      reader.releaseLock();
    }
  })();

  return { cancel: () => controller.abort() };
}

function invokeTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve) => {
    let settled = false;
    let sseCancel: (() => void) | null = null;

    const finish = (status: number, body: unknown) => {
      if (settled) return;
      settled = true;
      sseCancel?.();
      clearTimeout(timer);
      resolve({ status, body });
    };

    const timer = setTimeout(
      () => finish(504, { error: "MCP session timed out" }),
      SESSION_TIMEOUT_MS,
    );

    let messagesEndpoint = "";
    let nextId = 1;
    const pending = new Map<number, (msg: JsonRpcResponse) => void>();

    function rpc(
      method: string,
      params: Record<string, unknown>,
      needsResponse: boolean,
    ): Promise<JsonRpcResponse | void> {
      if (needsResponse) {
        const id = nextId++;
        return new Promise<JsonRpcResponse>((res) => {
          pending.set(id, res);
          postMessage(messagesEndpoint, method, params, id).catch(() =>
            finish(502, { error: "Failed to POST to MCP messages endpoint" }),
          );
        });
      }
      postMessage(messagesEndpoint, method, params).catch(() =>
        finish(502, { error: "Failed to POST to MCP messages endpoint" }),
      );
      return Promise.resolve();
    }

    const { cancel } = parseSseStream(
      `${MCP_URL}/mcp/sse`,
      (eventType, data) => {
        if (eventType === "endpoint") {
          const path = data.trim();
          messagesEndpoint = path.startsWith("http") ? path : `${MCP_ORIGIN}${path}`;

          void (async () => {
            try {
              await rpc(
                "initialize",
                {
                  protocolVersion: "2024-11-05",
                  capabilities: {},
                  clientInfo: { name: "trainco-bridge", version: "1.0" },
                },
                true,
              );

              await rpc("notifications/initialized", {}, false);
              // 200ms wait — 50ms is too short and causes intermittent -32602 errors.
              await new Promise((r) => setTimeout(r, 200));

              const toolResp = (await rpc(
                "tools/call",
                { name: toolName, arguments: args },
                true,
              )) as JsonRpcResponse;

              if (toolResp.error) {
                finish(502, { error: toolResp.error.message, code: toolResp.error.code });
                return;
              }

              const content = (
                toolResp.result as { content?: { type: string; text: string }[] }
              )?.content;
              if (!content?.length) {
                finish(502, { error: "Empty tool response" });
                return;
              }

              const text = content.map((c) => c.text ?? "").join("");
              try {
                finish(200, JSON.parse(text));
              } catch {
                finish(200, text);
              }
            } catch (err) {
              finish(502, {
                error: err instanceof Error ? err.message : "MCP invocation failed",
              });
            }
          })();
        } else {
          // "message" — JSON-RPC response frame
          try {
            const msg: JsonRpcResponse = JSON.parse(data);
            if (msg.id !== undefined && pending.has(msg.id)) {
              const cb = pending.get(msg.id)!;
              pending.delete(msg.id);
              cb(msg);
            }
          } catch {
            // ignore non-JSON SSE frames
          }
        }
      },
      (err) => finish(502, { error: err.message }),
    );

    sseCancel = cancel;
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ toolName: string }> },
): Promise<NextResponse> {
  const { toolName } = await params;

  if (!toolName) {
    return NextResponse.json({ error: "Missing toolName parameter" }, { status: 400 });
  }

  if (!process.env.MCP_SERVER_URL) {
    console.warn("[api/invoke] MCP_SERVER_URL is not set — falling back to http://127.0.0.1:3000");
  }

  let args: Record<string, unknown> = {};
  try {
    const body = await request.json();
    if (body && typeof body === "object") args = body as Record<string, unknown>;
  } catch {
    // empty body is fine
  }

  try {
    const { status, body } = await invokeTool(toolName, args);
    return NextResponse.json(body, { status });
  } catch (err) {
    console.error("[api/invoke] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
