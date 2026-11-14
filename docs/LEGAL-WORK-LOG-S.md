# HUOC Legal Work Log — (S)

Work performed under owner directive "HUOC Website Recovery and Legal Policy Deployment" (2026-11-13), from the existing Windows dev clone on HUOC-UTILITY via SSH (`huoc-utility`). Only items marked VERIFIED have a recorded result.

########## HUOC LEGAL DEPLOYMENT — (S) ##########

## 1. Original script failure and actual findings (VERIFIED 2026-11-13)
- The earlier ChatGPT PowerShell script never located its ZIP archive (`$zip` null). No `.zip` exists in the `rooty` profile, Downloads or Desktop top levels.
- `Expand-Archive` failed, so `public/privacy`, `public/legal-notice`, `public/terms`, `public/legal` and `public/legal-assets` were never created.
- Git staging/commit failed (paths missing). `git push origin dev` reported "Everything up-to-date": nothing was pushed. Its "GITHUB PUSH COMPLETE" message was false.
- `origin/dev` and local `dev` were both at `21f8537` before this work; no failed-script content was ever committed or pushed.
- Working-tree effects of the script (all timestamped 2026-11-13 20:53–20:54 local):
  - `src/components/footer.tsx`: appended an unstyled `<nav>` with three links (the only change in that file).
  - `dist/`: a `pnpm build` regenerated tracked build output (`index.html` modified, two hashed assets deleted, two new hashed assets untracked).
  - `docs/LEGAL-WORK-LOG-S.md`: untracked file claiming S-03/S-04/S-05 "installed" — false. It also ended with a stray `'head' is not recognized` shell error.
- Typecheck/lint/build passing at that time did not mean the legal pages were installed (none existed).

## 2. Repair and preservation (VERIFIED)
- Full backup before any change: `C:\Users\rooty\Documents\GitHub\_recovery-S\failed-script-20261113\` (tracked-changes patch, `git status`, HEAD sha, copies of `footer.tsx`, the false work log, and the entire script-built `dist/`).
- Repair used targeted commands only: `git checkout -- src/components/footer.tsx dist`, then removal of the two untracked build assets and the false work log. No `git reset --hard`, no broad `git clean`, no force operations. No unrelated edits existed in the tree.
- Convention for `dist/`: it is tracked only because commit `b6d1b6c` ("Replace dev with working huoc-v1 site") added it. It has not been committed since; CI and the Dockerfile build `dist/` from source. Therefore `dist/` build output is NOT committed with this work; the tree is restored to the committed `dist/` before staging.

## 3. Documents created
- `public/privacy/index.html` — Privacy Policy (13 sections, owner-supplied substance)
- `public/legal-notice/index.html` — Legal Notice (8 sections)
- `public/terms/index.html` — Terms of Service and Acceptable Use (12 sections)
- `public/legal/index.html` — legal hub linking all three
- `public/legal-assets/style.css` — shared stylesheet (site green accent; light/dark via `prefers-color-scheme`; responsive; print rules)
- Static HTML: no JavaScript, no cookies, no third-party assets. Effective date November 13, 2026.

## 4. Footer integration (VERIFIED in source)
`src/components/footer.tsx` now maps a `legalLinks` array (Privacy Policy `/privacy/`, Legal Notice `/legal-notice/`, Terms of Service `/terms/`) into a styled `<nav aria-label="Legal documents">` in the bottom bar. Plain `<a>` links (the pages sit outside the SPA router). No other footer content changed.

## 5. Validation (VERIFIED, HUOC-UTILITY, 2026-11-13)
- `pnpm typecheck` exit 0; `pnpm lint` exit 0; `pnpm build` exit 0.
- `dist/privacy/index.html`, `dist/legal-notice/index.html`, `dist/terms/index.html`, `dist/legal/index.html`, `dist/legal-assets/style.css` all present in the build output.
- Local render check of the privacy page at desktop and 375 px width: no horizontal overflow.

## 6. Facts established from the actual source (VERIFIED)
- Analytics/advertising: none found in `src/` or `index.html` (searched gtag, analytics, cookies).
- Browser storage: theme preference only (`localStorage` key `theme`).
- Third-party script on main site pages: Chatwoot chat widget (`app.chatwoot.com`), active. Zammad chat code exists but is disabled (`HUOC_ENABLE_ZAMMAD = false`).
- Outbound links: Stripe payment link (`buy.stripe.com`), Microsoft booking page (`outlook.office.com/bookwithme`), StartControl remote support (`startcontrol.com`), HUOC helpdesk, Dashy dashboard, a Nextcloud share link.
- Fonts are self-hosted via fontsource (no third-party font network).
- Live site is served by OpenResty (Nginx Proxy Manager); the website response carries no Cloudflare headers.

## 7. Git, CI, staging, production, Nextcloud
Recorded below as each step is verified.

## 8. Legally material information NOT verified (owner review)
1. Legal entity status: HUOC is not stated to be incorporated/registered. Confirm whether a registered entity or assumed-name filing exists.
2. No postal address is published (none supplied). Confirm whether one is legally required.
3. DMCA: no designated agent is claimed; the notice says so. Register an agent with the U.S. Copyright Office if safe-harbor status is wanted, then update the notice.
4. Cloudflare: involvement (DNS, tunnel, proxy) is stated as "may"; not verifiable from the website. Confirm and tighten wording.
5. Retention periods, log retention, Nextcloud trash/versions settings, and backup schedules were not inspected; the policy gives no durations. Provide them if specific commitments are wanted.
6. Public registration: not verified per application (Nextcloud redirects to its login page). The policy states access is by authorization/invitation per owner text.
7. "Sale or advertising use of data": only the website source was reviewed (no ads/analytics). Other applications were not inspected; the policy makes no "never sold" statement.
8. Which of Jellyfin, Jellyseerr, Audiobookshelf, Immich, Kasm and Authentik are actually deployed was not verified; the policy lists them as owner-supplied services, with "may" language.
9. Chatwoot cookie/storage behavior was not inspected in a live browser session.
10. Texas-specific privacy statute applicability (e.g., thresholds) and COPPA/other law review were not assessed by counsel. This is not legal advice.

Attribution: (S)
