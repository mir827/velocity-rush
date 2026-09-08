# Coding Agent Guide

Behavioral guidelines for reducing common coding-agent mistakes. Project-specific instructions take priority when they conflict with this guide.

These guidelines are adapted from the community's Karpathy-inspired coding-agent guide:
https://github.com/multica-ai/andrej-karpathy-skills

**Tradeoff:** Favor care over speed for non-trivial work. Use proportionate judgment for obvious, low-risk edits.

## 1. Think Before Coding

Do not assume or hide confusion. Surface meaningful assumptions and tradeoffs before implementation.

- State assumptions that materially affect the result.
- Present multiple interpretations when the choice changes the outcome.
- Ask a concise clarifying question only when guessing would create real risk.
- If the task is clear and low-risk, state the assumption briefly and proceed.
- Point out a simpler approach or push back when the proposed scope is unnecessarily large.

## 2. Simplicity First

Write the minimum code that solves the current request. Add nothing speculative.

- Do not add unrequested features, configurability, or dependencies.
- Do not create an abstraction for a single use.
- Prefer a direct implementation over premature architecture.
- If the solution is much larger than the problem requires, simplify it.

## 3. Surgical Changes

Touch only what the task requires and clean up only consequences of your own change.

- Match the project's existing style and patterns.
- Do not reformat, rename, refactor, or "improve" unrelated code.
- Preserve comments and code you do not fully understand.
- Remove imports, variables, or helpers made unused by your change.
- Mention unrelated issues separately instead of including them in the patch.

Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

Turn the request into a checkable outcome and verify it before reporting completion.

- Bug fix: reproduce the failure, then verify the expected behavior.
- Feature: define the observable behavior the user should see.
- Refactor: verify behavior before and after the change.
- Review: report concrete risks, regressions, and missing tests.
- For multi-step work, use a short plan with a validation method for each step.
- Use the narrowest meaningful verification available.
- If a relevant check cannot be run, say exactly what remains unverified and why.

## Completion Standard

The guide is working when diffs stay focused, implementations remain simple, material ambiguity is resolved before coding, and completion claims include evidence.

# Frontend Coding Profile

Apply this profile only to frontend code. Existing project conventions, supported browser targets, framework versions, and design-system rules take priority.

## Project Discovery

- Read `package.json`, lockfiles, framework configuration, TypeScript configuration, lint/format settings, and existing tests before choosing patterns or commands.
- Use the package manager and scripts already selected by the project.
- Match the installed framework version; do not introduce APIs from a newer version without an explicit upgrade task.
- Reuse the existing component library, styling system, routing, data-fetching, and state-management patterns.

## UI Implementation

- Build semantic HTML first and add ARIA only where native semantics are insufficient.
- Preserve keyboard navigation, focus behavior, screen-reader labels, reduced-motion preferences, responsive layouts, and supported color schemes.
- Keep state close to its owner. Add shared state or a new dependency only when the project has a demonstrated need.
- Keep components focused, but do not split them solely to satisfy an arbitrary size rule.
- Treat loading, empty, error, disabled, and success states as part of the requested user flow.
- Keep secrets and privileged authorization decisions out of browser code.

## Verification

- Run the project's existing format, lint, type-check, unit/component, and build commands relevant to the change.
- Test observable user behavior rather than component internals.
- For visual or interaction changes, verify keyboard use, narrow and wide layouts, and the exact affected flow in a browser when tools allow.
- Do not claim performance improvements without measurement.

## Sources

- https://github.com/github/awesome-copilot
- https://github.com/PatrickJS/awesome-cursorrules

## Project
Original vanilla JavaScript canvas platformer. Static GitHub Pages site. Keep all assets original and dependencies minimal.
