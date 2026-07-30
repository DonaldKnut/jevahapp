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
      className="jevah-section py-20 px-8 transition-colors duration-300 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2">
          <div
            className={`${isIntersecting ? "animate-fade-in-left" : "opacity-0"}`}
          >
            <h2 className="mb-6 text-4xl font-bold text-jevah-text">About Us</h2>
            <p className="mb-6 text-lg text-jevah-brand">
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
              className="jevah-btn-dark inline-block rounded-full px-6 py-3 transition-all duration-300 hover:opacity-90 hover:shadow-lg"
            >
              Read More
            </Link>
          </div>

          <div
            className={`grid grid-cols-2 gap-6 ${isIntersecting ? "animate-fade-in-right" : "opacity-0"}`}
          >
            {featureCards.map((card, index) => (
              <div
                key={index}
                className="jevah-card rounded-lg p-6 transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <img
                  src={card.icon}
                  alt={card.title}
                  className="mb-4 h-16 w-16 object-contain"
                />
                <h3 className="mb-2 text-lg font-semibold text-jevah-text">
                  {card.title}
                </h3>
                <p className="text-sm text-jevah-text-muted">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;
