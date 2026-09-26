import { Link } from "react-router-dom";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import VectorIcon from "../assets/logos/Vector.png";
import InclusiveIcon from "../assets/logos/inclusive.png";
import FaithIcon from "../assets/logos/faith.png";
import TargetIcon from "../assets/logos/target.png";

const Icon1 = VectorIcon;
const Icon2 = InclusiveIcon;
const Icon3 = FaithIcon;
const Icon4 = TargetIcon;

const featureCards = [
  {
    icon: Icon1,
    title: "Christ-Centered Innovation",
    description:
      "Every feature is built to strengthen your walk with God, from prayer walls to gospel content hubs, blending modern technology with timeless faith.",
  },
  {
    icon: Icon2,
    title: "Inclusive for All Generations",
    description:
      "Adults, youths, and children each have dedicated experiences tailored to their spiritual growth and comfort level.",
  },
  {
    icon: Icon3,
    title: "Interactive Faith Experience",
    description:
      "Engage with prayer communities, live events, and Bible-based games that turn faith into daily action, not just consumption.",
  },
  {
    icon: Icon4,
    title: "Designed with Purpose and Quality",
    description:
      "Crafted with serene tones of gold, blue, and white, Jevah's minimalist, sacred design invites calm reflection and joyful engagement.",
  },
];

function AboutUs() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      id="about"
      className="jevah-section py-12 px-4 sm:px-6 sm:py-16 md:py-20 lg:px-12 transition-colors duration-300"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12 items-start">
          <div
            className={`transition-all duration-700 ${
              isIntersecting ? "animate-fade-in-left opacity-100" : "opacity-0"
            }`}
          >
            <span className="inline-flex rounded-full bg-jevah-accent/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-jevah-accent ring-1 ring-jevah-accent/20 mb-3">
              About Jevah
            </span>
            <h2 className="mb-4 text-3xl font-black tracking-tight text-jevah-text sm:text-4xl lg:text-5xl">
              About Us
            </h2>
            <p className="mb-6 text-sm font-medium leading-relaxed text-jevah-text-muted sm:text-base md:text-lg">
              The Jevah App was created to help believers draw closer to God through
              digital fellowship. Inspired by the name Jehovah, Jevah represents
              faith, connection, and divine guidance. It's a gospel-centric mobile
              ecosystem designed for everyone from adults deepening their spiritual
              life to children discovering God's love through games and stories.
              Our mission is simple: to make faith accessible, engaging, and
              interactive in today's digital world.
            </p>
            <Link
              to="/music"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-jevah-accent to-emerald-600 px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-jevah-accent/20 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Read More →
            </Link>
          </div>

          <div
            className={`grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6 ${
              isIntersecting ? "animate-fade-in-right opacity-100" : "opacity-0"
            }`}
          >
            {featureCards.map((card, index) => (
              <div
                key={index}
                className="jevah-card rounded-2xl border border-jevah-border/60 bg-jevah-surface/90 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-jevah-accent/40 shadow-sm backdrop-blur-xl"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex items-center gap-3 mb-3.5 sm:block sm:mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-jevah-accent/10 p-2 ring-1 ring-jevah-accent/20">
                    <img
                      src={card.icon}
                      alt={card.title}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <h3 className="text-base font-extrabold text-jevah-text sm:hidden">
                    {card.title}
                  </h3>
                </div>

                <h3 className="hidden sm:block mb-2 text-base font-extrabold text-jevah-text sm:text-lg">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-jevah-text-muted font-medium">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;
