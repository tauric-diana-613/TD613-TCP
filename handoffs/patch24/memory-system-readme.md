# TCP Project Memory

This folder is the memory system for the TCP project. It tracks patches, sessions, and workflow plans so nobody has to re-derive context from scratch.

We are all neurodivergent. We forget things. That's why this folder exists.

---

## The 5 Files

| File | What It Does | When You Touch It |
|---|---|---|
| `session-memory-schema.json` | Defines the shape of a session memory file. | Never, unless you're changing the schema itself. |
| `session-memory-scraper.md` | Instructions for extracting a session memory from a work session. | Read this when a session ends and you need to capture what happened. |
| `workflow-planner.md` | Instructions for turning session memories into a plan for the next session. | Read this when you're starting a new session and need structure. |
| `workflow-plan-schema.json` | Defines the shape of a workflow plan file. | Never, unless you're changing the schema itself. |
| `collective.json` | Shared pattern memory across sessions. Starts empty, accumulates over time. | The system writes to this. You read it when patterns emerge. |

---

## How It Works

```
End of session:
  1. Run the scraper (session-memory-scraper.md)
  2. It produces a session-memory JSON file
  3. Save it here

Start of next session:
  1. Feed session memory file(s) to the planner (workflow-planner.md)
  2. It produces a workflow plan JSON file
  3. Follow the plan (or don't, but at least you had one)

Repeat forever:
  Session Memory → Workflow Plan → Work → Session Memory → ...
```

---

## File Naming

Session memories: `session-memory_YYYY-MM-DD_HHmm_{project-slug}.json`

Workflow plans: `workflow-plan_YYYY-MM-DD_HHmm_{project-slug}.json`

Example:
```
session-memory_2026-03-20_0000_tcp-stylometry.json
workflow-plan_2026-03-21_1400_tcp-stylometry.json
```

---

## Reminders

- **After every session**: run the scraper. If you skip this, the next session costs double because you're re-deriving context.
- **Before every session**: check the last session memory. It has a `continuity.context_packet` field that's literally a < 500 word summary of where you left off.
- **The schemas are the source of truth**. If a JSON file doesn't validate against its schema, something went wrong during capture.
- **collective.json starts empty**. That's fine. It fills up as the system spots recurring patterns across sessions.
- **Don't delete old session memories**. They form a timeline. The workflow planner reads the history to spot energy patterns, scope creep, and deferred items piling up.

---

## Quick Reference: What Goes Where

| You want to... | Go to... |
|---|---|
| Remember what happened last session | Latest `session-memory_*.json` → `continuity.context_packet` |
| See what decisions were made | Latest `session-memory_*.json` → `work.decisions` |
| Check what's still open | Latest `session-memory_*.json` → `work.open_questions` |
| Plan the next session | Feed memory files to `workflow-planner.md` |
| Understand the schema fields | `session-memory-schema.json` or `workflow-plan-schema.json` |
| See if there are recurring patterns | `collective.json` |
