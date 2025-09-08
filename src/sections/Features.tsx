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
          Nurture Your Spiritual Journey
        </h2>
        <p
          className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.4s" }}
        >
          Access comprehensive gospel content, connect with believers worldwide,
          <br />
          and grow in faith through music, sermons, devotionals, and community.
        </p>
      </article>

      <article className="flex w-full flex-col gap-8 overflow-hidden xl:h-96 xl:flex-row">
        <div
          className={`flex flex-col rounded-2xl bg-teal-700 px-4 transition-transform duration-300 hover:scale-105 sm:px-0 md:flex-row md:gap-8 xl:w-2/3 ${isIntersecting ? "animate-fade-in-left" : "opacity-0"}`}
        >
          <div className="mt-10 flex flex-col justify-center gap-4 text-center sm:mx-10 md:mx-0 md:ml-10 md:w-1/2 md:text-left">
            <h2 className="text-cream-50 m-auto text-center text-3xl font-semibold sm:w-[18ch] md:m-0 md:text-left">
              Gospel Music & Sermons
            </h2>
            <p className="text-cream-50 m-auto text-center sm:w-[34ch] md:m-0 md:text-left">
              Access thousands of gospel songs, inspiring sermons, and spiritual
              teachings from pastors worldwide. Stream live services and connect
              with your church community.
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
            Prayer Wall & Community
          </h2>
          <p className="text-white">
            Share prayer requests, connect with believers, join group chats, and
            participate in forums. Build meaningful relationships within your
            faith community.
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
            Christian Marketplace
          </h2>
          <p className="text-white">
            Discover Christian books, devotionals, children's educational games,
            and faith-based products. Support Christian businesses and
            ministries through our virtual marketplace.
          </p>
        </div>

        <div
          className={`flex flex-col gap-8 overflow-hidden rounded-2xl bg-orange-300 px-4 transition-transform duration-300 hover:scale-105 sm:px-0 md:flex-row md:gap-8 xl:w-2/3 ${isIntersecting ? "animate-fade-in-right" : "opacity-0"}`}
        >
          <div className="mt-10 flex flex-col justify-center gap-4 text-center sm:mx-10 md:mx-0 md:ml-10 md:mt-0 md:w-1/2 md:text-left">
            <h2 className="m-auto text-center text-3xl font-semibold text-white sm:w-[18ch] md:m-0 md:text-left">
              Live Events & Children's Ministry
            </h2>
            <p className="m-auto text-center text-white sm:w-[34ch] md:m-0 md:text-left">
              Join live worship services, conferences, and Bible studies. Access
              educational games and activities designed to teach children about
              faith in fun, engaging ways.
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
