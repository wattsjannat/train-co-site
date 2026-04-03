/**
 * teleIntent — selection/intent helpers for templates.
 * Adapted from trainco-v1.
 */

import { notifyTele, teleAcknowledge, type NotifyTeleOptions } from "@/utils/teleUtils";

export function getLinkedInPlaceholderEmail(): string {
  return "linkedin_demo@trainco.com";
}

export type SendLinkedInContinueOptions = {
  steerModel?: boolean;
};

export type SelectionIntentJobContext = {
  jobId: string;
  title: string;
  company: string;
};

export function sendSelectionIntent(
  label: string,
  jobContext?: SelectionIntentJobContext,
  notifyOptions?: NotifyTeleOptions,
): Promise<void> {
  window.dispatchEvent(
    new CustomEvent("user-selection", {
      detail:
        jobContext != null
          ? { selection: label, jobId: jobContext.jobId, title: jobContext.title, company: jobContext.company }
          : { selection: label },
    }),
  );
  const base = `user selected: ${label}`;
  const msg =
    jobContext != null
      ? `${base} | jobId:${jobContext.jobId} | ${jobContext.title} at ${jobContext.company}`
      : base;
  return notifyTele(msg, notifyOptions);
}

export function sendLinkedInContinueIntent(
  email = getLinkedInPlaceholderEmail(),
  options?: SendLinkedInContinueOptions,
): Promise<void> {
  if (options?.steerModel) {
    void teleAcknowledge(
      "[SYSTEM] LinkedIn path (voice). The canonical `user clicked: Continue with LinkedIn | email: " +
        email +
        "` signal is being sent now via TellTele. Execute journey-onboarding Step 6 only: " +
        "`find_candidate` with that email, read `data.candidate_id` / `data.id` from the result, then `get_candidate` with that non-empty `candidate_id` (sequential, not parallel). " +
        "FORBIDDEN on this path: `register_candidate`. " +
        "If you already started `register_candidate`, abandon it and use `find_candidate` only.",
      { visible: false },
    );
  }
  return notifyTele(`user clicked: Continue with LinkedIn | email: ${email}`, {
    skipNavigateDrift: true,
  });
}

export function sendRegistrationEmailIntent(email: string): Promise<void> {
  return notifyTele(`user registered with email: ${email}`, {
    skipNavigateDrift: true,
  });
}

export function sendTappedIntent(target: string): Promise<void> {
  return notifyTele(`user clicked: ${target}`);
}

export function sendDashboardIntent(): Promise<void> {
  return notifyTele("user clicked: dashboard");
}

export function sendBackToProfileIntent(): Promise<void> {
  return notifyTele("user clicked: back to profile");
}

export function sendLooksGoodClickedIntent(): Promise<void> {
  return notifyTele("user clicked: Looks Good");
}

export type JobOpenedContext = { jobId?: string; matchScore?: number };

/**
 * Sent when a job card preview opens. Includes jobId/matchScore when known so the
 * voice agent stays aligned with the on-screen role (not a different job from context).
 */
export function sendJobOpenedIntent(
  title: string,
  company: string,
  ctx?: JobOpenedContext,
): Promise<void> {
  let msg = `user opened job: ${title} at ${company}`;
  if (ctx?.jobId) msg += ` | jobId:${ctx.jobId}`;
  if (ctx?.matchScore != null) msg += ` | matchScore:${ctx.matchScore}`;
  msg +=
    " [SYSTEM] The visible job preview matches this TellTele line exactly (title, company, jobId, matchScore). " +
    "Your spoken response MUST describe only this role — do not mention any other job from earlier cards or tool output.";
  return notifyTele(msg, { skipNavigateDrift: true });
}

export function sendJobClosedIntent(title: string, company: string): Promise<void> {
  return notifyTele(`user closed job: ${title} at ${company}`, { skipNavigateDrift: true });
}

export function sendCardsDismissedIntent(): Promise<void> {
  return notifyTele("user tapped: cards");
}

export function sendInvalidOptionVoiceIntent(): Promise<void> {
  return notifyTele(
    "[SYSTEM] User spoke but did not select a valid option. " +
      "Please repeat the question and wait for a bubble selection."
  );
}
