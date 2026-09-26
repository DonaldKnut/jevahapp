import { useEffect, useState } from "react";

export const CREATOR_PROMO_IMAGES = [
  {
    url: "https://res.cloudinary.com/dajpllbyu/image/upload/v1785390152/Two_Africans_listening_to_phones_202607300639_woclw7.jpg",
    alt: "Two Africans listening to music on phones",
  },
  {
    url: "https://res.cloudinary.com/bt01nio6/image/upload/f_auto,q_auto/Man_and_woman_using_phones_2K_20260925170145",
    alt: "Man and woman using phones",
  },
  {
    url: "https://res.cloudinary.com/bt01nio6/image/upload/v1790354218/Teenager_laughing_with_headphones_2K_20260925173645.jpg",
    alt: "Teenager laughing with headphones",
  },
];

interface AuthPromoSliderProps {
  images?: Array<{ url: string; alt: string }>;
  intervalMs?: number;
  className?: string;
}

export default function AuthPromoSlider({
  images = CREATOR_PROMO_IMAGES,
  intervalMs = 5000,
  className = "",
}: AuthPromoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {images.map((img, i) => {
        const isActive = i === currentIndex;
        return (
          <img
            key={img.url}
            src={img.url}
            alt={img.alt}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-1000 ease-in-out ${
              isActive
                ? "scale-105 opacity-100 brightness-90 saturate-110"
                : "scale-100 opacity-0 brightness-75"
            }`}
          />
        );
      })}

      {/* Slide Navigation Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-md">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to promo slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-5 bg-amber-400"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
