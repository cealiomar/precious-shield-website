'use client';

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

  const selectProduct = useCallback(
    (index: number) => {
      setActiveIndex(index);
      const { enabled, top, stride } = geometry.current;
      if (!enabled || !trackRef.current) return;
      const start =
        window.scrollY + trackRef.current.getBoundingClientRect().top - top;
      // Move to the chosen product's scroll segment so the next scroll continues there.
      window.scrollTo({
        top: start + productScrollOffset(index, stride, count),
        behavior: 'instant',
      });
    },
    [count],
  );

  return { trackRef, stageRef, activeIndex, selectProduct };
}
