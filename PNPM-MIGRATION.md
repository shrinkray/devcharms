# npm → pnpm migration: devcharms

**Repo:** `/Users/gregor/Code/REPOS/devcharms` — `git@github.com:shrinkray/devcharms.git`
**Status:** planned, **blocked on §1** until the postinstall shim is resolved.
Written 2026-08-13.

Companion to `PNPM-MIGRATION.md` (shrink-ray-labs). The general method — two commits,
`pnpm import` first, verification gates, rollback — is identical and not repeated here.
**This document covers only what differs.** Read the skill's discovery section, then this.

---

## 0. Summary

Good news first: this repo is **not in the Shai-Hulud blast radius at all.** 842 packages,
and `keyv`, `cacheable`, `flat-cache`, `file-entry-cache` are absent entirely — not old
versions, simply not present. Both `overrides` bind correctly today (`lodash@4.17.23`,
`tmp@0.2.5`).

It is also structurally simpler than shrink-ray-labs in the way that matters most: **there
is no ESLint.** No `.eslintrc.*`, no `eslint.config.*`, no eslint dependency. The
plugin-resolution breakage that will definitely bite shrink-ray-labs cannot happen here.
Formatting is Prettier only, via lint-staged.

Then the bad news, which is §1.

|                        | shrink-ray-labs                         | devcharms                                                     |
| :--------------------- | :-------------------------------------- | :------------------------------------------------------------ |
| Astro                  | 7.2                                     | 7.1                                                           |
| Tailwind               | v4, `@tailwindcss/vite`                 | **v3, PostCSS** (`tailwind.config.cjs`, `postcss.config.cjs`) |
| React                  | 19                                      | **18**                                                        |
| ESLint                 | 8, eslintrc                             | **none**                                                      |
| Git hooks              | none                                    | **husky 8 + lint-staged**                                     |
| Own lifecycle scripts  | none                                    | **`prepare` + `postinstall`** ← the problem                   |
| Host config in repo    | `wrangler.jsonc`                        | **none — host unknown**                                       |
| `.nvmrc`               | 22.22.2                                 | **26.3.0** (vs `engines: >=22.12.0`)                          |
| `packageManager` field | npm@10.9.0                              | absent                                                        |
| Blast radius           | clean, but only via ESLint 8's old pins | clean outright                                                |
| Overrides to migrate   | `path-to-regexp`, `svgo`                | `lodash`, `tmp`                                               |

---

## 1. Blocker: the postinstall Vite shim

```json
"postinstall": "node scripts/ensure-vite-env-shim.mjs"
```

That script fabricates a package that does not exist:

```js
const shimDir = path.join(root, "node_modules", "@vite", "env");
await fs.mkdir(shimDir, { recursive: true });
// writes package.json + index.mjs re-exporting "vite/dist/client/env.mjs"
```

**This works under npm by accident, and pnpm removes the accident.**

npm gives you a flat `node_modules/`, and Node's resolution algorithm walks _up_ the
directory tree looking for `node_modules/`. So when something inside
`node_modules/vite/…` imports the bare specifier `@vite/env`, Node walks up, finds
`<root>/node_modules/@vite/env`, and resolves it. The hand-written directory is reachable
from everywhere precisely because npm's layout is flat.

pnpm's isolated layout breaks that chain. Vite lives at
`node_modules/.pnpm/vite@8.1.5/node_modules/vite/`, and Node's upward walk from there
hits `node_modules/.pnpm/vite@8.1.5/node_modules/` — which contains only Vite's own
_declared_ dependencies. `@vite/env` is not one of them, so resolution fails there and
never reaches the project root.

The shim will still be _written_. It will simply stop being _found_. Nothing will error at
install time; whatever bug it was papering over comes back, probably at dev-server or
build time, possibly only in one code path.

**Do not start the migration until you know what this shim is for.** Concretely, before
Phase 0:

```bash
cd /Users/gregor/Code/REPOS/devcharms
git log --oneline -- scripts/ensure-vite-env-shim.mjs
git log -1 --format=%B $(git log --format=%H -n1 -- scripts/ensure-vite-env-shim.mjs)
```

The commit message should say what broke. Then test whether it is still needed at all —
it was added against an older Vite, and this repo is now on **Vite 8.1.5**:

```bash
# on a scratch branch, npm still in place
node -e "delete require('fs')" 2>/dev/null   # no-op, just a reminder to work on a branch
rm -rf node_modules/@vite
npm run build && npm run dev    # exercise both; the shim targets the dev client
```

Three outcomes, three plans:

**(a) No longer needed.** Most likely, given the Vite 8 jump. Delete the script and the
`postinstall` line in a _separate commit before_ the pnpm work. This is the best case and
makes devcharms genuinely the easy migration.

**(b) Still needed, and it's a real missing dependency.** Then declare it properly rather
than fabricating it. If some package imports `@vite/env` without declaring it, that is
what `publicHoistPattern` exists for — or a `pnpm.packageExtensions` entry adding the
missing dependency to the offending package's manifest, which is the correct fix and
survives reinstalls:

```yaml
packageExtensions:
  some-offending-pkg:
    dependencies:
      vite: "*"
```

