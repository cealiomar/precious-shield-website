# Precious Shield — creative upgrade

This implementation is integrated into the existing React + Tailwind site and deployed through the existing GitHub Pages workflow. The JSX below is the semantic HTML structure; GSAP, ScrollTrigger and Lenis are installed dependencies, not remote script tags.

```sh
npm ci
npm run build:pages
```

The comparison component is fully interactive, but uses the same untouched original image on both sides until a registered before/after photo pair is supplied. Configure both paths together in `lib/comparison-assets.ts`, then set `authenticPair: true`. Do not emulate scratches or gloss with filters, overlays, or a different car image.

Desktop feature pinning falls back to native horizontal scrolling on touch/short viewports. Reduced motion disables nonessential animations. The preloader has both a timeout and a skip control. Browser media autoplay policies still apply to the existing muted YouTube film.


## 1. Global setup, cinematic preloader and cursor


### app/creative-runtime.tsx

```tsx
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { connectSmoothScroll } from '@/lib/smooth-scroll';

gsap.registerPlugin(ScrollTrigger);

export function CreativeRuntime() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = loaderRef.current;
    const counter = counterRef.current;
    if (!loader || !counter) return;
    let disposed = false;
    let complete = false;
    const value = { percentage: 0 };
    let progress: gsap.core.Tween | undefined;
    let exit: gsap.core.Tween | undefined;
    const finish = () => {
      if (disposed || complete) return;
      complete = true;
      progress?.kill();
      progress = gsap.to(value, {
        percentage: 100,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: () => {
          counter.textContent = String(Math.round(value.percentage)).padStart(
            2,
            '0',
          );
        },
        onComplete: () => {
          exit = gsap.to(loader, {
            yPercent: -101,
            duration: 0.85,
            ease: 'power4.inOut',
            onComplete: () => {
              loader.hidden = true;
              ScrollTrigger.refresh();
            },
          });
        },
      });
    };
    if (
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.location.hash
    ) {
      loader.hidden = true;
      return;
    }
    const hero = document.querySelector<HTMLImageElement>('.hero-image');
    const tasks = [
      document.fonts.ready,
      hero?.decode().catch(() => undefined) ?? Promise.resolve(),
    ];
    let settled = 0;
    tasks.forEach(
      (task) =>
        void Promise.resolve(task)
          .catch(() => undefined)
          .then(() => {
            if (disposed || complete) return;
            settled++;
            progress?.kill();
            progress = gsap.to(value, {
              percentage: (settled / tasks.length) * 90,
              duration: 0.4,
              onUpdate: () => {
                counter.textContent = String(
                  Math.round(value.percentage),
                ).padStart(2, '0');
              },
            });
            if (settled === tasks.length) finish();
          }),
    );
    const timeout = window.setTimeout(finish, 2500);
    const skip = loader.querySelector('button');
    skip?.addEventListener('click', finish);
    return () => {
      disposed = true;
      clearTimeout(timeout);
      progress?.kill();
      exit?.kill();
      skip?.removeEventListener('click', finish);
    };
  }, []);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
        anchors: { offset: -88 },
        prevent: (node) =>
          Boolean(node.closest('[role="dialog"], [data-lenis-prevent]')),
      });
      connectSmoothScroll(lenis);
      lenis.on('scroll', () => ScrollTrigger.update());
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      const headings = gsap.utils.toArray<HTMLElement>('.motion-heading');
      headings.forEach((heading) => {
        gsap.fromTo(
          heading.querySelectorAll('.motion-word'),
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.065,
            ease: 'power3.out',
            scrollTrigger: { trigger: heading, start: 'top 90%', once: true },
          },
        );
      });
      const refresh = () => ScrollTrigger.refresh();
      let alive = true;
      void document.fonts.ready.then(() => {
        if (alive) refresh();
      });
      return () => {
        alive = false;
        gsap.ticker.remove(tick);
        connectSmoothScroll();
        lenis.destroy();
      };
    });
    media.add(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      () => {
        const cursor = cursorRef.current;
        if (!cursor) return;
        const x = gsap.quickTo(cursor, 'x', {
          duration: 0.25,
          ease: 'power3.out',
        });
        const y = gsap.quickTo(cursor, 'y', {
          duration: 0.25,
          ease: 'power3.out',
        });
        const move = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse') return;
          x(event.clientX);
          y(event.clientY);
          cursor.style.opacity = '1';
          const target = event.target instanceof Element ? event.target : null;
          const drag = target?.closest('[data-cursor="drag"]');
          cursor.dataset.state = drag
            ? 'drag'
            : target?.closest('a, button, input, [role="tab"]')
              ? 'active'
              : '';
          const label = cursor.querySelector('span');
          if (label) label.textContent = drag ? 'DRAG' : '';
        };
        const hide = () => {
          cursor.style.opacity = '0';
        };
        window.addEventListener('pointermove', move, { passive: true });
        document.documentElement.addEventListener('pointerleave', hide);
        window.addEventListener('blur', hide);
        const cleanups = gsap.utils
          .toArray<HTMLElement>('.primary-button, .header-cta, .closing-link')
          .map((button) => {
            const pullX = gsap.quickTo(button, 'x', {
              duration: 0.45,
              ease: 'power3.out',
            });
            const pullY = gsap.quickTo(button, 'y', {
              duration: 0.45,
              ease: 'power3.out',
            });
            let bounds: DOMRect;
            const enter = () => {
              bounds = button.getBoundingClientRect();
            };
            const pull = (event: PointerEvent) => {
              if (!bounds) return;
              pullX(
                gsap.utils.clamp(
                  -14,
                  14,
                  (event.clientX - bounds.left - bounds.width / 2) * 0.12,
                ),
              );
              pullY(
                gsap.utils.clamp(
                  -10,
                  10,
                  (event.clientY - bounds.top - bounds.height / 2) * 0.2,
                ),
              );
            };
            const leave = () => {
              pullX(0);
              pullY(0);
            };
            button.addEventListener('pointerenter', enter);
            button.addEventListener('pointermove', pull);
            button.addEventListener('pointerleave', leave);
            return () => {
              button.removeEventListener('pointerenter', enter);
              button.removeEventListener('pointermove', pull);
              button.removeEventListener('pointerleave', leave);
              pullX.tween.kill();
              pullY.tween.kill();
              gsap.set(button, { clearProps: 'transform' });
            };
          });
        return () => {
          window.removeEventListener('pointermove', move);
          document.documentElement.removeEventListener('pointerleave', hide);
          window.removeEventListener('blur', hide);
          x.tween.kill();
          y.tween.kill();
          hide();
          cleanups.forEach((cleanup) => cleanup());
        };
      },
    );
    return () => media.revert();
  }, []);

  return (
    <>
      <div className="cinematic-loader" ref={loaderRef}>
        <span className="loader-brand" dir="ltr">
          PRECIOUS SHIELD®
        </span>
        <div className="loader-count" aria-hidden="true" dir="ltr">
          <span ref={counterRef}>00</span>
          <small>%</small>
        </div>
        <div className="loader-footer">
          <span dir="ltr">PREPARING YOUR EXPERIENCE</span>
          <button type="button">تخطّي المقدمة</button>
        </div>
      </div>
      <div className="creative-cursor" ref={cursorRef} aria-hidden="true">
        <div>
          <span />
        </div>
      </div>
    </>
  );
}

```


