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
cd zetrix-avatar
npm i
npm run dev
```

## Production URL

The demo is hosted at **https://avatar-demo.zetrix.com/** (root path). Builds use `VITE_BASE_PATH=/` so asset URLs and `BrowserRouter` resolve correctly.

## Deploy (GitHub Actions → GitHub Pages)

1. **Enable GitHub Pages**  
   In your repo: **Settings → Pages → Build and deployment → Source**: choose **GitHub Actions**.

2. **Push the workflow**  
   The repo includes `.github/workflows/deploy-pages.yml`. Push to `main` (or run the workflow manually) to build and deploy.

3. **Base path**  
   The workflow sets `VITE_BASE_PATH=/` for the avatar-demo host. For a classic `https://<user>.github.io/<repo>/` URL instead, change the workflow build env to `VITE_BASE_PATH: /<repo-name>/` (or omit `VITE_BASE_PATH` and set `GITHUB_REPOSITORY` so `vite.config.ts` derives the subpath).

**Local build matching production:**
```sh
VITE_BASE_PATH=/ npm run build
cp dist/index.html dist/404.html
```

**Local build for legacy GitHub Pages project URL (subpath):**
```sh
GITHUB_REPOSITORY=owner/repo-name npm run build
cp dist/index.html dist/404.html
```

The workflow uses `actions/checkout`, `actions/setup-node`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.

### Troubleshooting: `404` on `/assets/index-<hash>.js`

Vite names bundles with a **content hash** that changes every build. If the browser or a **CDN (e.g. Cloudflare)** serves a **cached `index.html`** from an older deploy, that HTML still points at **old** chunk names — those files are gone after the next deploy → **404** for `https://…/assets/index-….js`.

**Fix:**

1. **Hard refresh** the site (or try an incognito window) so `index.html` is fetched again.
2. If you use **Cloudflare** (or similar) in front of **avatar-demo.zetrix.com**: **purge cache** for the site after each deploy, or add a **Cache Rule** so **`/` and `/index.html` are not cached long-term** (or use “cache everything” only for `/assets/*` with long TTL; hashed assets are safe to cache).

GitHub Pages alone usually serves fresh `index.html` reasonably quickly; stale HTML is most common when a **proxy CDN** caches HTML aggressively.
