/** Downloaded library cutouts. Original colors, proportions, alpha and shadows retained. */
type CarAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
  model: string;
  source: string;
  author: string;
};
export const carAssets: Record<string, CarAsset> = {
  crystal: {
    src: '/images/cars/huracan-white.webp',
    width: 1594,
    height: 776,
    alt: 'لامبورغيني هوراكان بيضاء، صورة مفرغة بالظل الأصلي',
    model: 'Lamborghini Huracán',
    source:
      'https://purepng.com/photo/5189/transportation-cars-white-lamborghini-huracan-car',
    author: 'datsvs',
  },
  titanium: {
    src: '/images/cars/panamera-black.webp',
    width: 1620,
    height: 906,
    alt: 'بورشه باناميرا سوداء، صورة مفرغة بالظل الأصلي',
    model: 'Porsche Panamera',
    source:
      'https://purepng.com/photo/5180/transportation-cars-black-porsche-panamera-car',
    author: 'datsvs',
  },
  satin: {
    src: '/images/cars/amg-silver.webp',
    width: 2208,
    height: 1000,
    alt: 'مرسيدس AMG GT فضية بتشطيب ساتان، صورة مفرغة بالظل الأصلي',
    model: 'Mercedes-AMG GT',
    source:
      'https://purepng.com/photo/28999/transportation-cars-mercedes-amg-sport-superfast',
    author: 'hamza786',
  },
  stealth: {
    src: '/images/cars/range-rover-black.webp',
    width: 1650,
    height: 1019,
    alt: 'رينج روفر سبورت سوداء، صورة مفرغة بالظل الأصلي',
    model: 'Range Rover Sport',
    source:
      'https://purepng.com/photo/29077/transportation-cars-land-rover-range-rover-sport',
    author: 'sohailawan',
  },
  color: {
    src: '/images/cars/huracan-green.webp',
    width: 2000,
    height: 764,
    alt: 'لامبورغيني هوراكان خضراء، صورة مفرغة بالظل الأصلي',
    model: 'Lamborghini Huracán',
    source:
      'https://purepng.com/photo/5214/transportation-cars-lamborghini-huracan-green-car',
    author: 'datsvs',
  },
  vision: {
    src: '/images/cars/bentley-bronze.webp',
    width: 1900,
    height: 1044,
    alt: 'بنتلي كونتيننتال بلون برونزي، صورة مفرغة بالظل الأصلي',
    model: 'Bentley Continental GT',
    source: 'https://purepng.com/photo/16319/bentley',
    author: 'PNGStock',
  },
};
export const glossCar: CarAsset = {
  src: '/images/cars/amg-red.webp',
  width: 1874,
  height: 888,
  alt: 'مرسيدس AMG GT حمراء بتشطيب لامع، صورة مفرغة بالظل الأصلي',
  model: 'Mercedes-AMG GT',
  source:
    'https://purepng.com/photo/5104/transportation-cars-mercedes-amg-gt-red-car',
  author: 'datsvs',
};
