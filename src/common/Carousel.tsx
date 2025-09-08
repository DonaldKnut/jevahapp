import { useState, useEffect } from "react";
import ArrowBack from "../assets/icons/arrow_back.svg";
import ArrowForward from "../assets/icons/arrow_forward.svg";
import Star from "../assets/icons/star.svg";

interface CarouselProps {
  slides: Slide[];
}

interface Slide {
  src: string;
  text: string;
  name: string;
  country: string;
}

function Carousel({ slides }: CarouselProps) {
  let [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (isHovered || isTransitioning) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsTransitioning(false), 500);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isHovered, isTransitioning, slides.length]);

  function previousSlide() {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (current === 0) {
      setCurrent(slides.length - 1);
    } else {
      setCurrent(current - 1);
    }
    setTimeout(() => setIsTransitioning(false), 500);
  }

  function nextSlide() {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (current === slides.length - 1) {
      setCurrent(0);
    } else {
      setCurrent(current + 1);
    }
    setTimeout(() => setIsTransitioning(false), 500);
  }

  return (
    <div
      className="relative h-[450px] max-w-[420px] overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 to-teal-900 shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Smooth sliding container */}
      <div
        className="flex h-full transition-all duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="relative h-full w-full flex-shrink-0">
            {/* Background image with overlay */}
            <div className="relative h-full w-full">
              <img
                className="h-full w-full object-cover"
                src={slide.src}
                alt={`Testimonial from ${slide.name}`}
              />
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            </div>

            {/* Testimonial content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="mb-4">
                <div className="mb-3 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <img
                      key={i}
                      src={Star}
                      className="h-4 w-4"
                      alt="Star rating"
                    />
                  ))}
                </div>
                <blockquote className="mb-4 text-lg font-medium leading-relaxed">
                  {slide.text}
                </blockquote>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-orange-300">
                    {slide.name}
                  </h3>
                  <p className="text-sm text-gray-300">{slide.country}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={previousSlide}
        disabled={isTransitioning}
        className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <img src={ArrowBack} className="h-5 w-5" alt="Previous testimonial" />
      </button>

      <button
        onClick={nextSlide}
        disabled={isTransitioning}
        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <img src={ArrowForward} className="h-5 w-5" alt="Next testimonial" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrent(index);
                setTimeout(() => setIsTransitioning(false), 500);
              }
            }}
            className={`h-2 w-2 rounded-full transition-all duration-200 ${
              index === current
                ? "w-6 bg-orange-400"
                : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;
