'use client';

/* oxlint-disable next/no-img-element -- Original library cutouts with native shadows. */
import { useState } from 'react';
import { ArrowUpLeft } from 'lucide-react';
import { assetPath } from '@/lib/asset-path';
import { comparisonAssets } from '@/lib/comparison-assets';
import { MotionHeading } from './scroll-experience';

type View = 'all' | 'gloss' | 'satin';
const views: { id: View; label: string }[] = [
  { id: 'all', label: 'قارن الإطلالتين' },
  { id: 'gloss', label: 'شاهد اللامع' },
  { id: 'satin', label: 'شاهد الساتان' },
];

export function PaintComparison() {
  const [view, setView] = useState<View>('all');
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
          FIND YOUR FINISH.
        </span>
      </div>
      <div className="comparison-heading">
        <div id="comparison-title">
          <MotionHeading lines={['لامع أم ساتان؟']} />
        </div>
        <p>
          قارن بين الانعكاسات اللامعة وهدوء الساتان، وشاهد كل إطلالة بتفاصيلها.
        </p>
      </div>
      <fieldset
        className="comparison-presets"
        aria-label="اختيار عرض التشطيبات"
      >
        {views.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            aria-controls="finish-gallery"
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </fieldset>
      {failed ? (
        <div className="comparison-unavailable">
          <p role="alert">
            تعذّر تحميل الصور. أعد تحميل الصفحة للمحاولة مرة أخرى.
          </p>
          <a href="#finishes">استكشف المنتجات</a>
        </div>
      ) : (
        <div
          id="finish-gallery"
          className={`finish-gallery ${view !== 'all' ? 'finish-gallery--single' : ''}`}
        >
          {comparisonAssets
            .filter((item) => view === 'all' || item.id === view)
            .map(({ id, label, en, description, car }) => (
              <figure className="finish-reference" key={id}>
                <div className="finish-reference-top">
                  <span dir="ltr">{en}</span>
                  <span dir="ltr">{car.model}</span>
                </div>
                <div className="finish-reference-image">
                  <img
                    src={assetPath(car.src)}
                    alt={car.alt}
                    width={car.width}
                    height={car.height}
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailed(true)}
                  />
                </div>
                <figcaption>
                  <h3>{label}</h3>
                  <p>{description}</p>
                </figcaption>
              </figure>
            ))}
        </div>
      )}
      <div className="comparison-bottom">
        <span>
          صور مرجعية بإضاءات وألوان مختلفة؛ لتحديد التشطيب المناسب، اطلب معاينة
          عيّنة الفيلم.
        </span>
        <a
          className="text-link"
          href="https://wa.me/19406194638"
          target="_blank"
          rel="noopener noreferrer"
        >
          اسأل عن التشطيبات <ArrowUpLeft size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
