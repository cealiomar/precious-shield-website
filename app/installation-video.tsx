'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { assetPath } from '@/lib/asset-path';

/** Silent ambient footage: lazy loading, explicit pause, and motion preferences. */
export function InstallationVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlRef = useRef<(() => void) | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean };
      }
    ).connection;
    let visible = false;
    let disposed = false;
    let intent: 'auto' | 'play' | 'pause' = 'auto';
    let shouldPlay = false;
    let broken = false;

    const load = () => {
      if (!video.getAttribute('src')) {
        video.src = assetPath('/videos/ppf-installation.mp4');
        video.load();
      }
    };
    const sync = () => {
      const allowed =
        intent === 'play' ||
        (intent === 'auto' && !preference.matches && !connection?.saveData);
      shouldPlay =
        !disposed && !broken && visible && !document.hidden && allowed;
      if (!shouldPlay) {
        video.pause();
        return;
      }
      load();
      video
        .play()
        .then(() => {
          if (disposed || !shouldPlay) video.pause();
        })
        .catch(() => {
          /* Browser autoplay restrictions leave the play button available. */
        });
    };
    controlRef.current = () => {
      intent = video.paused ? 'play' : 'pause';
      sync();
    };
    const proximity = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !preference.matches &&
          !connection?.saveData
        ) {
          load();
          proximity.disconnect();
        }
      },
      { rootMargin: '250px' },
    );
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        sync();
      },
      { threshold: [0, 0.2] },
    );
    const motionChange = () => {
      if (preference.matches && intent === 'play') intent = 'pause';
      sync();
    };
    const onError = () => {
      broken = true;
      shouldPlay = false;
      video.pause();
      setFailed(true);
    };
    proximity.observe(video);
    visibility.observe(video);
    preference.addEventListener('change', motionChange);
    document.addEventListener('visibilitychange', sync);
    video.addEventListener('error', onError);
    return () => {
      disposed = true;
      shouldPlay = false;
      controlRef.current = null;
      proximity.disconnect();
      visibility.disconnect();
      preference.removeEventListener('change', motionChange);
      document.removeEventListener('visibilitychange', sync);
      video.removeEventListener('error', onError);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        id="installation-video"
        className="installation-video"
        poster={assetPath('/images/craft.png')}
        width={1280}
        height={720}
        muted
        loop
        playsInline
        preload="none"
        hidden={failed}
        aria-label="فيديو توضيحي لتركيب فيلم حماية شفاف على سيارة داكنة، بدون صوت"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        متصفحك لا يدعم تشغيل الفيديو.
      </video>
      {failed && (
        // oxlint-disable-next-line next/no-img-element -- Original local poster is already the video's fallback asset.
        <img
          className="installation-video-fallback"
          src={assetPath('/images/craft.png')}
          alt="لقطة توضيحية لتركيب فيلم حماية شفاف على سيارة داكنة"
          width={1672}
          height={941}
        />
      )}
      <div className="installation-video-controls" dir="rtl">
        {!failed && (
          <button
            type="button"
            className="installation-video-toggle"
            aria-controls="installation-video"
            aria-label={
              playing ? 'إيقاف الفيديو مؤقتًا' : 'تشغيل فيديو تركيب الحماية'
            }
            onClick={() => controlRef.current?.()}
          >
            {playing ? (
              <Pause size={18} aria-hidden="true" />
            ) : (
              <Play size={18} aria-hidden="true" />
            )}
            <span>{playing ? 'إيقاف مؤقت' : 'شاهد التركيب'}</span>
          </button>
        )}
        <span className="installation-video-note">فيديو توضيحي</span>
      </div>
    </>
  );
}
