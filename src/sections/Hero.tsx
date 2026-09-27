import StoreLinks from "../common/StoreLinks";
import { BtnTypes } from "../common/StoreLinks.types";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import HomeImage from "../assets/logos/home-img-removebg-preview.png";

function Hero() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      id="download"
      className="relative bg-gradient-to-br from-[var(--jevah-hero-from)] via-[var(--jevah-hero-via)] to-[var(--jevah-hero-to)] px-4 pb-0 pt-24 transition-colors duration-300 xs:px-6 sm:px-8 sm:pt-[15vh] lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div
          className={`mb-12 mt-8 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <h1
            className={`mb-4 text-[1.7rem] font-bold leading-tight text-jevah-text xs:mb-6 xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            Experience Faith.{" "}
            <span className="bg-gradient-to-r from-[var(--jevah-accent)] via-amber-500 to-[var(--jevah-accent-soft)] bg-clip-text text-transparent">
              Connect with Purpose.
            </span>
          </h1>
          <p
            className={`mx-auto mb-6 max-w-3xl text-sm leading-relaxed text-jevah-text-muted xs:mb-8 xs:text-base md:text-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.4s" }}
          >
            The Jevah App is your all-in-one Christian platform bringing gospel
            music, sermons, e-books, prayer communities, and children's Bible
            learning together in one sacred space.
          </p>
          <div
            className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.6s" }}
          >
            <StoreLinks type={BtnTypes.Standard} />
          </div>
        </div>

        <div
          className={`-mt-2 flex items-center justify-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.8s" }}
        >
          <img
            src={HomeImage}
            alt="Jevah App"
            className="h-auto w-full max-w-4xl object-contain dark:brightness-95 dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
