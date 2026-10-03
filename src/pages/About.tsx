import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import ButtonLink from "../common/ButtonLink";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import LivePreview from "../assets/logos/live-preview.png";
import LiveIIImg from "../assets/logos/live-ii-img.png";
import KidsImg from "../assets/logos/kids-img.png";
import ForumImg from "../assets/logos/forum.png";

function About() {
  useDocumentMeta({
    title: "About Jevah — operated by Tevadice Limited",
    description:
      "Jevah is a digital platform operated by Tevadice Limited, a company registered in Nigeria.",
    canonicalPath: "/about",
  });
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const mainFeatures = [
    {
      title: "Gospel Content Hub",
      description:
        "Access a vast library of gospel music, sermons, and inspirational content. Discover new artists, listen to powerful messages, and grow in your faith through curated Christian media.",
      buttonText: "View Content",
      buttonHref: "/music",
      image: LivePreview,
      bgColor: "bg-green-800",
    },
    {
      title: "Prayer Wall & Faith Community",
      description:
        'Post prayer requests, support others by tapping "Pray for Me," and engage in a global community that intercedes together.',
      buttonText: "Join Community",
      buttonHref: "/forum",
      image: LiveIIImg,
      bgColor: "bg-orange-500",
    },
    {
      title: "Children's Zone",
      description:
        "Faith-filled fun for kids: Bible games, animated cartoons, and quizzes designed to help young hearts grow spiritually through play.",
      buttonText: "Explore Now",
      buttonHref: "/children",
      image: KidsImg,
      bgColor: "#090E24",
    },
    {
      title: "Groups, Forum & Connecting with your church members",
      description:
        "Join live worship streams, connect with believers worldwide, and share messages of hope and encouragement, even with your church members.",
      buttonText: "Create Group",
      buttonHref: "/forum",
      image: ForumImg,
      bgColor: "bg-teal-600",
    },
  ];

  const quickFeatures = [
    {
      icon: "📖",
      title: "E-books Library",
      description: "Thousands of Christian books and devotionals",
      href: "/ebooks",
    },
    {
      icon: "📺",
      title: "Live Sermons",
      description: "Watch and listen to inspiring sermons",
      href: "/sermons",
    },
    {
      icon: "📅",
      title: "Events",
      description: "Join worship services and Bible studies",
      href: "/events",
    },
    {
      icon: "💬",
      title: "Community Forum",
      description: "Connect and discuss with believers",
      href: "/forum",
    },
    {
      icon: "📝",
      title: "Blog",
      description: "Read faith-based articles and insights",
      href: "/blog",
    },
    {
      icon: "🔔",
      title: "Notifications",
      description: "Stay updated with prayer requests and events",
      href: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 px-4 py-16 pt-24 xs:px-6 sm:px-8 sm:py-20 sm:pt-[20vh] lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div
            className={`text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h1
              className={`mb-4 text-[1.7rem] font-bold leading-tight text-gray-900 xs:mb-6 xs:text-4xl md:text-6xl lg:text-7xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.2s" }}
            >
              About Jevah
            </h1>
            <p
              className={`mx-auto mb-8 max-w-3xl text-lg text-gray-700 md:text-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.4s" }}
            >
              The Jevah App was created to help believers draw closer to God
              through digital fellowship. Inspired by the name Jehovah, Jevah
              represents faith, connection, and divine guidance. It's a
              gospel-centric mobile ecosystem designed for everyone from adults
              deepening their spiritual life to children discovering God's love
              through games and stories. Our mission is simple: to make faith
              accessible, engaging, and interactive in today's digital world.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 xs:px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            The company behind Jevah
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">
            Jevah is a digital platform operated by Tevadice Limited, a company
            registered in Nigeria. We are focused on providing digital solutions
            through the Jevah platform, connecting users with the services and
            experiences available on our platform.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-gray-700">
            Our goal is to build a reliable and accessible digital experience
            for our users while continually improving our services.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Legal entity", value: "Tevadice Limited" },
              { label: "Platform", value: "Jevah" },
              { label: "Country of registration", value: "Nigeria" },
              {
                label: "Registered office",
                value: "1B Ondo Street, Okeira, Ogba, Lagos, Nigeria",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
              >
                <dt className="text-xs font-bold uppercase tracking-wider text-[#256E63]">
                  {row.label}
                </dt>
                <dd className="mt-2 text-base font-semibold text-gray-900">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-gray-600">
            Customer service and office locations are on the{" "}
            <Link to="/contact" className="font-semibold text-[#256E63] hover:underline">
              Contact page
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Main Features Section */}
      <section ref={ref} className="bg-white py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2
            className={`mb-16 text-center text-4xl font-bold text-gray-900 md:text-5xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Our Features
          </h2>

          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className={`mb-24 grid gap-12 md:grid-cols-2 md:items-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${0.2 * index}s` }}
            >
              {/* Text Content */}
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <h3 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                  {feature.title}
                </h3>
                <p className="mb-6 text-lg leading-relaxed text-gray-700">
                  {feature.description}
                </p>
                <Link
                  to={feature.buttonHref}
                  className="inline-block rounded-full px-8 py-4 text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg"
                  style={{ backgroundColor: "#090E24" }}
                >
                  {feature.buttonText}
                </Link>
              </div>

              {/* Image */}
              <div
                className={`flex justify-center rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] ${index % 2 === 1 ? "md:order-1" : ""} ${feature.bgColor.startsWith('#') ? '' : feature.bgColor}`}
                style={{
                  backgroundColor: feature.bgColor.startsWith('#') ? feature.bgColor : undefined,
                }}
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="h-auto w-full max-w-lg rounded-2xl md:w-[600px] lg:w-[700px]"
                  style={{
                    transform: index === 1 ? "rotate(-5deg)" : index === 3 ? "rotate(-12deg)" : "none",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Features Grid */}
      <section className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2
            className={`mb-12 text-center text-4xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            More Amazing Features
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickFeatures.map((feature, index) => (
              <Link
                key={index}
                to={feature.href}
                className={`group rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="mb-4 text-5xl transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h4 className="mb-2 text-xl font-bold text-gray-900">
                  {feature.title}
                </h4>
                <p className="mb-4 text-gray-600">{feature.description}</p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold transition-colors" style={{ color: '#256E63' }}>
                  Learn More
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className={`mb-6 text-4xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Join the Jevah Community
          </h2>
          <p
            className={`mb-8 text-lg text-gray-700 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            Experience faith in a whole new way. Download Jevah today and
            connect with believers worldwide.
          </p>
          <div
            className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.4s" }}
          >
            <ButtonLink
              href="#download"
              className="inline-block rounded-full px-8 py-4 text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: "#090E24" }}
            >
              Download App
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
