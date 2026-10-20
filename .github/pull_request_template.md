## What

<!-- What changes and why. Link the issue: Closes #123 -->

## How to test

<!-- Steps or commands a reviewer can run. -->

## Checklist

- [ ] Tests added or updated (unit for `core`, integration for API behaviour, E2E for user journeys)
- [ ] Works **with and without AI** (AI-only UI is locked, not hidden; API returns `AI_NOT_CONFIGURED`)
- [ ] New strings added to `apps/web/messages/en.json` **and** `es.json`
- [ ] Schema change? Migration generated with `pnpm db:generate` and committed
- [ ] No secrets, keys or personal data in code, logs or fixtures
