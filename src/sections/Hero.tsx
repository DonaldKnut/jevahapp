import StoreLinks, { BtnTypes } from "../common/StoreLinks";
import Phone from "../assets/mockup.svg";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

const HeroImage =
  "https://res.cloudinary.com/dxojy40bv/image/upload/v1758720851/Content_detail_-_Audio_or_Video_zmkqhj.png";

function Hero() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="relative mt-4 flex h-fit max-w-7xl flex-col items-center gap-10 px-8 sm:gap-16 md:my-0 md:h-[84.9vh] md:flex-row md:gap-0 lg:px-12 xl:m-auto xl:gap-0 xl:overflow-hidden"
    >
      <div
        className={`sm:w-full md:w-3/6 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
      >
        <h1
          className={`text-cream-50 mx-auto mb-8 w-[12ch] text-center text-4xl font-semibold sm:text-5xl md:mx-0 md:text-left ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.2s" }}
        >
          Jingles Conglomerate
        </h1>
        <p
          className={`text-cream-50 m-auto w-[34ch] text-center md:m-0 md:text-left ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.4s" }}
        >
          A Household Brand of Trust, Taste & Value. A dynamic multi-sector
          brand built on excellence, precision, and trust. With a strong
          presence in food, fashion, and real estate, Jingles delivers premium
          services and products that add value to everyday living.
        </p>
        <div
          className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.6s" }}
        >
          <StoreLinks type={BtnTypes.Standard} />
        </div>
      </div>
      <div className="md:w-3/6 xl:mb-12 xl:overflow-hidden">
        <img
          className={`right-0 m-auto w-72 xl:absolute xl:left-6 xl:right-0 xl:mt-32 xl:w-80 ${isIntersecting ? "animate-fade-in-right" : "opacity-0"}`}
          src={Phone}
          alt="JEVAH app frame"
          style={{ animationDelay: "0.8s" }}
        />
        <img
          className={`hidden rounded-2xl xl:flex ${isIntersecting ? "animate-fade-in-left" : "opacity-0"}`}
          src={HeroImage}
          alt="A person engaging with JEVAH gospel content"
          style={{ animationDelay: "1s" }}
        />
      </div>
    </section>
  );
}

export default Hero;
