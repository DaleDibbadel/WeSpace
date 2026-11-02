# Development (HUOC-UTILITY)

## Connect
1. On your laptop, VS Code → Remote-SSH → host `huoc-utility` (192.168.2.253, user `rooty`; Tailscale alias `huoc-utility-ts`). `remote.SSH.remotePlatform` is set to `windows` for both aliases.
2. Open folder `C:\Users\rooty\Documents\GitHub\WeSpace`. Verify the window title ends with `[SSH: huoc-utility]` and the integrated terminal prompt is `PS C:\Users\rooty\...` — never a ZimaBlade shell.
3. Everything you save edits the Windows working copy only. ZimaBlade has no copy of the source except the deployer's throw-away build directories on Deadpool.

## Toolchain on the server
- Node 22 (nvm4w, `C:\nvm4w\nodejs`), pnpm 11, Git for Windows with `core.autocrlf=true` (expect CRLF warnings; files in the repo are LF).
- GitHub CLI 2.103 at `C:\Program Files\GitHub CLI\gh.exe`, logged in as `DaleDibbadel` with `--insecure-storage` so `git push` works from non-interactive sessions too (`gh auth setup-git` installed the credential helper). If `gh auth status` says the token is invalid, re-run the login with `--insecure-storage`.
- Git identity for the working copy: `DaleDibbadel <134179283+DaleDibbadel@users.noreply.github.com>`.

## Loop
```powershell
pnpm install --frozen-lockfile
pnpm dev                     # http://localhost:5173 on the server; forward the port in VS Code
pnpm typecheck; pnpm lint; pnpm build
git add -A; git commit; git push origin dev     # CI runs on GitHub
```
Staging follows `dev` automatically (`staging.env` has `BRANCH=dev` since 2026-11-01): within ~2 minutes of a green CI run `http://10.0.0.201:8091/` serves the new commit; `http://10.0.0.201:8091/DEPLOYED_SHA.txt` tells you which. Production: open a PR dev → main, wait for the required check, merge; `https://helpdesk.homeguardofbill-huoc.com/DEPLOYED_SHA.txt` updates within ~2 minutes.

## Branches (permanent policy)
- `dev` = the permanent development branch. **Never delete `dev`.** Never force-push, reset or rebase it; if it is ever accidentally removed from GitHub, restore it from the working copy on HUOC-UTILITY (`git push origin dev`), never recreate it from `main`.
- `main` = the protected production branch (1 approving review, required check `typecheck / lint / build`, up to date, no force-push, no deletion). It changes only through a PR from `dev`.
- Workflow: VS Code on HUOC-UTILITY -> `dev` -> CI -> staging (:8091) -> PR -> protected `main` -> automatic production deployment (:8092).
- After a release, bring `dev` level with `main` using a normal merge, never a reset: `git fetch origin; git merge origin/main; git push origin dev` (a fast-forward when `dev` has no new work). Stop and ask the owner if that merge reports conflicts.
- `staging` is a legacy branch kept for history; the staging deployer follows `dev`, not `staging`.

## Conventions
- Do not commit `dist/` changes (legacy tracked build output; the image is built from source). Run `git checkout -- dist` after local builds until dist is untracked.
- Lint must pass (`eslint.config.js` allows the shadcn `buttonVariants` export).
- Content lives in `src/`; site-wide strings in `src/lib/site-config.ts`; the hero heading in `src/pages/landing.tsx`.
