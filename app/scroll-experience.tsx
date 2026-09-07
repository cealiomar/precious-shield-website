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
