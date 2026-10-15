# Archived — do not treat as current

The 14 documents in this folder were moved out of `docs/` on 15 October 2026 after a rubric-compliance audit (see `docs/RUBRIC_COMPLIANCE_MATRIX.md`) found they describe a product that does not exist in this codebase.

## What's wrong with them

Most reference **"StudyMate"** — quizzes, mock exams, study materials, a localStorage-based study-companion subsystem — which was verified, this session, to not exist anywhere in `app/`, `components/`, `lib/`, or `config/`. Several also reference **"Gemini 3.6 Flash"** as the AI model (the real code uses `gemini-flash-lite-latest`/`gemini-3.5-flash-lite`) and call the product **"University Companion & Application Guidance"** (the real name is "University Course Application Guide").

Most cluster around 8–14 August 2026 and are attributed to an "Antigravity Autonomous Engineering Lead." A separate, independently-credible document already in the repo — `docs/superpowers/specs/2026-08-29-v2-codebase-audit-design.md` — documents this exact failure pattern happening once before: a pasted, AI-generated "rebuild prompt" that didn't describe the real repository was identified and rejected by the project owner on 29 August 2026. These 14 documents appear to be from the same origin.

## Archived files and the evidence found in each

| File | Evidence |
|---|---|
| `ARCHITECTURE.md` | "StudyMate", "University Companion", "Gemini 3.6 Flash" |
| `ENGINEERING_AUDIT.md` | "Gemini 3.6 Flash"; author "Antigravity Autonomous Engineering Lead" |
| `SECURITY_REVIEW.md` | "StudyMate" |
| `TESTING.md` | "StudyMate" |
| `AI_ARCHITECTURE.md` | "StudyMate", "Gemini 3.6 Flash" |
| `UCAG_CURRENT_STATE_AUDIT.md` | "StudyMate", "Gemini 3.6 Flash" |
| `FINAL_IMPLEMENTATION_AUDIT.md` | "StudyMate", "University Companion" |
| `FINAL_PROJECT_AUDIT.md` | "StudyMate", "Gemini 3.6 Flash" |
| `PHASE_2_GAP_ANALYSIS.md` | "StudyMate" |
| `ANTIGRAVITY_HANDOVER_REPORT.md` | "Gemini 3.6 Flash"; author "Antigravity Autonomous Engineering Lead" |
| `FINAL_COMPLETION_REPORT.md` | "StudyMate", "Gemini 3.6 Flash" |
| `PERFORMANCE_AUDIT.md` | "StudyMate" (cites specific bundle-size figures for StudyMate pages that don't exist) |
| `UCAG_ANALYSIS.md` | "Gemini 3.6 Flash" |
| `FINAL_ENGINEERING_REPORT.md` | No direct string match found, but same author ("Antigravity Autonomous Engineering Lead"), same "Version 6.0" labeling, and same 2026-08-08 date as `ENGINEERING_AUDIT.md` (confirmed fabricated) — archived on that basis; treat with slightly lower confidence than the others above if you want to double-check it yourself. |

## What was *not* archived, and why

- **`PROJECT_STATUS.md`** and **`MASTER_HANDOVER_AND_REMAINING_WORK.md`** (both dated 23 September 2026) each mention "StudyMate" exactly once — in an explicit "things that should NOT be added" / "product scope that should remain excluded" list. That's the *correct* thing for a doc to say, not a fabrication — they were kept as current, trustworthy documentation.
- **`AUTH_UI_REDESIGN_AUDIT.md`** was checked for the same red flags and none were found, but it wasn't independently verified feature-by-feature either. It's still in `docs/`, genuinely unresolved — don't assume it's accurate just because it survived this pass; also don't assume it's wrong.

## What to do with these files

They're kept (not deleted) for historical reference via `git mv`, so `git log --follow` still shows their full history. If none of them turn out to have any salvageable real content on a closer read, they can be deleted outright in a future pass — that's your call, not something this audit did unprompted.
