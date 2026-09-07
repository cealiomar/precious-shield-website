'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, ArrowUpRight } from 'lucide-react';
import { assetPath } from '@/lib/asset-path';

// A short, silent excerpt. Provenance and edit details: docs/media-sources.md.
const FILM = {
  src: '/videos/installation-detail.mp4',
  poster: '/images/installation-poster.webp',
  source: 'https://www.youtube.com/watch?v=IQqFJy0QhR4&t=70s',
};

export function InstallationVideo() {
  const figureRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const syncRef = useRef<() => void>(() => {});
  const intentRef = useRef<'auto' | 'play' | 'pause'>('auto');
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const figure = figureRef.current;
    const video = videoRef.current;
    if (!figure || !video) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean };
      }
    ).connection;
    let inView = false;
    let disposed = false;
    let request = 0;

    const sync = () => {
      const token = ++request;
      const intent = intentRef.current;
      const mayPlay =
        inView &&
        !document.hidden &&
        intent !== 'pause' &&
        (intent === 'play' || (!motion.matches && !connection?.saveData));
      if (!mayPlay) {
        video.pause();
        return;
      }
      if (!video.getAttribute('src')) video.src = assetPath(FILM.src);
      video.muted = true;
      // Some browsers reject even muted autoplay; keep the poster and play button.
      void video
        .play()
        .then(() => {
          if (disposed || token !== request) {
            if (
              disposed ||
              document.hidden ||
              !inView ||
              intentRef.current === 'pause' ||
              (intentRef.current === 'auto' &&
                (motion.matches || connection?.saveData))
            )
              video.pause();
          }
        })
        .catch(() => {});
    };
    syncRef.current = sync;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(figure);
    const onMotionChange = () => {
      intentRef.current = 'auto';
      sync();
    };
    motion.addEventListener('change', onMotionChange);
    document.addEventListener('visibilitychange', sync);
    return () => {
      disposed = true;
      request++;
      video.pause();
      observer.disconnect();
      motion.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', sync);
      syncRef.current = () => {};
    };
  }, []);

  const togglePlayback = () => {
    intentRef.current = playing ? 'pause' : 'play';
    syncRef.current();
  };

  return (
    <figure
      className="installation-film"
      ref={figureRef}
      aria-label="لقطة توضيحية لتركيب فيلم حماية"
    >
      <video
        ref={videoRef}
        id="installation-background"
        className="installation-film-video"
        poster={assetPath(FILM.poster)}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        disablePictureInPicture
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setFailed(true);
          setPlaying(false);
        }}
      />
      <div className="installation-film-heading">
        <span className="english-label" dir="ltr">
          THE ART OF PROTECTION
        </span>
        <span className="installation-film-quality" dir="ltr">
          IN THE DETAILS
        </span>
      </div>
      <figcaption className="installation-film-credit" dir="rtl">
        <a href={FILM.source} target="_blank" rel="noopener noreferrer">
          <span>
            لقطة توضيحية · <bdi>Areté Auto Salon</bdi>
          </span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
        {failed ? (
          <output>تعذّر تشغيل الفيديو</output>
        ) : (
          <button
            type="button"
            onClick={togglePlayback}
            aria-controls="installation-background"
            aria-label={playing ? 'إيقاف الفيديو مؤقتًا' : 'تشغيل الفيديو'}
          >
            {playing ? (
              <Pause size={16} aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
            <span>{playing ? 'إيقاف الحركة' : 'تشغيل المشهد'}</span>
          </button>
        )}
      </figcaption>
    </figure>
  );
}