### lib/smooth-scroll.ts

```tsx
import type Lenis from 'lenis';
let current: Lenis | undefined;
export function connectSmoothScroll(instance?: Lenis) {
  current = instance;
}
export function scrollPageTo(top: number) {
  if (current) current.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, behavior: 'instant' });
}

```


## 2. Typography and magnetic interactions


### app/scroll-experience.tsx

```tsx
'use client';

import { useEffect } from 'react';
import {
  craftStep,
  progressBetween,
  sceneProgress,
  wordProgress,
} from '@/lib/scroll-progress';

export function ScrollWords({ children }: { children: string }) {
  return (
    <span className="scroll-words">
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {children.split(' ').map((word, index) => (
          <span key={`${index}-${word}`} className="scroll-word">
            {word}{' '}
          </span>
        ))}
      </span>
    </span>
  );
}

export function MotionHeading({
  lines,
  className = '',
}: {
  lines: string[];
  className?: string;
}) {
  let wordIndex = 0;
  return (
    <h2 className={`motion-heading reveal ${className}`}>
      <span className="sr-only">{lines.join(' ')}</span>
      {lines.map((line) => (
        <span key={line} className="motion-line" aria-hidden="true">
          {line.split(' ').map((word, index) => {
            const delay = wordIndex++ * 65;
            return (
              <span className="motion-word-mask" key={`${word}-${index}`}>
                <span
                  className="motion-word"
                  style={{ transitionDelay: `${delay}ms` }}
                >
                  {word}
                </span>{' '}
              </span>
            );
          })}
        </span>
      ))}
    </h2>
  );
}

export function HoverLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="rolling-label">
      <span className="rolling-primary">{children}</span>
      <span className="rolling-copy" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}

/** Native scrolling stays in control; only visual layers respond to position. */
export function ScrollExperience() {
  useEffect(() => {
    const root = document.documentElement;
    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    const largeViewport = window.matchMedia(
      '(min-width: 901px) and (min-height: 650px)',
    );
    const hero = document.querySelector<HTMLElement>('.hero-scroll');
    const craft = document.querySelector<HTMLElement>('.craft');
    const intro = document.querySelector<HTMLElement>('.protection');
    const header = document.querySelector<HTMLElement>('.site-header');
    const pageProgress = document.querySelector<HTMLElement>(
      '.page-progress-fill',
    );
    const wordmark = document.querySelector<HTMLElement>('.closing-wordmark');
    const words = Array.from(
      document.querySelectorAll<HTMLElement>('.scroll-word'),
    );
    const steps = Array.from(
      document.querySelectorAll<HTMLElement>('.steps li'),
    );
    const reveals = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal'),
    );
    const chapters = Array.from(
      document.querySelectorAll<HTMLElement>('[data-chapter]'),
    );
    const chapterLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.chapter-rail a'),
    );
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    let reduced = motionPreference.matches;
    let pinned = largeViewport.matches && !reduced;
    let previousChapter = '';
    let previousStep = -1;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      // Read geometry together before updating visual styles.
      const heroBounds = hero?.getBoundingClientRect();
      const craftBounds = craft?.getBoundingClientRect();
      const introBounds = intro?.getBoundingClientRect();
      const wordmarkBounds = wordmark?.parentElement?.getBoundingClientRect();
      const activeChapter =
        [...chapters]
          .reverse()
          .find(
            (chapter) => chapter.getBoundingClientRect().top <= viewport * 0.45,
          )?.id ?? 'home';
      const heroProgress = heroBounds
        ? sceneProgress(heroBounds.top, heroBounds.height, viewport)
        : 0;
      const craftProgress = craftBounds
        ? sceneProgress(craftBounds.top, craftBounds.height, viewport)
        : 0;
      const readProgress = introBounds
        ? progressBetween(-introBounds.top, -viewport * 0.72, viewport * 0.04)
        : 1;
      const endProgress = wordmarkBounds
        ? progressBetween(-wordmarkBounds.top, -viewport, wordmarkBounds.height)
        : 0;

      header?.classList.toggle('is-scrolled', scrollY > 48);
      pageProgress?.style.setProperty(
        'transform',
        `scaleX(${progressBetween(scrollY, 0, Math.max(1, documentHeight - viewport))})`,
      );
      if (activeChapter !== previousChapter) {
        previousChapter = activeChapter;
        chapterLinks.forEach((link) => {
          if (link.hash === `#${activeChapter}`)
            link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
      if (reduced) return;

      if (
        hero &&
        heroBounds &&
        heroBounds.bottom > 0 &&
        heroBounds.top < viewport
      ) {
        const distance = pinned
          ? heroProgress
          : progressBetween(-heroBounds.top, 0, heroBounds.height);
        hero.style.setProperty(
          '--hero-scale',
          String(1 + distance * (pinned ? 0.28 : 0.06)),
        );
        hero.style.setProperty(
          '--hero-shift',
          `${distance * (pinned ? -4 : -1.5)}%`,
        );
        hero.style.setProperty(
          '--hero-text-opacity',
          String(pinned ? 1 - progressBetween(distance, 0.03, 0.32) : 1),
        );
        hero.style.setProperty(
          '--hero-text-y',
          `${pinned ? distance * -100 : 0}px`,
        );
        hero.style.setProperty(
          '--hero-echo-opacity',
          String(pinned ? progressBetween(distance, 0.32, 0.65) : 0),
        );
        hero.style.setProperty(
          '--hero-echo-y',
          `${(1 - progressBetween(distance, 0.32, 0.8)) * 60}px`,
        );
        hero.style.setProperty(
          '--hero-vignette',
          String(0.45 + distance * 0.4),
        );
        hero.style.setProperty('--scene-progress', String(distance));
      }
      words.forEach((word, index) =>
        word.style.setProperty(
          '--word-light',
          String(wordProgress(readProgress, index, words.length)),
        ),
      );
      if (
        craft &&
        craftBounds &&
        craftBounds.bottom > 0 &&
        craftBounds.top < viewport
      ) {
        const distance = pinned
          ? craftProgress
          : progressBetween(-craftBounds.top, -viewport, craftBounds.height);
        craft.style.setProperty(
          '--craft-scale',
          String(1.03 + distance * (pinned ? 0.2 : 0.06)),
        );
        craft.style.setProperty('--craft-shift', `${distance * -3}%`);
        craft.style.setProperty('--craft-progress', String(distance));
        const activeStep = craftStep(distance);
        if (previousStep !== activeStep) {
          previousStep = activeStep;
          steps.forEach((step, index) => {
            step.classList.toggle('step-active', index === activeStep);
            step.classList.toggle('step-complete', index < activeStep);
          });
        }
      }
      wordmark?.style.setProperty(
        '--wordmark-x',
        `${(endProgress - 0.5) * 12}%`,
      );
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const configure = () => {
      reduced = motionPreference.matches;
      pinned = largeViewport.matches && !reduced;
      root.classList.toggle('scroll-motion', !reduced);
      root.classList.toggle('scroll-pinned', pinned);
      observer?.disconnect();
      reveals.forEach((item) => item.classList.remove('will-reveal'));
      if (!reduced) {
        observer = new IntersectionObserver(
          (entries) =>
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer?.unobserve(entry.target);
              }
            }),
          { threshold: 0.1 },
        );
        reveals.forEach((item) => {
          if (item.getBoundingClientRect().top > window.innerHeight * 0.88) {
            item.classList.add('will-reveal');
            observer?.observe(item);
          } else item.classList.add('is-visible');
        });
      }
      schedule();
    };

    configure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    motionPreference.addEventListener('change', configure);
    largeViewport.addEventListener('change', configure);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);
    let disposed = false;
    void document.fonts.ready.then(() => {
      if (!disposed) schedule();
    });
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motionPreference.removeEventListener('change', configure);
      largeViewport.removeEventListener('change', configure);
      observer?.disconnect();
      resizeObserver.disconnect();
      root.classList.remove('scroll-motion', 'scroll-pinned');
      reveals.forEach((item) => item.classList.remove('will-reveal'));
    };
  }, []);

  return (
    <>
      <div className="page-progress" aria-hidden="true">
        <span className="page-progress-fill" />
      </div>
      <nav className="chapter-rail" aria-label="مراحل تجربة PS">
        {[
          ['home', 'الافتتاحية'],
          ['protection', 'عالم الحماية'],
          ['finishes', 'المنتجات'],
          ['craft', 'عناية بالتفاصيل'],
          ['ps', 'تواصل معنا'],
        ].map(([id, label], index) => (
          <a key={id} href={`#${id}`} aria-label={label}>
            <span className="chapter-label">{label}</span>
            <span className="chapter-number" dir="ltr">
              0{index + 1}
            </span>
            <span className="chapter-tick" />
          </a>
        ))}
      </nav>
    </>
  );
}

