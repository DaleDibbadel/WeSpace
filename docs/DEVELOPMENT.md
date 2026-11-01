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
Promote to staging when you want ZimaBlade to build it:
```powershell
git branch -f staging dev; git push origin staging
```
Within ~2 minutes (after CI is green) `http://10.0.0.201:8091/` serves the new commit; `http://10.0.0.201:8091/DEPLOYED_SHA.txt` tells you which.

## Conventions
- Do not commit `dist/` changes (legacy tracked build output; the image is built from source). Run `git checkout -- dist` after local builds until dist is untracked.
- Lint must pass (`eslint.config.js` allows the shadcn `buttonVariants` export).
- Content lives in `src/`; site-wide strings in `src/lib/site-config.ts`; the hero heading in `src/pages/landing.tsx`.
