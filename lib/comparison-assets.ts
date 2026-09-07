import { carAssets, glossCar } from './car-assets';

/** Independent source photos: show whole images, never imply registered before/after. */
export const comparisonAssets = [
  {
    id: 'gloss',
    label: 'اللامع',
    en: 'GLOSS',
    description: 'انعكاسات واضحة وحضور لافت.',
    car: glossCar,
  },
  {
    id: 'satin',
    label: 'الساتان المطفي',
    en: 'SATIN',
    description: 'انعكاسات ناعمة تُبرز خطوط السيارة.',
    car: carAssets.satin,
  },
] as const;
