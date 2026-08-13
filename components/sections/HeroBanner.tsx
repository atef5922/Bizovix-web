"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/src/config/site";

const bannerSlides = [
  {
    image: "banner1.webp",
    badge: "Next-Gen Cloud ERP Platform",
    title: (
      <>
        One Platform.
        <br />
        Limitless Potential.
        <br />
        <span>Built for the Future.</span>
      </>
    ),
    description:
      "Bizovix ERP unifies your operations, automates workflows, and delivers real-time insights so you can make smarter decisions and scale with confidence.",
  },
  {
    image: "banner2.webp",
    badge: "Innovating The Future",
    title: (
      <>
        Bridging Borders,
        <br />
        Building Digital
        <br />
        <span>Futures</span>
      </>
    ),
    description:
      "Your business software expert for connected teams, cloud operations, secure workflows, and confident growth.",
  },
  {
    image: "banner3.webp",
    badge: "Innovating The Future",
    title: (
      <>
        Empowering Progress Through
        <br />
        <span>Innovation and Intelligence</span>
      </>
    ),
    description:
      "Business operation with vision and intelligence, built for faster decisions across finance, inventory, sales, and production.",
  },
];

export function HeroBanner() {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="banner-hero" aria-label="Bizovix cloud ERP overview">
      <div className="banner-slider">
        <Swiper
          modules={[Autoplay, Navigation]}
          loop
          speed={720}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          onSwiper={setSwiper}
          onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
          className="banner-swiper"
        >
          {bannerSlides.map((banner, index) => (
            <SwiperSlide key={banner.image}>
              <div className="banner-slide">
                <img
                  src={`/images/banner/${banner.image}`}
                  alt=""
                  className="banner-image"
                  aria-hidden="true"
                />

                <div className="banner-content">
                  <p className="banner-kicker">
                    <span />
                    {banner.badge}
                  </p>

                  {index === 0 ? (
                    <h1 className="banner-primary-title">
                      Cloud ERP Software for <span>Smarter Business Operations</span>
                    </h1>
                  ) : (
                    <h2>{banner.title}</h2>
                  )}

                  <div className="banner-rule" />

                  <p className="banner-copy">{banner.description}</p>

                  <div className="banner-actions">
                    <ButtonLink
                      href={siteConfig.erpDownloadPath}
                      download={siteConfig.erpDownloadFileName}
                      className="banner-action-primary"
                    >
                      Download ERP
                      <Download className="h-3.5 w-3.5" />
                    </ButtonLink>

                    <ButtonLink
                      href="/solutions"
                      variant="secondary"
                      className="banner-action-secondary"
                    >
                      Explore Solutions
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className="banner-nav banner-nav-prev"
          type="button"
          aria-label="Previous banner"
          onClick={() => swiper?.slidePrev()}
        >
          <ChevronLeft />
        </button>

        <button
          className="banner-nav banner-nav-next"
          type="button"
          aria-label="Next banner"
          onClick={() => swiper?.slideNext()}
        >
          <ChevronRight />
        </button>

        <div className="banner-dots" aria-label="Banner slides">
          {bannerSlides.map((banner, index) => (
            <button
              className={index === activeIndex ? "is-active" : undefined}
              key={banner.image}
              type="button"
              aria-label={`Show banner ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => swiper?.slideToLoop(index)}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
