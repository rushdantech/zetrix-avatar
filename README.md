# Zetrix Avatar

Create and manage your AI avatar companions — persona setup, marketplace chat, content studio, and DPO tuning.

## Tech stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Local development

Node.js and npm are required — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <YOUR_GIT_URL>
cd persona-creator-hub
npm i
npm run dev
```

## Deploy to GitHub Pages

1. **Enable GitHub Pages**  
   In your repo: **Settings → Pages → Build and deployment → Source**: choose **GitHub Actions**.

2. **Push the workflow**  
   The repo includes `.github/workflows/deploy-pages.yml`. Push to `main` (or run the workflow manually) to build and deploy.

3. **Repo name**  
   The app base path is set from the repo name (e.g. `persona-creator-hub` → `https://<user>.github.io/persona-creator-hub/`).

**Local build for GitHub Pages (optional):**
```sh
GITHUB_REPOSITORY=owner/repo-name npm run build
cp dist/index.html dist/404.html
```

The workflow uses `actions/checkout`, `actions/setup-node`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.
