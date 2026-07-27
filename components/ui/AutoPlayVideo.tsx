"use client";

import { useEffect, useRef } from "react";

type AutoPlayVideoProps = {
  src: string;
  label: string;
  className?: string;
};

export function AutoPlayVideo({ src, label, className }: AutoPlayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      video.muted = true;
      video.defaultMuted = true;
      void video.play().catch(() => {
        // Browser autoplay can wait until metadata is available; event hooks below retry.
      });
    };

    play();
    video.addEventListener("loadedmetadata", play);
    video.addEventListener("canplay", play);
    document.addEventListener("visibilitychange", play);

    return () => {
      video.removeEventListener("loadedmetadata", play);
      video.removeEventListener("canplay", play);
      document.removeEventListener("visibilitychange", play);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      autoPlay
      muted
      playsInline
      loop
      preload="auto"
      aria-label={label}
    />
  );
}
