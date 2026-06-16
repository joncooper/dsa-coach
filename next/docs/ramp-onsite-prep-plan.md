# Ramp Onsite Prep Plan

Last updated: 2026-06-16.

This is the short working plan for the Ramp virtual onsite on Wednesday,
June 17, 2026. Keep this file practical: schedule, expected signal, drills,
and talking points.

## Confirmed Schedule

All times are Eastern.

| Time | Session | Interviewer(s) | Prep focus |
| --- | --- | --- | --- |
| 12:30-1:30 | Forward Deployed Design & Architecture | Jay Greenblatt | Real system deep dive, tradeoffs, architecture judgment |
| 1:30-2:30 | Live Coding | Rohan Reddy, Christopher Nguyen | No-AI backend coding; likely practical API/data workflow |
| 2:30-3:00 | Break |  | Reset, notes, water |
| 3:00-4:00 | Live Coding | Nicholas Healey | No-AI backend coding; likely ambiguous practical problem |
| 4:00-4:30 | Break |  | Reset for behavioral/HM rounds |
| 4:30-5:00 | Hiring Manager final round | Leo Mehr | Career arc, self-directed ownership, intensity, AI workflow |
| 5:00-5:30 | Hiring Manager final round | Calvin Lee | Customer focus, stakeholder judgment, specificity, numbers |

## Recruiter Guidance

Morgan's prep call said:

- The two live coding rounds are no-AI.
- They are practical backend financial workflow problems, not LeetCode.
- One coding round may involve interacting with an API programmatically:
  HTTP-style requests, JSON parsing, logs, debugging, and recovery.
- The other coding round may include intentional ambiguity:
  state assumptions out loud, converge with the interviewer, validate output.
- Evaluation is not just final correctness: investigation approach, debugging,
  recovery, code quality, and communication all matter.
- Prior AI coding feedback was strong overall, but there was one flag:
  edge-case discovery leaned too much on AI. In the no-AI rounds, generate
  edge cases yourself and say them out loud.
- Design round should be conversational, not a slide presentation.
- For design, pick a real system with users, constraints, tradeoffs, and
  hindsight.
- Leo is looking for engineers who act without being asked, handle ambiguity,
  and have concrete intensity stories.
- Calvin will push for customer specificity and numbers. The signal is whether
  you surface the right customer problem, not only whether you execute the
  stated request.

## Session-by-Session Plan

### 12:30 - Design & Architecture with Jay

Primary system: First Republic Beacon / analytics platform.

Why this system:

- Enterprise users and real business workflows.
- Platform integration, security, vendor architecture, and operational pressure.
- Lets you talk about data quality, execution model, permissions, deployment,
  reliability, and stakeholder tradeoffs.

Opening structure:

1. Situation: analytics/data workflow was fragmented and unreliable.
2. Users: analysts, executives, analytics engineers, platform/security owners.
3. System: containerized/dbt-style execution on Beacon, data warehouse,
   libraries, testing harness, deployment and access controls.
4. Constraints: bank security, vendor integration, auditability, team maturity,
   executive pressure.
5. Impact: speed, repeatability, reduced manual work, clearer ownership.

Deep dives to prepare:

- Execution model: how jobs ran, how failures surfaced, and how users interacted.
- Data quality: tests, lineage, validation, release confidence.
- Security/permissions: access boundaries, vendor/platform risk, audit posture.
- Team/process: turning an ad hoc group into a repeatable engineering function.
- Hindsight: what you would simplify, automate, or make more self-service.

Do not present slides. Use a small mental diagram only if the conversation needs
orientation.

### 1:30 - Live Coding with Rohan and Christopher

Expected shape: no-AI practical backend coding. Treat this as the most likely
API/data-workflow round.

Warm-up drills:

- API Maze Crawler.
- Hotel Reservation System.
- Travel API Receipt Matching or Date Window Matching if you want one final API
  client pass, but do not over-index on more API clients tonight.

Operating loop:

1. Restate contract and output shape.
2. Ask 1-2 clarifying questions only where behavior is materially ambiguous.
3. Name the state/indexes before coding.
4. Write a small, correct MVP first.
5. Add edge cases explicitly: empty input, missing records, duplicates,
   ordering, invalid ranges, one-to-one assignment, retries only if specified.
