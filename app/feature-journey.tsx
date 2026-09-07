'use client';

/* oxlint-disable next/no-img-element -- Original optimized local artwork. */
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Native overflow rail needs focus for keyboard scrolling. */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ShieldCheck, Layers3 } from 'lucide-react';
import { assetPath } from '@/lib/asset-path';
import { carAssets } from '@/lib/car-assets';
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
      id="technology"
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
        <section
          className="feature-window"
          tabIndex={0}
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
        </section>
        <div className="feature-car-layer">
          <img
            src={assetPath(carAssets.satin.src)}
            alt={carAssets.satin.alt}
            width={carAssets.satin.width}
            height={carAssets.satin.height}
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
