/**
 * Pure client-side “smart” helpers — no external APIs.
 */

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "for",
  "of",
  "in",
  "on",
  "with",
  "my",
  "our",
  "your",
  "is",
  "are",
  "be",
  "by",
  "at",
  "from",
]);

/** Keyword → sub-task templates. `{topic}` is replaced with cleaned title fragment. */
const RULES: { match: RegExp; templates: string[] }[] = [
  {
    match: /\b(design|ui|ux|figma|wireframe)\b/i,
    templates: [
      "Research references for {topic}",
      "Draft low-fidelity wireframes",
      "Create high-fidelity mockups",
      "Collect design feedback",
    ],
  },
  {
    match: /\b(api|backend|endpoint|server)\b/i,
    templates: [
      "Define request/response schema",
      "Implement {topic} endpoint",
      "Add validation and error handling",
      "Write integration tests",
    ],
  },
  {
    match: /\b(bug|fix|issue|error)\b/i,
    templates: [
      "Reproduce the issue reliably",
      "Identify root cause",
      "Implement the fix",
      "Verify with regression checks",
    ],
  },
  {
    match: /\b(deploy|release|launch|ship)\b/i,
    templates: [
      "Prepare release checklist",
      "Run final QA pass",
      "Deploy to production",
      "Monitor post-release health",
    ],
  },
  {
    match: /\b(meeting|call|standup|sync)\b/i,
    templates: [
      "Prepare agenda for {topic}",
      "Send calendar invite",
      "Take notes during the session",
      "Share action items afterward",
    ],
  },
  {
    match: /\b(write|blog|doc|docs|documentation|readme)\b/i,
    templates: [
      "Outline sections for {topic}",
      "Write first draft",
      "Edit for clarity and tone",
      "Publish and share link",
    ],
  },
  {
    match: /\b(test|qa|testing)\b/i,
    templates: [
      "List critical test cases",
      "Write automated tests",
      "Run manual QA checklist",
      "Log and prioritize findings",
    ],
  },
  {
    match: /\b(refactor|cleanup|clean up)\b/i,
    templates: [
      "Map current structure for {topic}",
      "Apply incremental refactors",
      "Update related tests",
      "Document what changed",
    ],
  },
  {
    match: /\b(marketing|campaign|launch plan)\b/i,
    templates: [
      "Define audience and goal",
      "Draft messaging for {topic}",
      "Prepare creative assets",
      "Schedule and track results",
    ],
  },
  {
    match: /\b(research|investigate|analyze|analysis)\b/i,
    templates: [
      "Gather sources for {topic}",
      "Summarize key findings",
      "Compare options and trade-offs",
      "Recommend next steps",
    ],
  },
];

const DEFAULT_TEMPLATES = [
  "Clarify scope for {topic}",
  "Break work into concrete steps",
  "Implement the core of {topic}",
  "Review and mark {topic} complete",
];

function cleanTopic(title: string): string {
  const trimmed = title.trim().replace(/\s+/g, " ");
  if (!trimmed) return "this task";
  // Prefer shorter topic phrase for templates
  return trimmed.length > 48 ? `${trimmed.slice(0, 45)}…` : trimmed;
}

function applyTemplate(template: string, topic: string): string {
  return template.replaceAll("{topic}", topic);
}

/**
 * Suggest 3–4 sub-tasks from the parent title using keyword rules.
 */
export function suggestSubTasks(title: string, count = 4): string[] {
  const topic = cleanTopic(title);
  const matched = RULES.find((rule) => rule.match.test(title));
  const templates = matched?.templates ?? DEFAULT_TEMPLATES;

  const suggestions = templates
    .slice(0, Math.max(3, Math.min(count, templates.length)))
    .map((t) => applyTemplate(t, topic));

  // De-dupe while preserving order
  return [...new Set(suggestions)].slice(0, count);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

/**
 * Suggest existing task titles similar to the current input (client-side).
 */
export function suggestSimilarTitles(
  input: string,
  existingTitles: string[],
  limit = 5
): string[] {
  const q = input.trim().toLowerCase();
  if (q.length < 2) return [];

  const qTokens = tokenize(q);
  const seen = new Set<string>();
  const scored: { title: string; score: number }[] = [];

  for (const title of existingTitles) {
    const normalized = title.trim();
    if (!normalized || seen.has(normalized.toLowerCase())) continue;
    seen.add(normalized.toLowerCase());

    const lower = normalized.toLowerCase();
    if (lower === q) continue;

    let score = 0;
    if (lower.startsWith(q)) score += 5;
    if (lower.includes(q)) score += 3;

    const tokens = tokenize(lower);
    const overlap = qTokens.filter((t) => tokens.includes(t)).length;
    score += overlap * 2;

    if (score > 0) {
      scored.push({ title: normalized, score });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map((item) => item.title);
}

/**
 * Productivity score 0–100.
 * Formula: (completed / total) × 100, with light bonus for low overdue open work.
 */
export function calculateProductivityScore(input: {
  totalTasks: number;
  completedTasks: number;
  overdueOpenTasks?: number;
}): {
  score: number;
  label: string;
  tone: "empty" | "low" | "medium" | "high";
} {
  const { totalTasks, completedTasks, overdueOpenTasks = 0 } = input;

  if (totalTasks === 0) {
    return { score: 0, label: "No tasks yet", tone: "empty" };
  }

  let score = Math.round((completedTasks / totalTasks) * 100);

  // Soft penalty: each open overdue task trims a few points (client-only heuristic)
  if (overdueOpenTasks > 0) {
    score = Math.max(0, score - Math.min(20, overdueOpenTasks * 3));
  }

  let label = "Keep going";
  let tone: "empty" | "low" | "medium" | "high" = "low";

  if (score >= 80) {
    label = "Excellent focus";
    tone = "high";
  } else if (score >= 50) {
    label = "Solid progress";
    tone = "medium";
  } else if (score > 0) {
    label = "Room to improve";
    tone = "low";
  } else {
    label = "Just getting started";
    tone = "low";
  }

  return { score, label, tone };
}
