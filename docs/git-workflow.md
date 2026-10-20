# Git workflow

SaveSphere uses **trunk-based development**: one long-lived branch (`main`), short-lived topic
branches, squash-merged pull requests, and automatic deployment of every green commit on `main`.

Why not Git Flow (`develop`, `release/*`, `hotfix/*`)? It was designed for versioned, shipped
software with parallel releases. A web app deployed continuously from one branch gets nothing from
it except merge overhead and drift between `develop` and `main`.

## Branches

| Branch                                              | Lifetime         | Purpose                                              |
| --------------------------------------------------- | ---------------- | ---------------------------------------------------- |
| `main`                                              | permanent        | Always deployable. Every push deploys to production. |
| `feat/<short-desc>`                                 | hours to ~3 days | New functionality: `feat/quick-add-sheet`            |
| `fix/<short-desc>`                                  | hours            | Bug fixes: `fix/transfer-rounding`                   |
| `chore/…`, `docs/…`, `refactor/…`, `test/…`, `ci/…` | short            | Everything else                                      |

Rules of thumb:

- Branch from the latest `main`; rebase on `main` instead of merging `main` into your branch.
- Keep branches small. A large feature ships as several PRs, with unfinished UI hidden behind a
  flag or an unlinked route.
- Delete the branch after merging (GitHub can do it automatically).
- Optional: add an issue number, e.g. `feat/42-quick-add-sheet`.

> **Adding a staging environment later:** keep trunk-based. Deploy `main` to staging automatically,
> and promote to production by pushing a tag (`v1.4.0`) or approving the `production` environment.
> Don't add a `develop` branch for it.

## Commits and PR titles: Conventional Commits

PRs are **squash-merged**, so the **PR title becomes the commit on `main`**. The `PR title`
workflow enforces the format:

```
<type>(<optional scope>): <imperative summary>

feat(web): add quick-add bottom sheet
fix(api): reject transfers between the same account
build(deps): bump drizzle-orm to 0.46
```

Types: `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `build`, `ci`, `chore`, `revert`.
Scopes: `web`, `api`, `core`, `contracts`, `db`, `e2e`, `infra`, `deps`.
Add `!` for breaking changes (`feat(api)!: …`).

Commits inside a branch can be as messy as you like, because they get squashed.

## Pull requests

1. Push your branch and open a PR to `main`. Use a draft PR for early feedback.
2. CI runs: lint, typecheck, build, unit/component/integration tests, and E2E against production
   images.
3. Fill in the PR template checklist (tests, with/without AI, i18n strings, migrations).
4. Squash and merge once it's green. The `publish` job pushes images and deploys.

Solo-maintainer note: GitHub doesn't let you approve your own PR. Still open PRs, because they are
what triggers CI and keeps history readable. Set required approvals to **0** until a second
contributor joins.

## Setting up branch protection (GitHub → Settings)

Use a **ruleset**: **Settings → Rules → Rulesets → New branch ruleset**.

- **Name:** `main`
- **Enforcement status:** Active
- **Bypass list:** empty. If you must, add yourself as _"For pull requests only"_, never _"Always"_.
- **Target branches:** _Include default branch_
- **Rules:**
  - ✅ Restrict deletions
  - ✅ Block force pushes
  - ✅ Require linear history (works together with squash merging)
  - ✅ Require a pull request before merging
    - Required approvals: `0` while solo, `1` once there's a second contributor
    - ✅ Dismiss stale pull request approvals when new commits are pushed
    - ✅ Require conversation resolution before merging
    - Allowed merge methods: **Squash** only
  - ✅ Require status checks to pass
    - ✅ Require branches to be up to date before merging
    - Add these checks (they appear after CI has run once on a PR):
      `Lint, typecheck & build`, `Unit & integration tests`, `E2E (production images)`,
      `conventional-commit`

Then under **Settings → General → Pull Requests**:

- Allow **squash merging** only (uncheck merge commits and rebase merging)
- Default commit message: **Pull request title**
- ✅ Always suggest updating pull request branches
- ✅ Automatically delete head branches

Under **Settings → Environments → New environment → `production`**:

- Optional: **Required reviewers** (yourself), so every deploy waits for a click
- Add the secrets `COOLIFY_WEBHOOK_URL` and `COOLIFY_TOKEN` here (see [deployment](deployment.md))

Also turn on **Settings → Code security**: Dependabot alerts, Dependabot security updates, and
secret scanning with push protection.

## Releases and versioning

Every merge to `main` is a release, and deployed images are tagged with the commit SHA (plus
`latest`). If you want human-readable versions later, add **release-please**: it reads the
Conventional Commits, opens a release PR with a changelog, and tags `vX.Y.Z` when merged.

## Rolling back

- **Fast:** in Coolify, set `IMAGE_TAG` to a previous commit SHA and redeploy.
- **Proper:** `git revert <sha>` in a PR. Merging it redeploys.
- **Database:** migrations only move forward. Write them so the previous release still works
  (expand → migrate data → contract in a later release). Never edit a migration that has already
  been merged.

## Day-to-day example

```bash
git switch main && git pull
git switch -c feat/quick-add-sheet
# …work, commit as often as you like…
pnpm lint && pnpm check && pnpm test
git push -u origin feat/quick-add-sheet
# open the PR "feat(web): add quick-add bottom sheet", wait for green, squash and merge
git switch main && git pull && git branch -d feat/quick-add-sheet
```
