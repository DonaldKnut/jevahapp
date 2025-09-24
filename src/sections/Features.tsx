import AppFrame from "../assets/app_frame.png";
import ShieldCheck from "../assets/icons/check.png";
import Coins from "../assets/icons/coins.png";
import Frames from "../assets/frames.png";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

function Features() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      id="features"
      className="flex max-w-7xl flex-col gap-10 px-8 pt-10 lg:px-12 xl:m-auto xl:pt-20"
    >
      <article
        className={`text-cream-50 m-auto w-[30ch] text-center md:m-0 md:w-full ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
      >
        <h2
          className={`text-cream-50 mb-4 text-4xl font-semibold ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.2s" }}
        >
          Excellence Across Industries
        </h2>
        <p
          className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.4s" }}
        >
          From premium catering services to fashion industry solutions and
          <br />
          verified real estate investments, Jingles delivers value across
          sectors.
        </p>
      </article>

      <article className="flex w-full flex-col gap-8 overflow-hidden xl:h-96 xl:flex-row">
        <div
          className={`flex flex-col rounded-2xl bg-teal-700 px-4 transition-transform duration-300 hover:scale-105 sm:px-0 md:flex-row md:gap-8 xl:w-2/3 ${isIntersecting ? "animate-fade-in-left" : "opacity-0"}`}
        >
          <div className="mt-10 flex flex-col justify-center gap-4 text-center sm:mx-10 md:mx-0 md:ml-10 md:w-1/2 md:text-left">
            <h2 className="text-cream-50 m-auto text-center text-3xl font-semibold sm:w-[18ch] md:m-0 md:text-left">
              Jingles Catering & Events
            </h2>
            <p className="text-cream-50 m-auto text-center sm:w-[34ch] md:m-0 md:text-left">
              We bring flavors, elegance, and flawless coordination to your
              celebrations. From delicious meals and snacks to professional
              event planning, ensuring every occasion is memorable and
              stress-free.
            </p>
          </div>

          <div className="m-auto mt-10 max-w-72 md:mx-10 md:w-1/2 lg:mx-0">
            <img src={AppFrame} alt="JEVAH music and sermons" />
          </div>
        </div>

        <div
          className={`flex flex-col justify-center gap-4 rounded-2xl bg-orange-300 p-10 transition-transform duration-300 hover:scale-105 xl:w-1/3 ${isIntersecting ? "animate-fade-in-right" : "opacity-0"}`}
        >
          <div className="w-fit rounded-full bg-orange-400 p-4">
            <img src={ShieldCheck} alt="" />
          </div>
          <h2 className="text-3xl font-semibold text-white">
            Jingles Fulcrums
          </h2>
          <p className="text-white">
            The one-stop hub for the fashion industry. Deals in all types of
            sewing machines, spare parts, and accessories, alongside mannequins
            and sewing essentials. Powers creativity with reliable tools.
          </p>
        </div>
      </article>

      <article className="flex w-full flex-col gap-8 xl:h-96 xl:flex-row">
        <div
          className={`flex flex-col justify-center gap-4 rounded-2xl bg-teal-600 p-10 transition-transform duration-300 hover:scale-105 xl:w-1/3 ${isIntersecting ? "animate-fade-in-left" : "opacity-0"}`}
        >
          <div className="w-fit rounded-full bg-teal-500 p-4">
            <img src={Coins} alt="" />
          </div>
          <h2 className="text-3xl font-semibold text-white">
            Jingles Properties
          </h2>
          <p className="text-white">
            Your trusted partner in real estate. We specialize in selling
            verified, high-yielding properties; both buildings and lands.
            Through land banking and smart investments, we help you secure
            wealth and build financial stability.
          </p>
        </div>

        <div
          className={`flex flex-col gap-8 overflow-hidden rounded-2xl bg-orange-300 px-4 transition-transform duration-300 hover:scale-105 sm:px-0 md:flex-row md:gap-8 xl:w-2/3 ${isIntersecting ? "animate-fade-in-right" : "opacity-0"}`}
        >
          <div className="mt-10 flex flex-col justify-center gap-4 text-center sm:mx-10 md:mx-0 md:ml-10 md:mt-0 md:w-1/2 md:text-left">
            <h2 className="m-auto text-center text-3xl font-semibold text-white sm:w-[18ch] md:m-0 md:text-left">
              Trusted Excellence
            </h2>
            <p className="m-auto text-center text-white sm:w-[34ch] md:m-0 md:text-left">
              A trusted household brand redefining lifestyles through food,
              fashion, and real estate. Jingles delivers excellence, empowers
              industries, and creates wealth opportunities across all sectors.
            </p>
          </div>

          <div className="m-auto max-w-96 md:mt-36 md:w-1/2">
            <img src={Frames} alt="JEVAH live events and children's content" />
          </div>
        </div>
      </article>
    </section>
  );
}

export default Features;
