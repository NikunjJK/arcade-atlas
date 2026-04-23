'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type Screenshot = {
  id: string;
  image_url: string;
  sort_order?: number | null;
};

type ScreenshotGalleryProps = {
  screenshots: Screenshot[];
  gameTitle: string;
};

export default function ScreenshotGallery({
  screenshots,
  gameTitle,
}: ScreenshotGalleryProps) {
  const orderedScreenshots = useMemo(() => {
    return [...screenshots].sort((a, b) => {
      const aOrder = a.sort_order ?? 0;
      const bOrder = b.sort_order ?? 0;
      return aOrder - bOrder;
    });
  }, [screenshots]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [galleryTouchStartX, setGalleryTouchStartX] = useState<number | null>(null);
  const [galleryTouchEndX, setGalleryTouchEndX] = useState<number | null>(null);

  const [lightboxTouchStartX, setLightboxTouchStartX] = useState<number | null>(null);
  const [lightboxTouchEndX, setLightboxTouchEndX] = useState<number | null>(null);

  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const hasScreenshots = orderedScreenshots.length > 0;

  const goToPrevious = () => {
    setActiveIndex((prev) =>
      prev === 0 ? orderedScreenshots.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setActiveIndex((prev) =>
      prev === orderedScreenshots.length - 1 ? 0 : prev + 1
    );
  };

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  useEffect(() => {
    if (!hasScreenshots) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isLightboxOpen) {
        closeLightbox();
        return;
      }

      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasScreenshots, isLightboxOpen, orderedScreenshots.length]);

  useEffect(() => {
    const activeThumb = thumbnailRefs.current[activeIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLightboxOpen]);

  const handleGalleryTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setGalleryTouchEndX(null);
    setGalleryTouchStartX(e.targetTouches[0].clientX);
  };

  const handleGalleryTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setGalleryTouchEndX(e.targetTouches[0].clientX);
  };

  const handleGalleryTouchEnd = () => {
    if (galleryTouchStartX === null || galleryTouchEndX === null) return;

    const distance = galleryTouchStartX - galleryTouchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrevious();
    }
  };

  const handleLightboxTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setLightboxTouchEndX(null);
    setLightboxTouchStartX(e.targetTouches[0].clientX);
  };

  const handleLightboxTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setLightboxTouchEndX(e.targetTouches[0].clientX);
  };

  const handleLightboxTouchEnd = () => {
    if (lightboxTouchStartX === null || lightboxTouchEndX === null) return;

    const distance = lightboxTouchStartX - lightboxTouchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrevious();
    }
  };

  if (!hasScreenshots) return null;

  const activeImage = orderedScreenshots[activeIndex];

  return (
    <>
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Screenshots</h2>
          <p className="text-sm text-zinc-400">
            {activeIndex + 1} / {orderedScreenshots.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3 shadow-xl">
          <div
            className="group relative overflow-hidden rounded-xl bg-black"
            onTouchStart={handleGalleryTouchStart}
            onTouchMove={handleGalleryTouchMove}
            onTouchEnd={handleGalleryTouchEnd}
          >
            <button
              type="button"
              onClick={() => openLightbox(activeIndex)}
              className="relative block w-full text-left"
              aria-label="Open fullscreen screenshot viewer"
            >
              <div className="relative aspect-video w-full">
                <Image
                  src={activeImage.image_url}
                  alt={`${gameTitle} screenshot ${activeIndex + 1}`}
                  fill
                  priority
                  className="object-cover transition duration-300 md:group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                Click to expand
              </div>
            </button>

            {orderedScreenshots.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrevious}
                  aria-label="Previous screenshot"
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-2 text-white opacity-100 backdrop-blur transition hover:bg-black/80 md:opacity-0 md:group-hover:opacity-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Next screenshot"
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-2 text-white opacity-100 backdrop-blur transition hover:bg-black/80 md:opacity-0 md:group-hover:opacity-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {orderedScreenshots.length > 1 && (
            <div className="mt-4 overflow-x-auto">
              <div className="flex gap-3 pb-1">
                {orderedScreenshots.map((shot, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={shot.id}
                      ref={(el) => {
                        thumbnailRefs.current[index] = el;
                      }}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`View screenshot ${index + 1}`}
                      className={`relative h-20 w-36 shrink-0 overflow-hidden rounded-lg border transition ${
                        isActive
                          ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <Image
                        src={shot.image_url}
                        alt={`${gameTitle} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="144px"
                      />
                      <div
                        className={`absolute inset-0 transition ${
                          isActive ? 'bg-transparent' : 'bg-black/25'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div className="flex h-full w-full items-center justify-center p-3 md:p-6">
            <div
              className="relative flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
                <div>
                  <h3 className="text-sm font-semibold text-white md:text-base">
                    {gameTitle}
                  </h3>
                  <p className="text-xs text-zinc-400 md:text-sm">
                    Screenshot {activeIndex + 1} of {orderedScreenshots.length}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Close fullscreen viewer"
                  className="rounded-full border border-white/15 bg-white/5 p-2 text-white transition hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                className="group relative flex-1 bg-black"
                onTouchStart={handleLightboxTouchStart}
                onTouchMove={handleLightboxTouchMove}
                onTouchEnd={handleLightboxTouchEnd}
              >
                <div className="relative h-full w-full min-h-[320px]">
                  <Image
                    src={activeImage.image_url}
                    alt={`${gameTitle} fullscreen screenshot ${activeIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                </div>

                {orderedScreenshots.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goToPrevious}
                      aria-label="Previous screenshot"
                      className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-3 text-white backdrop-blur transition hover:bg-black/80"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button
                      type="button"
                      onClick={goToNext}
                      aria-label="Next screenshot"
                      className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-3 text-white backdrop-blur transition hover:bg-black/80"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              {orderedScreenshots.length > 1 && (
                <div className="border-t border-white/10 bg-zinc-950/90 px-4 py-4 md:px-6">
                  <div className="overflow-x-auto">
                    <div className="flex gap-3 pb-1">
                      {orderedScreenshots.map((shot, index) => {
                        const isActive = index === activeIndex;

                        return (
                          <button
                            key={`${shot.id}-lightbox`}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Open screenshot ${index + 1}`}
                            className={`relative h-20 w-36 shrink-0 overflow-hidden rounded-lg border transition ${
                              isActive
                                ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <Image
                              src={shot.image_url}
                              alt={`${gameTitle} lightbox thumbnail ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="144px"
                            />
                            <div
                              className={`absolute inset-0 transition ${
                                isActive ? 'bg-transparent' : 'bg-black/25'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}