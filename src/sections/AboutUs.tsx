import { Link } from "react-router-dom";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import VectorIcon from "../assets/logos/Vector.png";
import InclusiveIcon from "../assets/logos/inclusive.png";
import FaithIcon from "../assets/logos/faith.png";
import TargetIcon from "../assets/logos/target.png";

// Icon placeholders - user will substitute these
const Icon1 = VectorIcon; // Christ-Centered Innovation icon
const Icon2 = InclusiveIcon; // Inclusive for All Generations icon
const Icon3 = FaithIcon; // Interactive Faith Experience icon
const Icon4 = TargetIcon; // Designed with Purpose and Quality icon

const featureCards = [
  {
    icon: Icon1,
    title: "Christ-Centered Innovation",
    description: "Every feature is built to strengthen your walk with God, from prayer walls to gospel content hubs, blending modern technology with timeless faith.",
  },
  {
    icon: Icon2,
    title: "Inclusive for All Generations",
    description: "Adults, youths, and children each have dedicated experiences tailored to their spiritual growth and comfort level.",
  },
  {
    icon: Icon3,
    title: "Interactive Faith Experience",
    description: "Engage with prayer communities, live events, and Bible-based games that turn faith into daily action, not just consumption.",
  },
  {
    icon: Icon4,
    title: "Designed with Purpose and Quality",
    description: "Crafted with serene tones of gold, blue, and white, Jevah's minimalist, sacred design invites calm reflection and joyful engagement.",
  },
];

function AboutUs() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      id="about"
      className="bg-white py-20 px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Left Side - Text Content */}
          <div
            className={`${isIntersecting ? "animate-fade-in-left" : "opacity-0"}`}
          >
            <h2 className="mb-6 text-4xl font-bold text-gray-900">
              About Us
            </h2>
            <p className="mb-6 text-lg" style={{ color: '#090E24' }}>
              The Jevah App was created to help believers draw closer to God
              through digital fellowship. Inspired by the name Jehovah, Jevah
              represents faith, connection, and divine guidance. It's a
              gospel-centric mobile ecosystem designed for everyone from adults
              deepening their spiritual life to children discovering God's love
              through games and stories. Our mission is simple: to make faith
              accessible, engaging, and interactive in today's digital world.
            </p>
            <Link
              to="/music"
              className="inline-block rounded-full px-6 py-3 text-white transition-all duration-300 hover:shadow-lg hover:opacity-90"
              style={{ backgroundColor: '#090E24' }}
            >
              Read More
            </Link>
          </div>

          {/* Right Side - Feature Cards */}
          <div
            className={`grid grid-cols-2 gap-6 ${isIntersecting ? "animate-fade-in-right" : "opacity-0"}`}
          >
            {featureCards.map((card, index) => (
              <div
                key={index}
                className="rounded-lg bg-gray-50 p-6 transition-all duration-300 hover:shadow-lg"
                style={{
                  animationDelay: `${0.1 * index}s`,
                }}
              >
                <img
                  src={card.icon}
                  alt={card.title}
                  className="mb-4 h-16 w-16 object-contain"
                />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;

