import { Link } from "react-router-dom";
import ButtonLink from "../common/ButtonLink";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import LivePreview from "../assets/logos/live-preview.png";
import LiveIIImg from "../assets/logos/live-ii-img.png";
import KidsImg from "../assets/logos/kids-img.png";
import ForumImg from "../assets/logos/forum.png";

const GospelPhone = LivePreview;
const PrayerPhone = LiveIIImg;
const ChildrenPhone = KidsImg;
const GroupsPhone = ForumImg;

const mainFeatures = [
  {
    id: 1,
    title: "Gospel Content Hub",
    description:
      "Access a vast library of gospel music, sermons, and inspirational content. Discover new artists, listen to powerful messages, and grow in your faith through curated Christian media.",
    buttonText: "View Content",
    buttonHref: "/music",
    phoneImage: GospelPhone,
    bgColor: "bg-green-800",
    textSide: "left",
    icon: "🎵",
  },
  {
    id: 2,
    title: "Prayer Wall & Faith Community",
    description:
      "Post prayer requests, support others by tapping \"Pray for Me,\" and engage in a global community that intercedes together.",
    buttonText: "Join Community",
    buttonHref: "/forum",
    phoneImage: PrayerPhone,
    bgColor: "bg-orange-500",
    textSide: "right",
    icon: "🙏",
  },
  {
    id: 3,
    title: "Children's Zone",
    description:
      "Faith-filled fun for kids: Bible games, animated cartoons, and quizzes designed to help young hearts grow spiritually through play.",
    buttonText: "Explore Now",
    buttonHref: "/children",
    phoneImage: ChildrenPhone,
    bgColor: "#090E24",
    textSide: "left",
    icon: "👶",
  },
  {
    id: 4,
    title: "Groups, Forum & Connecting with your church members",
    description:
      "Join live worship streams, connect with believers worldwide, and share messages of hope and encouragement, even with your church members.",
    buttonText: "Create Group",
    buttonHref: "/forum",
    phoneImage: GroupsPhone,
    bgColor: "bg-teal-600",
    textSide: "right",
    icon: "👥",
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

function PowerfulFeatures() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      id="features"
      className="bg-gradient-to-b from-white to-gray-50 py-20 px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        {/* Hero Section */}
        <div
          className={`mb-20 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <div className="mb-6 inline-block rounded-full px-6 py-2 text-sm font-semibold text-white" style={{ backgroundColor: '#256E63' }}>
            ✨ Powerful Features
          </div>
          <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-[#256E63] to-[#1e5a52] bg-clip-text text-transparent">
              Strengthen Your Faith
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-700 md:text-xl">
            Jevah brings together all the tools and resources you need for
            spiritual growth, community connection, and daily faith practice in
            one beautiful, easy-to-use platform.
          </p>
        </div>

        {/* Main Features */}
        {mainFeatures.map((feature, index) => (
          <div
            key={feature.id}
            className={`mb-24 grid gap-12 md:grid-cols-2 md:items-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: `${0.2 * index}s` }}
          >
            {/* Text Content */}
            <div
              className={`order-2 ${feature.textSide === "left" ? "md:order-1" : "md:order-2"}`}
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-4xl">{feature.icon}</span>
                <div className="h-1 w-12 rounded-full" style={{ backgroundColor: '#256E63' }}></div>
              </div>
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

            {/* Phone Image */}
            <div
              className={`order-1 ${feature.textSide === "left" ? "md:order-2" : "md:order-1"} flex justify-center rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] ${feature.bgColor.startsWith('#') ? '' : feature.bgColor}`}
              style={{
                backgroundColor: feature.bgColor.startsWith('#') ? feature.bgColor : undefined,
              }}
            >
              <img
                src={feature.phoneImage}
                alt={feature.title}
                className="h-auto w-full max-w-lg rounded-2xl md:w-[600px] lg:w-[700px]"
                style={{
                  transform: feature.id === 2 ? "rotate(-5deg)" : feature.id === 4 ? "rotate(-12deg)" : "none",
                }}
              />
            </div>
          </div>
        ))}

        {/* Quick Features Grid */}
        <div className="mt-32">
          <div
            className={`mb-12 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h3 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              More Amazing Features
            </h3>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Discover additional tools and resources to enhance your faith
              journey
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickFeatures.map((feature, index) => (
              feature.href !== "#" ? (
                <Link
                  key={index}
                  to={feature.href}
                  className={`group block rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
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
              ) : (
                <div
                  key={index}
                  className={`group rounded-2xl bg-white p-6 shadow-md transition-all duration-300 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="mb-4 text-5xl">
                    {feature.icon}
                  </div>
                  <h4 className="mb-2 text-xl font-bold text-gray-900">
                    {feature.title}
                  </h4>
                  <p className="mb-4 text-gray-600">{feature.description}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400">
                    Learn More
                    <span>→</span>
                  </span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div
          className={`mt-32 rounded-3xl p-12 text-center md:p-16 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ 
            background: 'linear-gradient(135deg, #256E63 0%, #1e5a52 100%)',
          }}
        >
          <h3 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to Experience All These Features?
          </h3>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
            Download Jevah today and start your journey of faith, connection,
            and spiritual growth.
          </p>
          <ButtonLink
            href="#download"
            className="inline-block rounded-full bg-white px-8 py-4 font-semibold text-[#256E63] transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Download App Now
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

export default PowerfulFeatures;
