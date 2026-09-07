import type Lenis from 'lenis';
let current: Lenis | undefined;
export function connectSmoothScroll(instance?: Lenis) {
  current = instance;
}
export function scrollPageTo(top: number) {
  if (current) current.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, behavior: 'instant' });
}
