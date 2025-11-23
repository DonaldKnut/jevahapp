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
      className="relative bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 px-8 pb-0 pt-[15vh] lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div
          className={`mb-12 mt-8 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <h1
            className={`mb-6 text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            Experience Faith. Connect with Purpose.
          </h1>
          <p
            className={`mx-auto mb-8 max-w-3xl text-lg text-gray-700 md:text-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
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

        {/* Hero Image */}
        <div
          className={`-mt-2 flex items-center justify-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.8s" }}
        >
          <img
            src={HomeImage}
            alt="Jevah App"
            className="h-auto w-full max-w-4xl object-contain"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
