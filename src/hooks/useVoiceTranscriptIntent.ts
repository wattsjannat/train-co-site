import { useEffect, useRef } from "react";

interface VoiceModel {
  addEventListener: (event: string, handler: (e: unknown) => void) => void;
  removeEventListener: (event: string, handler: (e: unknown) => void) => void;
}

interface TranscriptionEvent {
  transcript?: string;
}

type UIFrameworkWindow = Window & {
  UIFramework?: {
    getVoiceComponents?: () => { model?: VoiceModel } | null;
  };
};

const TRANSCRIPTION_EVENT = "conversation.item.input_audio_transcription.completed";
const MODEL_POLL_MS = 250;

type TranscriptCallback = (transcript: string) => void;

const subscribers = new Set<TranscriptCallback>();
let singletonModel: VoiceModel | null = null;
let singletonPollId: ReturnType<typeof setInterval> | null = null;

function singletonHandler(e: unknown) {
  const event = e as TranscriptionEvent;
  const transcript = (event?.transcript ?? "").toLowerCase().trim();
  if (!transcript) return;
  subscribers.forEach((cb) => cb(transcript));
}

/**
 * Attaches a single global listener to the voice model once and keeps it alive.
 * Components subscribe / unsubscribe via the `subscribers` Set — no per-component
 * addEventListener/removeEventListener on the SDK model, which avoids re-attachment
 * bugs when React components unmount and remount during navigation.
 */
function ensureSingleton() {
  if (singletonPollId !== null) return;

  const tryAttach = () => {
    const fw = (window as UIFrameworkWindow).UIFramework;
    const model = fw?.getVoiceComponents?.()?.model;
    if (!model?.addEventListener) return;
    if (model === singletonModel) return;

    if (singletonModel) {
      singletonModel.removeEventListener(TRANSCRIPTION_EVENT, singletonHandler);
    }
    singletonModel = model;
    model.addEventListener(TRANSCRIPTION_EVENT, singletonHandler);
  };

  tryAttach();
  singletonPollId = setInterval(tryAttach, MODEL_POLL_MS);
}

interface UseVoiceTranscriptIntentOptions {
  enabled?: boolean;
  dedupeWindowMs?: number;
  onTranscript: (transcript: string) => void;
}

export function useVoiceTranscriptIntent({
  enabled = true,
  dedupeWindowMs = 1200,
  onTranscript,
}: UseVoiceTranscriptIntentOptions): void {
  const lastTranscriptRef = useRef<{ text: string; at: number } | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    if (!enabled) return;

    ensureSingleton();

    const handler: TranscriptCallback = (transcript: string) => {
      const now = Date.now();
      const last = lastTranscriptRef.current;
      if (
        last &&
        last.text === transcript &&
        now - last.at < dedupeWindowMs
      ) {
        return;
      }

      lastTranscriptRef.current = { text: transcript, at: now };
      onTranscriptRef.current(transcript);
    };

    subscribers.add(handler);
    return () => {
      subscribers.delete(handler);
    };
  }, [enabled, dedupeWindowMs]);
}
