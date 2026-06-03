# Backlog

## Open Tasks

### Investigate desktop content reload/probe socket failures

Status: open

Context:
- The DSA Coach Next desktop app can be running and usable while external automation from this repo intermittently fails to reach the host URL from `~/Library/Application Support/DSA Coach Next/runtime.json`.
- Observed symptoms:
  - `bun run reload:content` failed with `FailedToOpenSocket` when posting to `/content/reload`.
  - Direct `curl` to `/content/status` could succeed around the same time.
  - Repeated external probes to `/catalog` or `/content/status` sometimes failed even though the UI remained healthy.
- Avoid treating this as an app availability failure until reproduced independently from the user-visible UI.

Finding:
- Reproduced on June 2, 2026 with the app running at `http://127.0.0.1:50500/`.
- Direct `curl -sS http://127.0.0.1:50500/content/status` succeeded.
- `bun -e "await fetch('http://127.0.0.1:50500/content/status')"` failed in the Codex command sandbox with `FailedToOpenSocket`.
- `node -e "fetch('http://127.0.0.1:50500/content/status')"` failed in the Codex command sandbox with `connect EPERM`.
- The same Bun fetch succeeded when run outside the command sandbox.
- Conclusion: at least this class of failure is a command-sandbox socket restriction on Bun/Node, not a desktop host failure.

Why it matters:
- Codex needs a reliable way to reload edited problem content without restarting the app.
- False negatives from the reload/probe path led to unnecessary app restarts.

Follow-up plan:
- Reproduce with the app left running and no forced restarts.
- Compare `bun` fetch behavior in `scripts/reload-content.ts` against `curl` for the same runtime URL.
- Check whether failures correlate with sandbox permissions, transient host startup timing, host process state, or the size/duration of `/catalog` responses.
- Add clearer diagnostics to the reload helper so it distinguishes socket/probe failure from actual desktop host failure.
- Prefer a non-invasive health check such as `/content/status` before any heavier catalog readback.
- For Codex-driven reloads, either run `bun run reload:content` outside the command sandbox or use a direct `curl` POST to the runtime URL.

Acceptance criteria:
- `bun run reload:content` reliably reloads content while the app is open.
- If reload cannot connect, the error message tells us whether the runtime file is stale, the host is down, or the local probe failed.
- Codex workflow no longer restarts the desktop app just because an external probe failed while the UI is healthy.
