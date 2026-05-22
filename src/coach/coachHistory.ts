// Reconstructs past coach conversations from the logged exchange records.
// The coach already persists every exchange to IndexedDB (db.coachLogs) for
// evals; this module regroups those rows into replayable conversations so the
// learner can revisit any past session for a problem.

import type { CoachExchangeRecord, CoachFeedback } from "../types";

/** One reconstructed turn — structurally matches CoachPanel's local Turn. */
export interface CoachHistoryTurn {
  role: "user" | "assistant";
  content: string;
  /** Links an assistant turn back to its eval record so rating still works. */
  exchangeId?: number;
  feedback?: CoachFeedback;
}

/** A past coach conversation for one problem, rebuilt from its exchanges. */
export interface CoachConversation {
  /** The conversationId shared by every exchange in this session. */
  id: string;
  startedAt: string;
  lastAt: string;
  /** Number of coach replies in the conversation. */
  exchangeCount: number;
  /** Short label for the history menu — the learner's first question. */
  preview: string;
  /** Full turn list, ready to drop straight into the panel. */
  turns: CoachHistoryTurn[];
}

const MAX_PREVIEW = 60;

function previewFor(records: CoachExchangeRecord[]): string {
  const firstUser = records.find((r) => r.userMessage && r.userMessage.trim())?.userMessage?.trim();
  if (!firstUser) return "Coach intro";
  return firstUser.length > MAX_PREVIEW ? `${firstUser.slice(0, MAX_PREVIEW - 1)}…` : firstUser;
}

/**
 * Group a problem's logged coach exchanges into conversations, newest first.
 * Each record is one exchange (an optional user turn plus the coach's reply),
 * so a conversation's turn list is just its records expanded in time order.
 */
export function groupCoachConversations(records: CoachExchangeRecord[]): CoachConversation[] {
  const byId = new Map<string, CoachExchangeRecord[]>();
  for (const record of records) {
    const group = byId.get(record.conversationId);
    if (group) group.push(record);
    else byId.set(record.conversationId, [record]);
  }

  const conversations: CoachConversation[] = [];
  for (const [id, group] of byId) {
    const ordered = [...group].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const turns: CoachHistoryTurn[] = [];
    for (const record of ordered) {
      if (record.userMessage) turns.push({ role: "user", content: record.userMessage });
      turns.push({
        role: "assistant",
        content: record.response,
        exchangeId: record.id,
        feedback: record.feedback
      });
    }
    conversations.push({
      id,
      startedAt: ordered[0].createdAt,
      lastAt: ordered[ordered.length - 1].createdAt,
      exchangeCount: ordered.length,
      preview: previewFor(ordered),
      turns
    });
  }

  conversations.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  return conversations;
}

/** Compact relative time for the history menu ("just now", "3h ago", "May 19"). */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMin = Math.floor((now.getTime() - then) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
