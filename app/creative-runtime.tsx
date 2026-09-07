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
