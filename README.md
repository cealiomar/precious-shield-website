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
- `app/installation-video.tsx` — self-hosted silent background film, viewport-aware playback, pause control, and source attribution.
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

The installation section plays a ten-second, silent Full HD excerpt of the selected Areté Auto Salon film from local site assets. A solid foreground panel keeps the process text legible without tinting or filtering the footage. Desktop uses a full-width background; mobile preserves the 16:9 shot above the copy. Playback pauses offscreen and when the page is hidden. Reduced-motion and data-saving visitors get manual playback, and a pause/play control remains available. See [media provenance and edit details](docs/media-sources.md). No new Higgsfield assets are used.

The product scene uses native scrolling with a sticky stage: each of the six products receives 80% of a viewport of scroll travel before the next appears. After PS VISION the stage releases. Direct tab selection also positions the scroll within that product’s segment, and a skip link allows bypassing the sequence. Pinning is enabled on desktop screens at least 650px high and mobile screens at least 740px high, with a normal tab layout for reduced motion and shorter viewports. Original vehicle artwork is unchanged.

## Creative upgrade

- `app/creative-runtime.tsx`: fail-open 0–100 loader, curtain exit, GSAP/Lenis integration, word reveals, fine-pointer cursor, and magnetic primary CTAs. Lenis is disabled for reduced motion; native touch scrolling and controls remain usable.
- `app/feature-journey.tsx`: ScrollTrigger pins the feature scene on suitable desktop viewports. Glass cards pass behind an unchanged, stationary vehicle cutout. Touch and short screens use a native horizontal card rail.
- `app/paint-comparison.tsx`: native keyboard/touch range control with a glowing divider, preset buttons, and two aligned image layers. `lib/comparison-assets.ts` holds configurable image paths. The current demo intentionally uses the same unaltered image twice and is labelled as a preview, because no aligned before/after pair was supplied. Set `authenticPair` only after replacing both paths with genuine registered photos.
- Product navigation is a single horizontally scrollable row at all widths. The active tab is centered without scrolling the page. Direct product selection uses the active Lenis instance to avoid scroll position rebound.
- Syne fonts are hosted locally with their OFL license. Vehicle files remain unchanged; the legacy hero shade is disabled.

See [the section-by-section implementation](docs/creative-upgrade.md) for source and integration details.
