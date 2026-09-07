'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

// Official upload; YouTube retains the original footage and playback controls.
const INSTALLATION_VIDEO = {
  id: 'IQqFJy0QhR4',
  start: 70,
  title: 'Porsche GT3 — PPF installation by Areté Auto Salon',
  channel: 'Areté Auto Salon',
};

export function InstallationVideo() {
  const playerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    const target = playerRef.current;
    if (!target) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    const sync = () => {
      setAutoplay(!motion.matches);
      setVisible(inView && !document.hidden);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(target);
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  const watchUrl = `https://www.youtube.com/watch?v=${INSTALLATION_VIDEO.id}&t=${INSTALLATION_VIDEO.start}s`;

  return (
    <figure
      className="installation-film"
      aria-label="فيديو توضيحي لتركيب الحماية"
    >
      <div className="installation-film-heading">
        <span className="english-label" dir="ltr">
          THE ART OF PROTECTION
        </span>
        <span className="installation-film-quality" dir="ltr">
          4K FILM
        </span>
      </div>
      <div className="installation-film-player" ref={playerRef}>
        {visible && (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${INSTALLATION_VIDEO.id}?start=${INSTALLATION_VIDEO.start}&playsinline=1&rel=0&controls=1&autoplay=${autoplay ? 1 : 0}&mute=1&loop=1&playlist=${INSTALLATION_VIDEO.id}`}
            title={INSTALLATION_VIDEO.title}
            width={1280}
            height={720}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
        )}
      </div>
      <figcaption className="installation-film-credit" dir="rtl">
        <span>
          تركيب حماية على بورشه GT3
          <small>
            فيديو توضيحي من <bdi>{INSTALLATION_VIDEO.channel}</bdi>
          </small>
        </span>
        <a href={watchUrl} target="_blank" rel="noopener noreferrer">
          <span>شاهد على YouTube</span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}