**(c) Still needed and the cause is unclear.** Stop and treat it as its own task. Do not
migrate around it — a silently-inert shim is worse than a loud failure.

> Note: the _project's own_ `prepare` and `postinstall` scripts do still run under pnpm.
> pnpm only blocks lifecycle scripts belonging to **dependencies**. `husky install` is
> fine. The shim's problem is resolution, not execution.

---

## 2. Second-order items

### 2.1 husky pre-commit calls `npx`

`.husky/pre-commit` ends with:

```sh
npx lint-staged
```

Change to `pnpm exec lint-staged`. Under pnpm, `npx` may resolve a _different_ copy of
lint-staged — or download one — rather than the pinned `lint-staged@^16.4.0` in
`devDependencies`. A pre-commit hook silently running an unpinned tool downloaded at
commit time is, in the week of a supply-chain worm, worth fixing on its own merits.

The hook's PATH-repair block already prepends `$HOME/Library/pnpm`, so you were half
expecting this.

Also note husky 8's `prepare: "husky install"` is deprecated in husky 9. Not a pnpm
concern — don't bundle the upgrade in.

### 2.2 `.nvmrc` says 26.3.0, `engines` says `>=22.12.0`

These disagree. pnpm 11 needs Node ≥ 22, so both satisfy it and nothing blocks — but most
hosts read `.nvmrc`, and `engine-strict=true` (recommended in the `.npmrc` rewrite) makes
`engines` load-bearing. Pick one number and make them agree as part of Phase 3, or
deliberately leave `engines` as the floor and `.nvmrc` as the pin and write that down.

### 2.3 Same dead `shamefully-hoist`

```
# Expose Astro dependencies for `pnpm` users
shamefully-hoist=true
```

Byte-for-byte the same inherited Astro-template line as shrink-ray-labs, with the same
comment. Same treatment: **delete, do not port.** pnpm 11 wouldn't read it from `.npmrc`
anyway.

Two repos carrying identical dead config is a decent signal the third does too — check
the three.js site's `.npmrc` before you assume it's clean.

### 2.4 `allowBuilds` will be short

Unlike shrink-ray-labs there are no declared native dependencies — no sharp, no wrangler,
no `@parcel/watcher`. Expect `esbuild` (via Vite) and possibly `sharp` (via Astro's image
pipeline) to surface transitively. **Derive the list from what the first `pnpm install`
actually blocks; do not copy shrink-ray-labs' five entries across.** A too-generous
allowlist is the failure mode to avoid here.

### 2.5 Host is unknown

No `wrangler.jsonc`, no `vercel.json`, no `netlify.toml`, and the README says nothing.
`astro.config.mjs` sets `site: "https://devcharms.com/"` and there's no adapter, so it's a
static build going somewhere via a git integration.

**This has to be answered before Phase 6**, because the host determines whether pnpm
version selection needs a dashboard env var (Cloudflare Pages) or reads `packageManager`
automatically (Netlify, Vercel). It also determines whether a preview deploy is available
as the real verification step.

### 2.6 `"private": false`

The package is marked publishable and versioned `1.2.1`, but it's a website. Probably
template residue. Harmless, but `private: true` would remove any chance of an accidental
`pnpm publish` — and the deny list in `settings.local.json.proposed` blocks publish for
exactly this reason.

---

## 3. Revised ordering — I got this wrong

Two turns ago I recommended devcharms first, as a cheap rehearsal before the complicated
site. That was based on "simple blog, less accumulated cruft," which is true of everything
_except_ §1.

The shim is an unknown of genuinely unknown size. It could be a five-minute delete, or it
could be an afternoon of working out what breaks in Vite's dev client without it. That's
not a rehearsal.

**So: don't fix the order yet. Spend fifteen minutes on §1 first, then decide.**

- If the shim is stale and deletes cleanly _(likely — Vite 8 is several majors past
  whenever this was written)_, devcharms becomes the easiest of the three and should
  absolutely go first.
- If it's load-bearing, do **shrink-ray-labs first** instead. Its one predicted breakage
  (ESLint plugin resolution) has a known two-line fix, which makes it the more
  predictable job even though it's the bigger one.

Predictability beats size when the goal is to validate a runbook.

---

## 4. What carries over unchanged

Everything not listed above. Specifically: pnpm 11.21.0 target, the `pnpm-workspace.yaml`
security block (`minimumReleaseAge: 1440`, `minimumReleaseAgeIgnoreMissingTime: false`,
`blockExoticSubdeps`, `trustPolicy: no-downgrade`, `trustLockfile: false`,
`strictDepBuilds`, `verifyDepsBeforeRun: error`), the two-commit split, `pnpm import`
before deleting `package-lock.json`, the prose sweep (`README.md`, `.cursorrules`, and
here also `.husky/pre-commit`), the rollback table, and the permission allowlist.

Repo-identity assertion applies here too, and for a different reason than
shrink-ray-labs' near-identical siblings: this repo is in a **different tree entirely**
(`~/Code/REPOS/`, not `~/Code/SHRINKRAYLABS/`). Confirm before running:

```bash
pwd                                        # /Users/gregor/Code/REPOS/devcharms
git remote get-url origin                  # git@github.com:shrinkray/devcharms.git
node -p "require('./package.json').name"   # devcharms
```