6. Run visible tests.
7. Debug from observed output, not guesses.

Things to say out loud:

- "I want the invariant to be..."
- "This index makes lookup cheap because..."
- "The boundary rule is..."
- "This failed case tells me the bug is in matching/order/state cleanup."

### 3:00 - Live Coding with Nicholas

Expected shape: no-AI backend coding with more ambiguity. Treat this as a
stateful system/data-model round.

Best drills:

- Progressive Task Manager APIs.
- Hotel Reservation System.
- A dependency graph problem: spreadsheet formulas, task dependencies, or URL
  graph traversal with visited state.

Operating loop:

1. Choose the data model deliberately.
2. Write helper methods around state transitions.
3. Keep mutation paths centralized.
4. Preserve determinism: sorting, creation order, tie breaks.
5. Handle invalid operations without corrupting state.

Watch-outs:

- Do not let convenience object modeling hide required indexes.
- Do not delete records if later operations need to know they existed.
- Separate "active/current" from "historical/existed" when the spec implies it.
- For interval problems, state whether endpoints are closed or half-open.

### 4:30 - Hiring Manager with Leo

Core message:

You are a senior engineer who finds ambiguous business-critical problems,
builds the operating model, and uses AI aggressively while still owning the
technical judgment.

Stories to have ready:

- Colossus rebuild: broken Python/Django trading system to reliable trading,
  backtesting, data infra, and later Go engine.
- First Republic analytics turnaround: inherited a failing team, rebuilt the
  function, deployed Beacon, improved executive analytics workflows.
- AI tooling/prep system: built realistic interview/problem-generation harness,
  local models, eval loops, and Realtime/Codex-based simulation.

Signals Leo is likely testing:

- Self-directed action without waiting for permission.
- Comfort in ambiguity.
- Intensity under pressure.
- AI-native workflow without outsourcing judgment.
- Career progression as expanding scope, not just title progression.

Questions to ask Leo:

- Which product area is this FDE role most likely to attach to?
- How does Ramp decide when FDE work becomes core platform work?
- How is agentic development changing the FDE team's scope?

### 5:00 - Hiring Manager with Calvin

Core message:

You do not just build the requested thing. You identify the real customer or
stakeholder problem, quantify the impact, and choose the right level of
engineering investment.

Stories to have ready:

- First Republic stakeholder rescue: executive analytics or broken team
  turnaround, with numbers where possible.
- Beacon/vendor integration: balancing platform power, bank controls, security,
  and user adoption.
- Customer discovery / agent compliance work: moving from "seems useful" to
  real buyer pain, willingness to pay, and workflow evidence.

Signals Calvin is likely testing:

- Customer EQ.
- Specificity under pressure.
- Ability to handle a difficult stakeholder.
- Business impact, not only technical elegance.

Questions to ask Calvin:

- What separates a great FDE from a merely helpful one at Ramp?
- Where do enterprise customer needs most often expose platform gaps?
- How does Ramp balance bespoke customer work with long-term product leverage?

## Today Plan

Priority order:

1. Rehearse the Beacon design story for 45 minutes.
2. Do one 55-minute no-AI coding drill.
3. Do the Hotel Reservation System problem as the design-heavy coding drill.
4. Write 5 bullets each for Leo and Calvin.
5. Stop serious coding early enough to sleep.

## Tomorrow Warm-Up

Before 12:30:

1. Re-read this plan.
2. Re-read the Beacon architecture bullets.
3. Do a 20-minute warm-up only: small API pagination or interval matching.
4. Stop coding at least 30 minutes before the first interview.

## Coding Round Checklist

Use this before every no-AI round:

- Contract: exact input, exact output, ordering.
- State: what maps/lists/classes exist and why.
- Invariants: one sentence before coding.
- Edge cases: empty, invalid, duplicates, missing ids, ordering, ties.
- Complexity: define what `n` means.
- Tests: visible first, then one custom mental case.
- Debugging: inspect actual output, then change one thing.

## Design Round Checklist

Use this before Jay:

- Users and use cases.
- Core entities and flows.
- Storage/execution model.
- Scale and reliability constraints.
- Security and permissions.
- Observability and operations.
- Tradeoffs and alternatives.
- What went wrong.
- What you would change now.
- Business impact.

