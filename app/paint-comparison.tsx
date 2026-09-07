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
