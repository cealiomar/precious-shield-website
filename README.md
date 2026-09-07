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
- `app/installation-video.tsx` — viewport-triggered, muted YouTube autoplay with native controls and source attribution.
- `lib/scroll-progress.ts` — progress calculations for scroll scenes.
- `app/use-product-scroll.ts` — six sticky product chapters, reverse scroll, and direct tab navigation. Small/short screens and reduced-motion users retain ordinary tabs.
- `public/images/products/` — the six transparent vehicle images.
- `public/fonts/` — locally hosted Arabic fonts.
- `.openai/hosting.json` — existing Sites project association; contains no credentials.

## Stack and hosting

React 19, TypeScript, Vinext/Vite, Tailwind CSS, Base UI components, and Cloudflare Workers.

The live website is available at [cealiomar.github.io/precious-shield-website](https://cealiomar.github.io/precious-shield-website/).

GitHub Actions builds and publishes the site on every push to `main`. Run `npm run build:pages` to generate the static GitHub Pages output in `dist/client/`, with the repository prefix applied to assets. The regular `npm run build` command retains the existing Worker-backed Sites build in `dist/`.

Vehicle artwork is illustrative CGI. Product names and warranty durations reflect the supplied Precious Shield information. The contact and warranty links point to the brand's existing services.

The installation section embeds [Areté Auto Salon’s Porsche GT3 film](https://www.youtube.com/watch?v=IQqFJy0QhR4) through YouTube’s privacy-enhanced player, starting at the installation footage (1:10). The publisher advertises the original in 4K; YouTube selects playback quality based on the viewer’s device and connection. Native controls and fullscreen remain available. The player mounts as it enters the viewport and requests muted autoplay with looping. It unmounts offscreen or when the page is hidden. Reduced-motion users get manual playback, and browser autoplay restrictions may still require pressing play. The footage is credited as an external illustration, not a Precious Shield customer installation. No video is downloaded, rehosted, filtered, stretched, or cropped. A direct YouTube link remains available if embedding is blocked. The previous generated MP4 has been removed.

The product scene uses native scrolling with a sticky stage: each of the six products receives 80% of a viewport of scroll travel before the next appears. After PS VISION the stage releases. Direct tab selection also positions the scroll within that product’s segment, and a skip link allows bypassing the sequence. Pinning is enabled on desktop screens at least 650px high and mobile screens at least 740px high, with a normal tab layout for reduced motion and shorter viewports. Original vehicle artwork is unchanged.
