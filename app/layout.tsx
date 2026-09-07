import type { Metadata } from 'next';
import './globals.css';
import { assetPath } from '@/lib/asset-path';

export const metadata: Metadata = {
  title: 'Precious Shield | جمال يستحق أن يدوم',
  description: 'اكتشف منتجات Precious Shield لأفلام حماية السيارات: CRYSTAL، TITANIUM، SATIN، STEALTH، COLOR وVISION. تشطيبات متعددة وضمان يصل إلى 12 سنة.',
  icons: { icon: assetPath('/images/ps-logo.png') },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
