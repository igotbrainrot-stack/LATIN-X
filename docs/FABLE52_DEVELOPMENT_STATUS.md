# Development status — master directive of 15 November 2026

Kept current while working on branch `ui/premium-redesign-20261115`. Last updated: 15 November 2026,
at the point the pull request was opened.

## Stages

| Stage | Status | Notes |
| --- | --- | --- |
| A. Inspect repository, PR stack, open decisions | Done | Live tip of PR #19 confirmed as `e442e15`; no newer branch. |
| B. Baseline | Done | Every suite passed on the base before any change. |
| C. Bug audit and repairs | Done | 10 fixed with tests, 7 recorded for the owner. `BUG_AUDIT.md`. |
| D. Interface redesign | Done | Tokens, two typefaces, light and dark, Home, reader, exercises, Words with glossary, Progress, Settings, games, Picture Practice. `DESIGN_SYSTEM.md`. |
| E. Audio subsystem | Done (interface only) | Audio strip states and labels, Sound popover. No media, catalogue or approval change. |
| F. Verification | Done in a cloud container | `TEST_REPORT.md`. Real Windows 11 and Linux Mint not run. |
| G. Documentation and delivery | Done | README, design system, bug audit, test report, handover, changelog, this file; one branch, one pull request. |

## Decisions taken

- Base: the tip of PR #19, so the installer system is included and untouched.
- Home is the first screen; Home and Settings are views, not saved sections.
- Display settings are stored in `ui.display` inside the existing v5 profile. No migration was needed because the field is optional.
- New interface wording is English. Existing Latin labels were kept; none were added.
- The interface typeface is Source Sans 3, bundled under the OFL.
- Work was done in one session without sub-agents.

## Not done, and why

- Real-device testing on Windows 11 and Linux Mint: not possible from this environment.
- Screen-reader testing: not possible from this environment.
- Splitting `app/legacy-runtime.js` into modules: not needed for the redesign and risky against the content-lock tests.
- Owner decisions (recordings for Chapters II–VIII, "Recordātiō incepta", LX-020 to LX-025, region chip labels): left exactly as they were.

## Git

- No merge to `main`, no change to PRs #1, #12, #14–#19, no release, no force-push.
- The pull request targets `release/easy-install-20261111`.
