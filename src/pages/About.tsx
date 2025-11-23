import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import ButtonLink from "../common/ButtonLink";

function About() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 py-20 px-8 pt-[20vh] lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div
            className={`text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h1
              className={`mb-6 text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
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
              represents faith, connection, and divine guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section
        ref={ref}
        className="bg-white py-20 px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div
              className={`${isIntersecting ? "animate-fade-in-left" : "opacity-0"}`}
            >
              <h2 className="mb-6 text-4xl font-bold text-gray-900">
                Our Mission
              </h2>
              <p className="mb-6 text-lg" style={{ color: "#090E24" }}>
                To make faith accessible, engaging, and interactive in today's
                digital world. We're building a gospel-centric mobile ecosystem
                designed for everyone from adults deepening their spiritual life
                to children discovering God's love through games and stories.
              </p>
              <p className="mb-6 text-lg text-gray-700">
                Every feature is built to strengthen your walk with God, from
                prayer walls to gospel content hubs, blending modern technology
                with timeless faith.
              </p>
            </div>
            <div
              className={`${isIntersecting ? "animate-fade-in-right" : "opacity-0"}`}
            >
              <div className="rounded-2xl bg-gray-50 p-8">
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  What We Stand For
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Christ-Centered Innovation
                      </h4>
                      <p className="text-gray-600">
                        Technology designed to deepen your faith journey
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">👨‍👩‍👧‍👦</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Inclusive for All Generations
                      </h4>
                      <p className="text-gray-600">
                        Content and features for every age group
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🎮</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Interactive Faith Experience
                      </h4>
                      <p className="text-gray-600">
                        Engage with your faith in meaningful ways
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2
            className={`mb-12 text-center text-4xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Our Core Values
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Faith",
                description:
                  "We center everything around strengthening your relationship with God.",
              },
              {
                title: "Community",
                description:
                  "Building connections and fostering fellowship among believers worldwide.",
              },
              {
                title: "Innovation",
                description:
                  "Blending modern technology with timeless faith principles.",
              },
              {
                title: "Accessibility",
                description:
                  "Making faith resources available to everyone, everywhere.",
              },
              {
                title: "Excellence",
                description:
                  "Delivering quality content and experiences that honor God.",
              },
              {
                title: "Purpose",
                description:
                  "Every feature designed with intention to serve your spiritual growth.",
              },
            ].map((value, index) => (
              <div
                key={index}
                className={`rounded-lg bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
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