```


## 3. Pinned horizontal feature cards


### app/feature-journey.tsx

```tsx
'use client';

/* oxlint-disable next/no-img-element -- Original optimized local artwork. */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ShieldCheck, Layers3 } from 'lucide-react';
import { assetPath } from '@/lib/asset-path';
import { MotionHeading } from './scroll-experience';

gsap.registerPlugin(ScrollTrigger);
const features = [
  {
    number: '01',
    en: 'HIGH GLOSS',
    title: 'اللمعة، بكل تفاصيلها.',
    body: 'تشطيبات لامعة تبرز جمال الطلاء الأصلي. اكتشف PS CRYSTAL وPS TITANIUM.',
    Icon: Sparkles,
  },
  {
    number: '02',
    en: 'SELF-HEALING',
    title: 'تكنولوجيا تستحق الاكتشاف.',
    body: 'اسألنا عن خصائص التعافي السطحي في الفيلم المناسب لسيارتك وظروف استخدامها.',
    Icon: Layers3,
  },
  {
    number: '03',
    en: 'SCRATCH RESISTANCE',
    title: 'طبقة إضافية من الثقة.',
    body: 'حماية تساعد على تقليل آثار الاحتكاك والخدوش السطحية اليومية، مع الحفاظ على حضور سيارتك.',
    Icon: ShieldCheck,
  },
];

