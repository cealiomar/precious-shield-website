# Precious Shield

Arabic, right-to-left automotive paint protection website for Precious Shield (PS).

- Cinematic scroll scenes, progressive heading reveals, and hover interactions.
- Six product presentations with distinct transparent CGI vehicle images.
- Responsive layouts and reduced-motion support.
- WhatsApp inquiries and links to the existing warranty verification service.

## Run locally

Requires Node.js **22.13 or newer** and npm.

```sh
npm ci
npm run dev
```

Open the local address printed by the development server.

## Build and check

```sh
npm run build
npx tsc --noEmit
npx oxlint app lib/scroll-progress.ts
```

The full starter lint command also checks bundled UI components and may report pre-existing issues in those components.

## Project structure

- `app/page.tsx` — page content, products, warranties, navigation, and contact links.
- `app/globals.css` — visual design, responsive layout, and interaction styles.
- `app/scroll-experience.tsx` — scroll effects and animated text components.
- `lib/scroll-progress.ts` — progress calculations for scroll scenes.
- `public/images/products/` — the six transparent vehicle images.
- `public/fonts/` — locally hosted Arabic fonts.
- `.openai/hosting.json` — existing Sites project association; contains no credentials.

## Stack and hosting

React 19, TypeScript, Vinext/Vite, Tailwind CSS, Base UI components, and Cloudflare Workers.

The production build is written to `dist/`. This is a Worker-backed application; the repository is the source code, not a GitHub Pages static export.

The existing private site is available at [ps-protection-studio.cealiomar.chatgpt.site](https://ps-protection-studio.cealiomar.chatgpt.site/).

Vehicle artwork is illustrative CGI. Product names and warranty durations reflect the supplied Precious Shield information. The contact and warranty links point to the brand's existing services.
