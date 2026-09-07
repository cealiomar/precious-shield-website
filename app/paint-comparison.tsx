'use client';

/* oxlint-disable next/no-img-element -- Matched local finish artwork, no filters or transforms. */
import { useState, type CSSProperties } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import { assetPath } from '@/lib/asset-path';
import { comparisonAssets } from '@/lib/comparison-assets';
import { MotionHeading } from './scroll-experience';

const presets = [
  { value: 100, label: 'لامع بالكامل' },
  { value: 50, label: 'قارن الاثنين' },
  { value: 0, label: 'مطفي بالكامل' },
];

export function PaintComparison() {
  const [position, setPosition] = useState(50);
  const [failed, setFailed] = useState(false);
  return (
    <section
      id="compare"
      className="paint-comparison section-pad"
      aria-labelledby="comparison-title"
    >
      <div className="section-heading">
        <p className="eyebrow">
          <span className="red-line" />
          إطلالة تناسب شخصيتك
        </p>
        <span className="english-label" dir="ltr">
          ONE CAR. TWO FINISHES.
        </span>
      </div>
      <div className="comparison-heading">
        <div id="comparison-title">
          <MotionHeading lines={['لامع أم مطفي؟']} />
        </div>
        <p>
          حرّك الفاصل بين انعكاسات اللامع وهدوء المطفي، واختر الإطلالة الأقرب لك.
        </p>
      </div>
      {failed ? (
        <div className="comparison-unavailable">
          <p role="alert">
            تعذّر تحميل صور المقارنة. أعد تحميل الصفحة للمحاولة مرة أخرى.
          </p>
          <a href="#finishes">استكشف التشطيبات والمنتجات</a>
        </div>
      ) : (
        <div
          className="comparison-stage"
          data-cursor="drag"
          style={{ '--comparison': `${position}%` } as CSSProperties}
          dir="ltr"
        >
          <img
            src={assetPath(comparisonAssets.gloss)}
            alt="تصوّر لسيارة جرافيت بتشطيب لامع وانعكاسات واضحة"
            width={comparisonAssets.width}
            height={comparisonAssets.height}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
          <div className="comparison-after">
            <img
              src={assetPath(comparisonAssets.matte)}
              alt="تصوّر لنفس السيارة بتشطيب مطفي وانعكاسات ناعمة"
              width={comparisonAssets.width}
              height={comparisonAssets.height}
              loading="lazy"
              decoding="async"
              onError={() => setFailed(true)}
            />
          </div>
          <div className="comparison-labels" aria-hidden="true">
            <span dir="rtl" data-visible={position > 0}>
              لامع <bdi>GLOSS</bdi>
            </span>
            <span dir="rtl" data-visible={position < 100}>
              مطفي <bdi>MATTE</bdi>
            </span>
          </div>
          <div className="comparison-divider" aria-hidden="true">
            <span>
              <ChevronsLeftRight size={22} />
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={position}
            aria-label="مقارنة التشطيب اللامع والمطفي"
            aria-valuetext={`لامع ${position}%، مطفي ${100 - position}%`}
            aria-describedby="comparison-note"
            onChange={(event) => setPosition(Number(event.target.value))}
          />
        </div>
      )}
      <div className="comparison-bottom">
        <span id="comparison-note">
          تصوّر بصري للتشطيبات؛ يختلف المظهر حسب لون الطلاء والإضاءة.
        </span>
        {!failed && (
          <fieldset className="comparison-presets" aria-label="عرض التشطيبات">
            {presets.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPosition(value)}
                aria-pressed={position === value}
              >
                {label}
              </button>
            ))}
          </fieldset>
        )}
      </div>
    </section>
  );
}
