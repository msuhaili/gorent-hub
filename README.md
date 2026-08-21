# GoRent Hub

Development hub for GoRent's internal tools. Hosted on GitHub Pages, backed by the
GoRent n8n instance for data and workflow logic.

## Apps

- **[Approvals](apps/approvals/)** — mobile-friendly approval queue for blog posts and
  other content awaiting review. Talks to n8n's `GoRent Approval Hub` workflow
  (`https://n8n.gogolop.com/webhook/approval-*`) for data and actions.

## Adding a new app

1. Create a new folder under `apps/<name>/`
2. Add its `index.html` (and `manifest.json` / `sw.js` if it should be installable)
3. Link it from the root `index.html`
4. Push to `main` — GitHub Pages redeploys automatically
