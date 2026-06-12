import crypto from "node:crypto";

export function generateSubmissionId(): string {
  return crypto.randomUUID();
}

const SUBMISSION_PREFIX = "ws_";

export function formatSubmissionId(uuid: string): string {
  return `${SUBMISSION_PREFIX}${uuid.slice(0, 8)}`;
}
