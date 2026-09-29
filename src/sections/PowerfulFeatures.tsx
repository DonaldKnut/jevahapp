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
    panelClass: "bg-green-800 dark:bg-emerald-950",
    textSide: "left",
    icon: "🎵",
  },
  {
    id: 2,
    title: "Prayer Wall & Faith Community",
    description:
      'Post prayer requests, support others by tapping "Pray for Me," and engage in a global community that intercedes together.',
    buttonText: "Join Community",
    buttonHref: "/forum",
    phoneImage: PrayerPhone,
    panelClass: "bg-orange-500 dark:bg-orange-900",
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
    panelClass: "bg-[#090E24] dark:bg-[#1a1a2e]",
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
    panelClass: "bg-teal-600 dark:bg-teal-900",
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
  // threshold 0: tall feature blocks must reveal on short mobile viewports
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0,
    rootMargin: "80px 0px -5% 0px",
  });

  return (
    <section
      ref={ref}
      id="features"
      className="jevah-section px-4 py-16 transition-colors duration-300 xs:px-6 sm:px-8 sm:py-20 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div
          className={`mb-20 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <div className="mb-6 inline-block rounded-full bg-jevah-accent px-6 py-2 text-sm font-semibold text-white">
            ✨ Powerful Features
          </div>
          <h2 className="mb-4 text-3xl font-bold text-jevah-text xs:mb-6 xs:text-4xl md:text-5xl lg:text-6xl">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-jevah-accent to-jevah-accent-hover bg-clip-text text-transparent">
              Strengthen Your Faith
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-base text-jevah-text-muted sm:text-lg md:text-xl">
            Jevah brings together all the tools and resources you need for
            spiritual growth, community connection, and daily faith practice in
            one beautiful, easy-to-use platform.
          </p>
        </div>

        {mainFeatures.map((feature, index) => (
          <div
            key={feature.id}
            className={`mb-14 grid gap-8 sm:mb-20 sm:gap-12 md:mb-24 md:grid-cols-2 md:items-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: `${0.2 * index}s` }}
          >
            <div
              className={`order-2 ${feature.textSide === "left" ? "md:order-1" : "md:order-2"}`}
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">{feature.icon}</span>
                <div className="h-1 w-12 rounded-full bg-jevah-accent" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-jevah-text sm:mb-4 sm:text-3xl md:text-4xl">
                {feature.title}
              </h3>
              <p className="mb-5 text-base leading-relaxed text-jevah-text-muted sm:mb-6 sm:text-lg">
                {feature.description}
              </p>
              <Link
                to={feature.buttonHref}
                className="jevah-btn-dark inline-block rounded-full px-6 py-3 text-sm transition-all duration-300 hover:opacity-90 hover:shadow-lg sm:px-8 sm:py-4 sm:text-base"
              >
                {feature.buttonText}
              </Link>
            </div>

            <div
              className={`order-1 ${feature.textSide === "left" ? "md:order-2" : "md:order-1"} flex justify-center rounded-2xl p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] sm:rounded-3xl sm:p-8 ${feature.panelClass}`}
            >
              <img
                src={feature.phoneImage}
                alt={feature.title}
                className="h-auto w-full max-w-lg rounded-2xl md:w-[600px] lg:w-[700px]"
                style={{
                  transform:
                    feature.id === 2
                      ? "rotate(-5deg)"
                      : feature.id === 4
                        ? "rotate(-12deg)"
                        : "none",
                }}
              />
            </div>
          </div>
        ))}

        <div className="mt-32">
          <div
            className={`mb-12 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h3 className="mb-4 text-3xl font-bold text-jevah-text md:text-4xl">
              More Amazing Features
            </h3>
            <p className="mx-auto max-w-2xl text-lg text-jevah-text-muted">
              Discover additional tools and resources to enhance your faith journey
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickFeatures.map((feature, index) =>
              feature.href !== "#" ? (
                <Link
                  key={index}
                  to={feature.href}
                  className={`jevah-card group block rounded-2xl border border-jevah-border p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="mb-4 text-5xl transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h4 className="mb-2 text-xl font-bold text-jevah-text">
                    {feature.title}
                  </h4>
                  <p className="mb-4 text-jevah-text-muted">{feature.description}</p>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-jevah-accent transition-colors">
                    Learn More
                    <span>→</span>
                  </div>
                </Link>
              ) : (
                <div
                  key={index}
                  className={`jevah-card rounded-2xl border border-jevah-border p-6 shadow-md transition-all duration-300 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="mb-4 text-5xl">{feature.icon}</div>
                  <h4 className="mb-2 text-xl font-bold text-jevah-text">
                    {feature.title}
                  </h4>
                  <p className="mb-4 text-jevah-text-muted">{feature.description}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-jevah-text-muted/60">
                    Learn More
                    <span>→</span>
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div
          className={`mt-32 rounded-3xl border border-jevah-accent/20 bg-gradient-to-br from-jevah-accent to-jevah-accent-hover p-12 text-center md:p-16 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <h3 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to Experience All These Features?
          </h3>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
            Download Jevah today and start your journey of faith, connection, and
            spiritual growth.
          </p>
          <ButtonLink
            href="#download"
            className="inline-block rounded-full bg-white px-8 py-4 font-semibold text-jevah-accent transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-jevah-elevated dark:text-jevah-accent"
          >
            Download App Now
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

export default PowerfulFeatures;
