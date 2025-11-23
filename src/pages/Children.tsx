import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import ButtonLink from "../common/ButtonLink";
import KidsImg from "../assets/logos/kids-img.png";

function Children() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const features = [
    {
      title: "Bible Games",
      description:
        "Interactive games that teach Bible stories and Christian values in a fun, engaging way.",
      icon: "🎮",
    },
    {
      title: "Animated Cartoons",
      description:
        "Watch Bible stories come to life through colorful, age-appropriate animated videos.",
      icon: "📺",
    },
    {
      title: "Bible Quizzes",
      description:
        "Test knowledge and learn more about the Bible through interactive quizzes and challenges.",
      icon: "❓",
    },
    {
      title: "Memory Verses",
      description:
        "Learn and memorize Bible verses through fun activities and games designed for kids.",
      icon: "📖",
    },
    {
      title: "Prayer Time",
      description:
        "Simple, guided prayers that help children learn to talk to God in their own words.",
      icon: "🙏",
    },
    {
      title: "Bible Stories",
      description:
        "Read and listen to Bible stories told in language that children can understand.",
      icon: "📚",
    },
  ];

  const games = [
    {
      title: "Noah's Ark Adventure",
      description:
        "Help Noah gather animals for the ark in this fun matching game.",
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=400&auto=format&fit=crop",
      age: "Ages 4-8",
    },
    {
      title: "David and Goliath",
      description:
        "Learn about courage and faith through this interactive story game.",
      image:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=400&auto=format&fit=crop",
      age: "Ages 6-10",
    },
    {
      title: "The Good Samaritan",
      description:
        "Discover the importance of kindness and helping others in this adventure.",
      image:
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=400&auto=format&fit=crop",
      age: "Ages 5-9",
    },
    {
      title: "Moses and the Red Sea",
      description:
        "Experience the miracle of the Red Sea crossing in this exciting game.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      age: "Ages 7-12",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 py-20 px-8 pt-[20vh] lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div
              className={`${isIntersecting ? "animate-fade-in-left" : "opacity-0"}`}
            >
              <h1
                className={`mb-6 text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: "0.2s" }}
              >
                Children's Zone
              </h1>
              <p
                className={`mb-8 text-lg text-gray-700 md:text-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: "0.4s" }}
              >
                Faith-filled fun for kids! Bible games, animated cartoons, and
                quizzes designed to help young hearts grow spiritually through
                play.
              </p>
              <div
                className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: "0.6s" }}
              >
                <ButtonLink
                  href="#download"
                  className="inline-block rounded-full px-8 py-4 text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg"
                  style={{ backgroundColor: "#090E24" }}
                >
                  Explore Now
                </ButtonLink>
              </div>
            </div>
            <div
              className={`${isIntersecting ? "animate-fade-in-right" : "opacity-0"}`}
            >
              <div
                className="rounded-2xl p-8"
                style={{ backgroundColor: "#090E24" }}
              >
                <img
                  src={KidsImg}
                  alt="Children's Zone"
                  className="h-auto w-full rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={ref} className="bg-white py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2
            className={`mb-12 text-center text-4xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Fun Features for Kids
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`rounded-2xl bg-gray-50 p-6 text-center shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="mb-4 text-5xl">{feature.icon}</div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2
            className={`mb-12 text-center text-4xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Popular Bible Games
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {games.map((game, index) => (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <img
                  src={game.image}
                  alt={game.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-bold text-gray-900">
                    {game.title}
                  </h3>
                  <p className="mb-3 text-sm text-gray-600">
                    {game.description}
                  </p>
                  <p className="mb-4 text-sm font-semibold" style={{ color: "#256E63" }}>
                    {game.age}
                  </p>
                  <button
                    className="w-full rounded-full px-4 py-2 text-white transition-all duration-300 hover:opacity-90"
                    style={{ backgroundColor: "#090E24" }}
                  >
                    Play Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="bg-white py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div
            className={`rounded-2xl p-8 text-white ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ backgroundColor: "#090E24" }}
          >
            <h2 className="mb-4 text-3xl font-bold">Safe & Secure</h2>
            <p className="mb-6 text-lg text-gray-200">
              The Children's Zone is designed with safety in mind. All content
              is age-appropriate, and we maintain strict privacy protections for
              young users. Parents can monitor and control their children's
              activity through parental controls.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="mb-2 text-3xl">🔒</div>
                <h3 className="mb-2 font-semibold">Secure Environment</h3>
                <p className="text-sm text-gray-300">
                  All content is carefully curated and safe for children
                </p>
              </div>
              <div>
                <div className="mb-2 text-3xl">👨‍👩‍👧</div>
                <h3 className="mb-2 font-semibold">Parental Controls</h3>
                <p className="text-sm text-gray-300">
                  Parents can monitor and manage their children's activity
                </p>
              </div>
              <div>
                <div className="mb-2 text-3xl">📚</div>
                <h3 className="mb-2 font-semibold">Educational Content</h3>
                <p className="text-sm text-gray-300">
                  Learning through play with Bible-based activities
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className={`mb-6 text-4xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Start Your Child's Faith Journey
          </h2>
          <p
            className={`mb-8 text-lg text-gray-700 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            Download Jevah and give your children access to fun, faith-filled
            content that will help them grow in their relationship with God.
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

export default Children;

