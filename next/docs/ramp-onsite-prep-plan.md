# Ramp Onsite Prep Plan

Last updated: 2026-06-16.

Status: historical personal prep note. Relative date language in this file
refers to the June 17, 2026 onsite prep window; it is not current product setup
documentation.

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

Additional prep notes from Jun 16:

- Fritz's prep strategy: keep STAR setup short; put weight on action/result.
  Say the obvious engineering steps out loud because interviewers may read
  silence as a gap.
- Brian Kraus / Beacon call: Beacon is the strongest system deep-dive anchor.
  The story is not "notebooks in the cloud"; it is a production deployment
  through bank governance, security, data access, identity, logging, and vendor
  constraints.
- EDCI deck: useful secondary story for customer focus and regulatory workflow:
  lifecycle/acquisition marketing, audience segmentation controls, event-list
  MVP, CEI app, and measurable outcomes like 80% event-list cycle-time
  reduction and 65% to 80% CEI touchpoint improvement target.

## Session-by-Session Plan

### 12:30 - Design & Architecture with Jay

Primary system: First Republic Beacon / analytics platform.

Why this system:

- Enterprise users and real business workflows.
- Platform integration, security, vendor architecture, and operational pressure.
- Lets you talk about data quality, execution model, permissions, deployment,
  reliability, and stakeholder tradeoffs.

Opening structure:

1. Situation: a dozen analytics teams had fragmented desktop workflows, weak
   reproducibility, and governed-data access problems.
2. Users: 40-50 builders in notebooks, IDEs, dbt, scheduled Python jobs, and
   Glint apps; hundreds of internal consumers up to C-suite/board.
3. System: vendor appliance in bank-owned AWS VPC; ALB ingress; Ping/AD auth;
   per-user IDE shells; WMP batch engines; Snowflake/S3 PrivateLink; SQL/Mongo
   through Denodo where required.
4. Constraints: president-mandated vendor and Thanksgiving deadline; bank
   security, threat review, auditability, data governance, vendor AMI limits.
5. Impact: first-of-its-kind production deploy in about one month; 40-step
   threat review cleared; SSO, scheduled DB access, secure creds, Splunk, mail,
   Snowflake/SQL/Denodo success criteria met.

Deep dives to prepare:

- Execution model: Beacon Desktop -> IDE server -> isolated per-user shells;
  WMP scheduler/engine pool for distributed batch jobs.
- Data access: Denodo as broker for Mongo/most SQL; Snowflake/S3 via
  PrivateLink and endpoint policies; some SQL approved direct.
- Security/permissions: ALB cert termination, Ping -> AD group membership, JWT
  handoff, RBAC, Vault, KMS-CMK, CloudTrail, Trend Micro, Splunk forwarders.
- Governance: 40-step threat review; sign-offs from EA, Ops, InfoSec; success
  criteria written before "done" could drift.
- Tradeoffs: Denodo added latency but made production approvable; Aviatrix
  avoided owning a proxy/IP-list farm; boot-time agent install was pragmatic but
  less clean than golden images.
- Hindsight: delete bespoke S3 endpoint Lambda with modern org-native controls;
  move more governance glue to policy-as-code; pre-socialize reviews even more.

Do not present slides. Use a small mental diagram only if the conversation needs
orientation.

### 1:30 - Live Coding with Rohan and Christopher

Expected shape: no-AI practical backend coding. Treat this as the most likely
API/data-workflow round.

Warm-up drills:

- Hotel Reservation System.
- API Maze Crawler.
- Travel API Receipt Matching or Date Window Matching if you want one final API
  client pass, but do not over-index on more API clients tonight.

First drill to do tonight: Hotel Reservation System, strict no-AI mode.

Timebox:

- 5 min: contract, output shape, half-open interval invariant.
- 10 min: data model and indexes.
- 30 min: implement add/book/cancel/get/available/guest lookup.
- 10 min: edge tests and debugging.
- 5 min: explain production improvements.

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

- Hotel Reservation System.
- Progressive Task Manager APIs.
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

Two-sentence opener:

"My arc is engineer -> quant/PM -> CTO/CISO -> enterprise platform leader. The
through-line is that I build, I sit between technical and business, and I am
happiest close to the product/customer edge solving real problems for real
people."

Stories to have ready:

- Colchis rebuild: built trading, backtesting, analytics, ops, and infra stack
  while the fund grew from $100M to $1.4B AUM.
- First Republic analytics turnaround: inherited a failing team, rebuilt the
  function, deployed Beacon, improved executive analytics workflows.
- AI tooling/prep system: built realistic interview/problem-generation harness,
  local models, eval loops, and Realtime/Codex-based simulation.
- Dockett: fractional CTO building agent observability/control layer; use this
  to show current AI/product edge work, not as the main career story.

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

Calvin's Ramp/FDE model from the FDE event:

- FDE mandate is to win enterprise; the team is allowed to be creative.
- "Sword and shield": win hard enterprise deals while protecting the core
  roadmap from bespoke derailment.
- Kill the telephone game: put an engineer who knows the customer and codebase
  directly in the conversation.
- Meet finance users where they work; many do not code and live in Excel.
- Ramp stretches FDEs thin, so the job is high-leverage portfolio judgment, not
  becoming a dedicated consultant for one account.

Stories to have ready:

- First Republic stakeholder rescue: executive analytics or broken team
  turnaround, with numbers where possible.
- Beacon/vendor integration: balancing platform power, bank controls, security,
  and user adoption.
- Customer discovery / agent compliance work: moving from "seems useful" to
  real buyer pain, willingness to pay, and workflow evidence.
- EDCI partnership: cross-functional marketing/data/compliance partnership with
  concrete MVPs and regulatory constraints.

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

1. Do the Hotel Reservation System drill first, in no-AI interviewer mode.
2. Review the failed/passed test output and write the missed invariant in plain
   English.
3. Rehearse the Beacon design story for 45 minutes.
4. Write/rehearse 5 bullets each for Leo and Calvin.
5. Optional only if energy is good: one graph/dependency drill, not another API
   client.
6. Stop serious coding early enough to sleep.

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
