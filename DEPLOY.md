# LivePay Deploy (Web)

## Deploy target

Production: GitHub Pages (github.io)

## Prerequisites

- Node.js installed

## Deploy

Deployment is handled by GitHub Actions to GitHub Pages.

1. In GitHub repo settings:
   - Enable Pages
   - Source: GitHub Actions
2. Push to `main`.

The workflow builds an Expo web static export and publishes `dist/` to Pages.

## Local build

From the repo root:

```powershell
npm ci
npx expo export --platform web
```

## Notes

- GitHub Pages serves your app under a subpath: `/<repo>/`. The build sets the correct base path during CI.
- If you use a GoDaddy domain, point it at GitHub Pages (CNAME) and keep the repository name subpath behavior in mind.
