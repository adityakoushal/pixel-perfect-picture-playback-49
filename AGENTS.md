<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Budget amounts are always computed in code (`src/features/budget/allocate.ts`), never by the AI — guarantees exact sums.
- AI calls run only in server code (`src/services/ai.server.ts`, loaded inside `plan.functions.ts` handler); AI output is validated with `parsePlanContent` before use.
- Plans persist in browser localStorage via `src/services/plan-storage.ts` (no backend) — demo-friendly, no accounts.
- Demo mode (`demo-engine.ts`) must stay deterministic and clearly labelled as not using AI.