export function FeatureJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = sectionRef.current,
      rail = railRef.current,
      stage = stageRef.current;
    if (!section || !rail || !stage) return;
    const media = gsap.matchMedia();
    media.add(
      '(min-width: 901px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)',
      () => {
        section.classList.add('feature-journey--pinned');
        gsap.to(rail, {
          x: () => -(rail.scrollWidth - stage.clientWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
            start: 'top 80px',
            end: () =>
              `+=${Math.max(1, rail.scrollWidth - stage.clientWidth) * 1.25}`,
            pin: true,
            scrub: 0.65,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) =>
              stage.style.setProperty(
                '--feature-progress',
                String(self.progress),
              ),
          },
        });
        return () => {
          section.classList.remove('feature-journey--pinned');
          stage.style.removeProperty('--feature-progress');
        };
      },
    );
    return () => media.revert();
  }, []);
  return (
    <section
      className="feature-journey"
      ref={sectionRef}
      aria-label="تقنيات حماية الطلاء"
    >
      <div className="feature-journey-stage" ref={stageRef}>
        <div className="feature-journey-heading">
          <span className="english-label" dir="ltr">
            PROTECTION. IN EVERY DIMENSION.
          </span>
          <MotionHeading lines={['حضور لا يتغيّر.']} />
        </div>
        <div
          className="feature-window"
          tabIndex={0}
          role="region"
          aria-label="بطاقات مزايا الحماية"
        >
          <div className="feature-rail" ref={railRef}>
            {features.map(({ number, en, title, body, Icon }) => (
              <article
                key={number}
                className="glass-feature border border-white/15 bg-white/5 backdrop-blur-[16px]"
                dir="rtl"
              >
                <div className="glass-feature-top">
                  <Icon size={24} strokeWidth={1.25} />
                  <span dir="ltr">{number} / 03</span>
                </div>
                <p className="english-label" dir="ltr">
                  {en}
                </p>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="feature-car-layer">
          <img
            src={assetPath('/images/products/titanium.webp')}
            alt="سيارة رمادية في تصوير استوديو، مع الحفاظ على لون الطلاء الأصلي"
            width={1536}
            height={1024}
            loading="lazy"
          />
        </div>
        <div className="feature-journey-footer">
          <span>حماية متقدمة. إحساس أصلي.</span>
          <div aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}

```


## 4. Glowing comparison slider


### lib/comparison-assets.ts

```tsx
/** Replace both paths together with an aligned, same-camera real photo pair. */
export const comparisonAssets = {
  before: '/images/products/crystal.webp',
  after: '/images/products/crystal.webp',
  authenticPair: false,
};

```


### app/paint-comparison.tsx

```tsx
'use client';

/* oxlint-disable next/no-img-element -- Paired images must retain original pixels and registration. */
import { useRef, useState, type CSSProperties } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import { assetPath } from '@/lib/asset-path';
import { comparisonAssets } from '@/lib/comparison-assets';
import { MotionHeading } from './scroll-experience';

export function PaintComparison() {
  const [position, setPosition] = useState(50);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const authentic = comparisonAssets.authenticPair && !failed;
  return (
    <section
      className="paint-comparison section-pad"
      aria-labelledby="comparison-title"
    >
      <div className="section-heading">
        <p className="eyebrow">
          <span className="red-line" />
          التفاصيل تصنع الفارق
        </p>
        <span className="english-label" dir="ltr">
          A CLOSER LOOK
        </span>
      </div>
      <div className="comparison-heading">
        <div id="comparison-title">
          <MotionHeading lines={['الفرق في التفاصيل.']} />
        </div>
        <p>
          {authentic
            ? 'حرّك الفاصل وشاهد السطح قبل الحماية وبعدها.'
            : 'جرّب تحريك الفاصل لاستكشاف تجربة المقارنة.'}
        </p>
      </div>
      <div
        className="comparison-stage"
        data-cursor="drag"
        style={{ '--comparison': `${position}%` } as CSSProperties}
        dir="ltr"
      >
        <img
          src={assetPath(comparisonAssets.before)}
          alt={
            authentic
              ? 'سطح الطلاء قبل تركيب الحماية'
              : 'صورة السيارة الأصلية لمعاينة السلايدر'
          }
          width={1536}
          height={1024}
          loading="lazy"
          onError={() => setFailed(true)}
        />
        <div className="comparison-after">
          <img
            src={assetPath(comparisonAssets.after)}
            alt={authentic ? 'نفس سطح الطلاء بعد تركيب الحماية' : ''}
            width={1536}
            height={1024}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        </div>
        <div className="comparison-labels" aria-hidden="true">
          <span>{authentic ? 'BEFORE PPF' : 'ORIGINAL'}</span>
          <span>{authentic ? 'AFTER PPF' : 'PREVIEW'}</span>
        </div>
        <div className="comparison-divider" aria-hidden="true">
          <span>
            <ChevronsLeftRight size={22} />
          </span>
        </div>
        <input
          ref={inputRef}
          type="range"
          min={0}
          max={100}
          value={position}
          aria-label="موضع فاصل مقارنة الصور"
          aria-valuetext={`${position}%`}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
      </div>
      <div className="comparison-bottom">
        <span>
          {authentic
            ? 'نفس السيارة. نفس الزاوية. قبل الحماية وبعدها.'
            : 'معاينة تفاعلية بنفس الصورة الأصلية؛ صور قبل وبعد الفعلية ستُضاف لاحقًا.'}
        </span>
        <div className="comparison-presets">
          {[25, 50, 75].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPosition(value)}
              aria-label={`تحريك الفاصل إلى ${value}%`}
              aria-pressed={position === value}
            >
              {value}%
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

```


## 5. Product scroll repair and page integration


### app/use-product-scroll.ts

```tsx
'use client';

import { scrollPageTo } from '@/lib/smooth-scroll';
import { useCallback, useEffect, useRef, useState } from 'react';
import { productScrollIndex, productScrollOffset } from '@/lib/scroll-progress';

/** A normal sticky section, with no wheel/touch interception or scroll lock. */
export function useProductScroll(count: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const geometry = useRef({ enabled: false, top: 88, stride: 1 });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const viewport = matchMedia(
      '(min-width: 901px) and (min-height: 650px), (max-width: 900px) and (min-height: 740px)',
    );
    let frame = 0;
    let disposed = false;

    const update = () => {
      frame = 0;
      const { enabled, top, stride } = geometry.current;
      if (!enabled) return;
      const distance = top - track.getBoundingClientRect().top;
      // Preserve a direct selection when the section is outside the viewport.
      if (
        distance < -window.innerHeight ||
        distance > count * stride + stage.offsetHeight
      )
        return;
      setActiveIndex(productScrollIndex(distance, stride, count));
      stage.style.setProperty(
        '--product-progress',
        String(Math.min(1, Math.max(0, distance / (count * stride)))),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const configure = () => {
      const enabled = viewport.matches && !motion.matches;
      const top = window.innerWidth > 900 ? 88 : 80;
      const stride = window.innerHeight * 0.8;
      geometry.current = { enabled, top, stride };
      track.dataset.scrollProducts = String(enabled);
      track.style.setProperty('--product-pin-top', `${top}px`);
      track.style.setProperty('--product-travel', `${count * stride}px`);
      // Compact styles reserve one screen for tabs, artwork, copy and controls.
      track.style.setProperty(
        '--product-stage-height',
        `${window.innerHeight - top - 16}px`,
      );
      schedule();
    };
    configure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', configure, { passive: true });
    motion.addEventListener('change', configure);
    viewport.addEventListener('change', configure);
    void document.fonts.ready.then(() => {
      if (!disposed) configure();
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', configure);
      motion.removeEventListener('change', configure);
      viewport.removeEventListener('change', configure);
      delete track.dataset.scrollProducts;
    };
  }, [count]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const list =
        stageRef.current?.querySelector<HTMLElement>('[role="tablist"]');
      const tab = list?.querySelector<HTMLElement>('[data-active]');
      if (!list || !tab) return;
      const bounds = list.getBoundingClientRect();
      const active = tab.getBoundingClientRect();
      list.scrollBy({
        left: active.left + active.width / 2 - bounds.left - bounds.width / 2,
        behavior: 'instant',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeIndex]);

  const selectProduct = useCallback(
    (index: number) => {
      setActiveIndex(index);
      const { enabled, top, stride } = geometry.current;
      if (!enabled || !trackRef.current) return;
      const start =
        window.scrollY + trackRef.current.getBoundingClientRect().top - top;
      // Move to the chosen product's scroll segment so the next scroll continues there.
      scrollPageTo(start + productScrollOffset(index, stride, count));
    },
    [count],
  );

  return { trackRef, stageRef, activeIndex, selectProduct };
}

```


### lib/scroll-progress.ts

```tsx
/** Normalized progress is bounded even for short sections and overscroll. */
export function progressBetween(
  position: number,
  start: number,
  end: number,
): number {
  if (end <= start) return position >= end ? 1 : 0;
  return Math.min(1, Math.max(0, (position - start) / (end - start)));
}

export function sceneProgress(
  top: number,
  height: number,
  viewport: number,
): number {
  return progressBetween(-top, 0, Math.max(1, height - viewport));
}

export function craftStep(progress: number): number {
  return Math.min(2, Math.max(0, Math.floor(progress * 3)));
}

/** A word reaches full contrast before the next word starts to light up. */
export function wordProgress(
  progress: number,
  index: number,
  total: number,
): number {
  return progressBetween(progress * (total + 2), index, index + 2);
}

/** Each product gets a full dwell segment, including the last before release. */
export function productScrollIndex(
  distance: number,
  stride: number,
  count: number,
): number {
  if (count < 1 || stride <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.floor(distance / stride)));
}

export function productScrollOffset(
  index: number,
  stride: number,
  count: number,
): number {
  if (count < 1 || stride <= 0) return 0;
  return (Math.min(count - 1, Math.max(0, index)) + 0.1) * stride;
}

```


### app/page.tsx

```tsx
'use client';

/* oxlint-disable next/no-img-element -- Shared with the static GitHub Pages build; artwork is already optimized. */

import { useEffect, useState } from 'react';
import {
  ScrollExperience,
  ScrollWords,
  MotionHeading,
  HoverLabel,
} from './scroll-experience';
import { assetPath } from '@/lib/asset-path';
import { InstallationVideo } from './installation-video';
import { CreativeRuntime } from './creative-runtime';
import { FeatureJourney } from './feature-journey';
import { PaintComparison } from './paint-comparison';
import { useProductScroll } from './use-product-scroll';
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowUpLeft,
  ArrowUp,
  Menu,
  X,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';

const links = [
  { href: '#protection', label: 'عالم الحماية' },
  { href: '#finishes', label: 'منتجاتنا' },
  { href: '#craft', label: 'عناية بالتفاصيل' },
];
const finishes = [
  {
    id: 'crystal',
    number: '01',
    en: 'GLOSS FINISH',
    title: 'صفاء يحفظ كل انعكاس.',
    name: 'PS CRYSTAL',
    warranty: '10',
    years: 'سنوات ضمان',
    finish: 'تشطيب لامع',
    description:
      'تشطيب لامع للحفاظ على حضور سيارتك الأصلي. PS CRYSTAL يجمع الحماية مع إطلالة صافية، بضمان لمدة 10 سنوات.',
    tags: ['تشطيب لامع', 'ضمان 10 سنوات', 'حماية الطلاء'],
  },
  {
    id: 'titanium',
    number: '02',
    en: 'GLOSS FINISH',
    title: 'حضور لامع. ثقة أطول.',
    name: 'PS TITANIUM',
    warranty: '12',
    years: 'سنة ضمان',
    finish: 'تشطيب لامع',
    description:
      'اختيار لامع بضمان هو الأطول ضمن مجموعة PS. حماية لطلاء سيارتك مع تشطيب Gloss وضمان لمدة 12 سنة.',
    tags: ['تشطيب لامع', 'ضمان 12 سنة', 'حماية الطلاء'],
  },
  {
    id: 'satin',
    number: '03',
    en: 'SATIN MATTE FINISH',
    title: 'أناقة الساتان. بتوقيعك.',
    name: 'PS SATIN',
    warranty: '10',
    years: 'سنوات ضمان',
    finish: 'ساتان مطفي',
    description:
      'تشطيب ساتان مطفي يمنح خطوط السيارة حضورًا هادئًا ومميزًا. PS SATIN بضمان لمدة 10 سنوات.',
    tags: ['ساتان مطفي', 'ضمان 10 سنوات', 'حماية الطلاء'],
  },
  {
    id: 'stealth',
    number: '04',
    en: 'STANDARD MATTE FINISH',
    title: 'شخصية تحب الاختلاف.',
    name: 'PS STEALTH',
    warranty: '10',
    years: 'سنوات ضمان',
    finish: 'مطفي قياسي',
    description:
      'لمن يفضّل التشطيب المطفي القياسي. PS STEALTH يمنح السيارة إطلالة Matte، مع ضمان لمدة 10 سنوات.',
    tags: ['مطفي قياسي', 'ضمان 10 سنوات', 'حماية الطلاء'],
  },
  {
    id: 'color',
    number: '05',
    en: 'COLOR FINISH',
    title: 'لونك. تعبيرك. حمايتك.',
    name: 'PS COLOR',
    warranty: '7',
    years: 'سنوات ضمان',
    finish: 'تشطيب ملون',
    description:
      'مساحة جديدة للتعبير عن ذوقك بتشطيب ملون. PS COLOR بضمان لمدة 7 سنوات. تواصل معنا لاستكشاف الألوان المتاحة.',
    tags: ['تشطيب ملون', 'ضمان 7 سنوات', 'شخصية متجددة'],
  },
  {
    id: 'vision',
    number: '06',
    en: 'PS VISION',
    title: 'اختيار آخر من عالم PS.',
    name: 'PS VISION',
    warranty: '1',
    years: 'سنة ضمان',
    finish: 'تعرّف على المواصفات',
    description:
      'PS VISION ضمن عائلة Precious Shield، بضمان لمدة سنة واحدة. تواصل معنا لمعرفة المواصفات والتطبيق المناسب لسيارتك.',
    tags: ['ضمان سنة واحدة', 'Precious Shield'],
  },
];

const carDescriptions: Record<string, string> = {
  crystal: 'كوبيه رياضية بيضاء بتشطيب لامع — تصوير CGI توضيحي لـ PS CRYSTAL',
  titanium:
    'سيدان رياضية جرافيت بتشطيب معدني لامع — تصوير CGI توضيحي لـ PS TITANIUM',
  satin: 'سيارة كروس أوفر بلون شامبين ساتان — تصوير CGI توضيحي لـ PS SATIN',
  stealth: 'سيارة دفع رباعي سوداء بتشطيب مطفي — تصوير CGI توضيحي لـ PS STEALTH',
  color: 'سيارة سوبركار خضراء بلون زمردي لامع — تصوير CGI توضيحي لـ PS COLOR',
  vision: 'سيدان فاخرة فضية — تصوير CGI توضيحي لـ PS VISION',
};

function Logo() {
  return (
    <span className="brand-mark">
      <img
        src={assetPath('/images/ps-logo.png')}
        alt="PS"
        width="595"
        height="842"
      />
    </span>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { trackRef, stageRef, activeIndex, selectProduct } = useProductScroll(
    finishes.length,
  );

  useEffect(() => {
    const next = finishes[activeIndex + 1];
    if (next) {
      const image = new Image();
      image.src = assetPath(`/images/products/${next.id}.webp`);
    }
  }, [activeIndex]);

  return (
    <>
      <ScrollExperience />
      <CreativeRuntime />
      <a href="#main" className="skip-link">
        انتقل إلى المحتوى
      </a>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="PS — الصفحة الرئيسية">
          <Logo />
          <span className="brand-name" dir="ltr">
            PRECIOUS SHIELD
            <br />
            <span>PAINT PROTECTION FILMS</span>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              <HoverLabel>{link.label}</HoverLabel>
            </a>
          ))}
          <a
            href="https://preciousshield.com/#console"
            target="_blank"
            rel="noopener noreferrer"
          >
            تحقّق من ضمانك
          </a>
        </nav>
        <a
          className="header-cta"
          href="https://wa.me/19406194638"
          target="_blank"
          rel="noopener noreferrer"
        >
          <HoverLabel>تواصل معنا</HoverLabel> <ArrowUpLeft size={17} />
        </a>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger className="mobile-menu" aria-label="فتح القائمة">
            <Menu size={23} />
          </SheetTrigger>
          <SheetContent
            className="ps-menu"
            showCloseButton={false}
            side="right"
          >
            <div className="menu-top">
              <Logo />
              <SheetClose className="icon-button" aria-label="إغلاق القائمة">
                <X />
              </SheetClose>
            </div>
            <SheetTitle className="sr-only">القائمة الرئيسية</SheetTitle>
            <SheetDescription className="sr-only">
              اكتشف أفلام الحماية والتشطيبات وطريقة التركيب.
            </SheetDescription>
            <nav>
              {links.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  <span dir="ltr">0{i + 1}</span>
                  {link.label}
                  <ArrowUpLeft />
                </a>
              ))}
            </nav>
            <p dir="ltr">PROTECT WHAT MOVES YOU.</p>
          </SheetContent>
        </Sheet>
      </header>
      <main id="main">
        <section
          className="hero-scroll"
          id="home"
          data-chapter
          aria-labelledby="hero-title"
        >
          <div className="hero">
            <div className="hero-studio-light" aria-hidden="true" />
            <img
              className="hero-image"
              src={assetPath('/images/products/crystal.webp')}
              alt="كوبيه فاخرة بيضاء بتصوير CGI احترافي وإضاءة ستوديو ناعمة"
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <div className="hero-shade" />
            <div className="hero-content">
              <p className="eyebrow">
                <span className="red-line" />
                فن الحفاظ على التفاصيل
              </p>
              <h1 id="hero-title">
                <span className="title-line">
                  <span>جمال يستحق</span>
                </span>
                <span className="title-line">
                  <span>أن يدوم.</span>
                </span>
              </h1>
              <p className="hero-copy">
                كل خطّ فيها يستحق الحماية.
                <br />
                أفلام حماية الطلاء من Precious Shield.
              </p>
              <a className="primary-button" href="#protection">
                <HoverLabel>اكتشف عالم الحماية</HoverLabel>{' '}
                <ArrowDownLeft size={21} />
              </a>
            </div>
            <div className="hero-echo" aria-hidden="true">
              <span dir="ltr">
                PRECIOUS
                <br />
                SHIELD.
              </span>
              <p>لا تُرى. لكن تصنع الفارق.</p>
            </div>
            <div className="hero-scene-meter" aria-hidden="true">
              <span />
            </div>
            <div className="hero-bottom">
              <a className="scroll-cue" href="#protection">
                <span className="circle">
                  <ArrowDown size={17} />
                </span>
                اكتشف ما وراء اللمعان
              </a>
              <span className="hero-caption" dir="ltr">
                INVISIBLE PROTECTION.
                <br />
                <strong>UNMISTAKABLE PRESENCE.</strong>
              </span>
              <span className="section-index" dir="ltr">
                <b>01</b>
                <span />
                04
              </span>
            </div>
          </div>
        </section>
        <section
          id="protection"
          data-chapter
          className="protection section-pad"
        >
          <div className="section-heading reveal">
            <p className="eyebrow">
              <span className="red-line" />
              01 / عالم الحماية
            </p>
            <span className="english-label" dir="ltr">
              ENGINEERED TO PRESERVE.
            </span>
          </div>
          <div className="intro-grid">
            <h2 className="reading-title">
              <ScrollWords>لا تُرى.</ScrollWords>
              <br />
              <ScrollWords>لكن تصنع الفارق.</ScrollWords>
            </h2>
            <div className="intro-copy">
              <p>
                <ScrollWords>الطريق مليء بتفاصيل لا تختارها.</ScrollWords>
                <br />
                <ScrollWords>الحماية هي التفصيلة التي تختارها أنت.</ScrollWords>
              </p>
              <p>
                أفلام حماية الطلاء <b dir="ltr">PPF</b> طبقة شفافة تُركّب فوق سطح
                السيارة، تساعد على تقليل أثر الخدوش السطحية وحصى الطريق، مع
                الحفاظ على جمال الطلاء.
              </p>
              <a className="text-link" href="#finishes">
                <HoverLabel>اكتشف التشطيب المناسب لك</HoverLabel>{' '}
                <ArrowUpLeft size={19} />
              </a>
            </div>
          </div>
        </section>
        <FeatureJourney />
        <section id="finishes" data-chapter className="finishes section-pad">
          <div className="section-heading reveal">
            <p className="eyebrow">
              <span className="red-line" />
              02 / شخصيتك، بتشطيبك
            </p>
            <span className="english-label" dir="ltr">
              SIX CHOICES. ONE STANDARD.
            </span>
          </div>
          <div className="finish-heading">
            <MotionHeading lines={['ستة اختيارات.', 'معيار واحد.']} />
            <p>
              من اللمعان الصافي إلى الساتان واللون.
              <br />
              تعرّف على عائلة Precious Shield واكتشف اختيارك.
            </p>
          </div>
          <div className="product-scroll-track" ref={trackRef}>
            <div className="product-scroll-stage" ref={stageRef}>
              <Tabs
                value={finishes[activeIndex].id}
                onValueChange={(value) => {
                  const index = finishes.findIndex(
                    (product) => product.id === value,
                  );
                  if (index >= 0) selectProduct(index);
                }}
                className="finish-tabs"
              >
                <TabsList
                  className="finish-tab-list"
                  aria-label="اختيار منتج Precious Shield"
                >
                  {finishes.map((product) => (
                    <TabsTrigger key={product.id} value={product.id}>
                      <span className={`finish-dot ${product.id}-dot`} />
                      <span dir="ltr">{product.name}</span>
                      <small>
                        {product.warranty} {product.years}
                      </small>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="product-scroll-status">
                  <span>اسكرول لاكتشاف المنتجات</span>
                  <span dir="ltr">
                    {String(activeIndex + 1).padStart(2, '0')} / 06
                  </span>
                  <a href="#craft">
                    تخطّي المنتجات <ArrowDown size={14} aria-hidden="true" />
                  </a>
                </div>
                {finishes.map((finish) => (
                  <TabsContent
                    key={finish.id}
                    value={finish.id}
                    className="finish-panel"
                  >
                    <div className="finish-image-wrap product-car-stage">
                      <span
                        className="product-stage-word"
                        dir="ltr"
                        aria-hidden="true"
                      >
                        {finish.name.replace('PS ', '')}
                      </span>
                      <img
                        className="product-car-image"
                        src={assetPath(`/images/products/${finish.id}.webp`)}
                        alt={carDescriptions[finish.id]}
                        width={1536}
                        height={1024}
                        loading={finish.id === 'crystal' ? 'eager' : 'lazy'}
                      />
                      <span className="product-image-name" dir="ltr">
                        {finish.name}
                      </span>
                      <span className="image-note">
                        تصوّر CGI • يختلف المظهر حسب الفيلم والطلاء
                      </span>
                    </div>
                    <div className="finish-info">
                      <div className="product-meta">
                        <p className="english-label red-text" dir="ltr">
                          {finish.en}
                        </p>
                        <div className="warranty">
                          <strong>{finish.warranty}</strong>
                          <span>{finish.years}</span>
                        </div>
                      </div>
                      <h3>{finish.title}</h3>
                      <p>{finish.description}</p>
                      <ul>
                        {finish.tags.map((tag) => (
                          <li key={tag}>
                            <span />
                            {tag}
                          </li>
                        ))}
                      </ul>
                      <a
                        className="text-link"
                        href={`https://wa.me/19406194638?text=${encodeURIComponent('مرحبًا، أرغب في معرفة المزيد عن ' + finish.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <HoverLabel>استفسر عن {finish.name}</HoverLabel>{' '}
                        <ArrowUpLeft size={18} />
                      </a>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              <div className="product-scroll-meter" aria-hidden="true">
                <span />
              </div>
            </div>
          </div>
          <p className="product-note">
            مدد الضمان حسب المنتج، وتخضع لشروط ضمان Precious Shield. تحقّق من
            ضمانك وفعّله عبر سجل الضمان الرقمي.
          </p>
        </section>
        <PaintComparison />
        <section id="craft" data-chapter className="craft">
          <div className="craft-stage">
            <div className="craft-photo craft-photo--video">
              <InstallationVideo />
            </div>
            <div className="craft-content section-pad">
              <div>
                <p className="eyebrow">
                  <span className="red-line" />
                  03 / عناية بالتفاصيل
                </p>
                <MotionHeading lines={['الفارق في', 'آخر مليمتر.']} />
                <p className="craft-lead">
                  الحماية الجيدة تبدأ قبل تركيب الفيلم.
                  <br />
                  وتكتمل بالاهتمام بكل حافة وانحناءة.
                </p>
                <ol className="steps">
                  {[
                    {
                      title: 'فهم السطح',
                      text: 'تقييم حالة الطلاء وتحديد الأجزاء المطلوب حمايتها.',
                    },
                    {
                      title: 'تحضير بعناية',
                      text: 'تنظيف وتجهيز السطح لاستقبال الفيلم.',
                    },
                    {
                      title: 'تركيب ومراجعة',
                      text: 'ضبط الفيلم، العناية بالحواف، ومراجعة التشطيب النهائي.',
                    },
                  ].map((step, i) => (
                    <li key={step.title}>
                      <span dir="ltr">0{i + 1}</span>
                      <div>
                        <h3>{step.title}</h3>
                        <p>{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
        <section className="closing section-pad" id="ps" data-chapter>
          <div className="section-heading">
            <p className="eyebrow">
              <span className="red-line" />
              04 / هذا هو إحساس PS
            </p>
            <span className="english-label" dir="ltr">
              PROTECT WHAT MOVES YOU.
            </span>
          </div>
          <div className="closing-main">
            <MotionHeading lines={['استمتع بالطريق.', 'واترك الحماية لنا.']} />
            <a
              href="https://wa.me/19406194638"
              target="_blank"
              rel="noopener noreferrer"
              className="closing-link"
              aria-label="تواصل مع Precious Shield على واتساب"
            >
              <ArrowUpLeft strokeWidth={1} />
            </a>
          </div>
          <div className="closing-bottom">
            <span>حماية مدروسة. جمال يدوم.</span>
            <div className="contact-links">
              <a
                className="text-link"
                href="https://wa.me/19406194638"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HoverLabel>تواصل على واتساب</HoverLabel>{' '}
                <ArrowUpLeft size={18} />
              </a>
              <a
                className="text-link"
                href="https://preciousshield.com/#console"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HoverLabel>تحقّق من ضمانك</HoverLabel> <ArrowUpLeft size={18} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <div className="closing-wordmark-wrap" aria-hidden="true">
        <span className="closing-wordmark" dir="ltr">
          PRECIOUS SHIELD
        </span>
      </div>
      <footer>
        <a href="#home" className="brand" aria-label="العودة للرئيسية">
          <Logo />
          <span dir="ltr">PRECIOUS SHIELD</span>
        </a>
        <a className="footer-email" href="mailto:info@preciousshield.com">
          info@preciousshield.com
        </a>
        <span className="copyright">
          © {new Date().getFullYear()} Precious Shield. جميع الحقوق محفوظة.
        </span>
        <a className="back-top" href="#home">
          للأعلى <ArrowUp size={16} />
        </a>
      </footer>
    </>
  );
}

```


## 6. Tailwind and CSS

The feature cards use `border border-white/15 bg-white/5 backdrop-blur-[16px]`; the following scoped styles extend the existing Tailwind theme. Keep the existing Arabic font and page CSS. The complete stylesheet remains in `app/globals.css`.

```css
/* Cinematic interaction layer. Vehicle pixels are never filtered or tinted. */
@font-face { font-family: Syne; font-style: normal; font-weight: 500; font-display: swap; src: url('../public/fonts/syne-medium.ttf') format('truetype'); }
@font-face { font-family: Syne; font-style: normal; font-weight: 700; font-display: swap; src: url('../public/fonts/syne-bold.ttf') format('truetype'); }
.english-label, .closing-wordmark, .loader-count, .loader-brand, .glass-feature-top, .comparison-labels { font-family: Syne, Arial, sans-serif; }
html.lenis { scroll-behavior: auto !important; }
.motion-heading .motion-word { transition: none !important; }
.cinematic-loader { position: fixed; inset: 0; z-index: 200; background: #000; color: #f3f3ef; display: flex; flex-direction: column; justify-content: space-between; padding: clamp(24px, 5vw, 80px); animation: loader-failsafe 0.01s 6s forwards; }
.cinematic-loader[hidden] { display: none; }
.loader-brand { font-size: 15px; letter-spacing: .14em; align-self: flex-end; }
.loader-count { font-size: clamp(100px, 24vw, 380px); font-weight: 500; line-height: 1; letter-spacing: -.075em; align-self: flex-start; font-variant-numeric: tabular-nums; }
.loader-count small { font-size: .22em; vertical-align: top; letter-spacing: -.03em; }
.loader-footer { display: flex; justify-content: space-between; align-items: center; gap: 24px; font-size: 11px; letter-spacing: .13em; }
.loader-footer button { font: 13px PSArabic, Arial, sans-serif; min-height: 44px; border-bottom: 1px solid #555; letter-spacing: 0; }
@keyframes loader-failsafe { to { visibility: hidden; pointer-events: none; } }
.creative-cursor { position: fixed; left: 0; top: 0; width: 0; height: 0; z-index: 210; pointer-events: none; opacity: 0; display: none; }
.creative-cursor > div { width: 18px; height: 18px; border: 1px solid #e7473f; border-radius: 50%; transform: translate(-50%, -50%); display: grid; place-items: center; transition: width .22s, height .22s, background .22s; background: transparent; }
.creative-cursor span { color: #fff; font: 10px Syne, sans-serif; letter-spacing: .08em; }
.creative-cursor[data-state='active'] > div { width: 48px; height: 48px; background: #d5292415; }
.creative-cursor[data-state='drag'] > div { width: 70px; height: 70px; background: #151515; }
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) { .creative-cursor { display: block; } }

/* One continuous product rail at every viewport; no two-row tab grid. */
.product-scroll-stage .finish-tab-list,
[data-scroll-products='true'] .finish-tab-list {
  display: flex !important; flex-wrap: nowrap !important; width: 100%; min-width: 0;
  overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain;
  justify-content: flex-start; align-self: stretch; scrollbar-width: thin; scrollbar-color: #b9b9b3 transparent;
}
.product-scroll-stage .finish-tab-list [role='tab'],
[data-scroll-products='true'] .finish-tab-list [role='tab'] {
  flex: 1 0 145px !important; width: auto; min-width: 145px; min-height: 68px;
  padding: 12px !important; border-bottom: 0 !important; border-inline-end: 1px solid #bcbcb9 !important;
  display: flex; flex-wrap: wrap; align-content: center; justify-content: flex-start;
}
.product-scroll-stage .finish-tab-list [role='tab']:last-child { border-inline-end: 0 !important; }
.product-scroll-stage .finish-tab-list [role='tab'] > span[dir='ltr'] { font-size: 11px; white-space: nowrap; }
.product-scroll-stage .finish-tab-list [role='tab'] small { font-size: 11px; }
[data-scroll-products='true'] .finish-tabs { display: grid !important; grid-template-rows: auto auto minmax(0, 1fr); min-width: 0; }
[data-scroll-products='true'] .finish-panel { height: 100%; min-width: 0; }
.product-scroll-stage .finish-panel[hidden] { display: none !important; }
[data-scroll-products='true'] .finish-info { min-width: 0; }
[data-scroll-products='true'] .product-scroll-status a { min-height: 44px; }
@media (max-width: 900px) {
  .product-scroll-stage .finish-tab-list [role='tab'], [data-scroll-products='true'] .finish-tab-list [role='tab'] { flex-basis: 128px !important; min-width: 128px; min-height: 64px; }
}

.feature-journey { background: #101113; color: #f2f2ef; }
.feature-journey-stage { position: relative; isolation: isolate; padding: 64px 0 32px; }
.feature-journey-heading { padding: 0 var(--page-pad); position: relative; z-index: 3; }
.feature-journey-heading .english-label { color: #90918e; font-size: 11px; }
.feature-journey-heading h2 { margin-top: 18px; font-size: clamp(30px, 3.7vw, 58px); }
.feature-window { overflow-x: auto; scrollbar-width: thin; scrollbar-color: #555 transparent; direction: ltr; }
.feature-rail { display: flex; width: max-content; gap: 24px; padding: 40px var(--page-pad); direction: ltr; }
.glass-feature { flex: 0 0 auto; width: clamp(300px, 44vw, 540px); min-height: 260px; padding: 28px; border-radius: 4px; backdrop-filter: blur(16px); background: rgb(255 255 255 / 4%); border: 1px solid rgb(255 255 255 / 16%); }
.glass-feature-top { display: flex; justify-content: space-between; color: #aeaea9; font-size: 11px; margin-bottom: 22px; }
.glass-feature > .english-label { color: #b2b2ad; font-size: 10px; letter-spacing: .13em; }
.glass-feature h3 { font-size: clamp(24px, 2.3vw, 34px); font-weight: 400; margin: 8px 0 12px; }
.glass-feature > p:last-child { color: #b8b8b3; font-size: 14px; line-height: 1.8; max-width: 36ch; }
.feature-car-layer { position: relative; z-index: 2; width: min(850px, 88%); height: 340px; margin: -20px auto 0; pointer-events: none; }
.feature-car-layer img { width: 100%; height: 100%; object-fit: contain; filter: none; transform: none; }
.feature-journey-footer { position: relative; z-index: 3; padding: 0 var(--page-pad); display: flex; align-items: center; justify-content: space-between; gap: 30px; color: #aaa; font-size: 12px; }
.feature-journey-footer > div { width: min(260px, 35vw); height: 1px; background: #424242; }
.feature-journey-footer > div > span { display: block; width: 100%; height: 100%; background: #e44940; transform-origin: left; transform: scaleX(var(--feature-progress, 0)); }
.feature-journey--pinned .feature-journey-stage { height: calc(100svh - 80px); min-height: 560px; padding-top: 32px; overflow: hidden; }
.feature-journey--pinned .feature-window { overflow: visible; }
.feature-journey--pinned .feature-rail { padding-inline: calc(50vw - clamp(300px, 44vw, 540px) / 2); padding-top: 26px; }
.feature-journey--pinned .glass-feature { min-height: 250px; padding-bottom: 56px; }
.feature-journey--pinned .feature-car-layer { position: absolute; bottom: 44px; left: 50%; margin: 0; transform: translateX(-50%); height: 42%; max-height: 390px; }
.feature-journey--pinned .feature-journey-footer { position: absolute; inset: auto 0 20px; }
@media (max-width: 900px) { .feature-journey-stage { padding-top: 44px; } .feature-car-layer { height: 240px; } .glass-feature { width: 78vw; } }

.paint-comparison { background: #eeeee9; color: #1b1b19; }
.comparison-heading { display: flex; justify-content: space-between; align-items: end; gap: 30px; margin: 40px 0; }
.comparison-heading h2 { font-size: clamp(32px, 4vw, 58px); }
.comparison-heading > p { color: #686862; line-height: 1.8; max-width: 32ch; }
.comparison-stage { position: relative; width: 100%; aspect-ratio: 16 / 8; background: #e5e5df; border: 1px solid #c9c9c1; overflow: hidden; isolation: isolate; }
.comparison-stage > img, .comparison-after, .comparison-after img { position: absolute; inset: 0; width: 100%; height: 100%; }
.comparison-stage img { object-fit: contain; filter: none; transform: none; }
.comparison-after { clip-path: inset(0 0 0 var(--comparison)); }
.comparison-labels { position: absolute; inset: 24px 24px auto; display: flex; justify-content: space-between; pointer-events: none; font-size: 11px; letter-spacing: .1em; }
.comparison-labels > span { padding: 8px 12px; background: #efefeb; color: #41413c; }
.comparison-divider { position: absolute; top: 0; bottom: 0; left: var(--comparison); width: 2px; transform: translateX(-50%); background: #f1c0ba; box-shadow: 0 0 8px #f1463b, 0 0 22px #d5292480; pointer-events: none; }
.comparison-divider > span { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 54px; height: 54px; border: 1px solid #ef948a; border-radius: 50%; background: #171719; color: #fff; display: grid; place-items: center; box-shadow: 0 0 25px #d5292466; }
.comparison-stage input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: ew-resize; direction: ltr; touch-action: pan-y; }
.comparison-stage:focus-within { outline: 2px solid #bc3029; outline-offset: 6px; }
.comparison-bottom { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-top: 18px; color: #64645d; font-size: 12px; line-height: 1.8; }
.comparison-presets { display: flex; gap: 8px; direction: ltr; }
.comparison-presets button { min-width: 44px; min-height: 44px; border: 1px solid #aaa; }
.comparison-presets button[aria-pressed='true'] { border-color: #c5362c; color: #a32a22; }
@media (max-width: 760px) { .comparison-heading, .comparison-bottom { align-items: start; flex-direction: column; } .comparison-stage { aspect-ratio: 1; } .comparison-labels { inset: 12px 12px auto; font-size: 9px; } }
@media (prefers-reduced-motion: reduce) { .cinematic-loader { display: none; } .creative-cursor { display: none; } .feature-rail { transform: none !important; } }
/* Keep the original automotive paint free of the legacy hero shade. */
.hero .hero-shade { display: none !important; }

.feature-window:focus-visible { outline: 1px solid #e44940; outline-offset: -2px; }
@media (min-width: 901px) and (max-height: 760px) {
  .feature-journey--pinned .feature-car-layer { height: 26%; }
  .feature-journey--pinned .glass-feature { min-height: 240px; padding: 22px; }
  .feature-journey--pinned .glass-feature h3 { font-size: 25px; }
}

```
