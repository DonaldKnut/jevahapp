import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

function WhatWeDo() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const services = [
    {
      icon: "🎵",
      title: "Gospel Music Streaming",
      description:
        "Access thousands of uplifting gospel songs and hymns from artists worldwide",
    },
    {
      icon: "📖",
      title: "Sermons & Teachings",
      description:
        "Watch inspiring sermons and biblical teachings from pastors and ministers",
    },
    {
      icon: "👥",
      title: "Community Features",
      description:
        "Connect with believers through prayer walls, group chats, and forums",
    },
    {
      icon: "📱",
      title: "Live Streaming",
      description: "Join live worship services, conferences, and Bible studies",
    },
    {
      icon: "🎮",
      title: "Children's Ministry",
      description:
        "Educational games and activities designed to teach children about faith",
    },
    {
      icon: "🛒",
      title: "Christian Marketplace",
      description:
        "Discover Christian books, devotionals, and faith-based products",
    },
  ];

  return (
    <section
      ref={ref}
      className="bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600 py-20"
    >
      <div className="mx-auto max-w-7xl px-8 lg:px-12">
        {/* Header */}
        <div
          className={`mb-16 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <h2 className="text-cream-50 mb-6 text-4xl font-bold md:text-5xl">
            What We Do at JEVAH
          </h2>
          <p className="text-cream-50 mx-auto max-w-3xl text-xl leading-relaxed">
            We're building the ultimate gospel community platform that brings
            believers together through music, worship, learning, and fellowship.
            Join thousands growing in faith.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              className={`rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 ${
                isIntersecting ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 text-4xl">{service.icon}</div>
              <h3 className="text-cream-50 mb-3 text-xl font-bold">
                {service.title}
              </h3>
              <p className="text-cream-50/80 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div
          className={`text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.8s" }}
        >
          <div className="rounded-3xl bg-gradient-to-r from-orange-400 to-orange-300 p-8 md:p-12">
            <h3 className="mb-4 text-2xl font-bold text-white md:text-3xl">
              Ready to Join Our Gospel Community?
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-white">
              Download JEVAH today and start your spiritual journey with
              thousands of believers worldwide.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="https://play.google.com"
                className="rounded-xl bg-white px-8 py-4 font-bold text-orange-400 transition-colors duration-200 hover:scale-105 hover:bg-gray-100"
              >
                Download Now
              </a>
              <a
                href="mailto:support@jevahapp.com"
                className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-white hover:text-orange-400"
              >
                Contact Support
              </a>
            </div>
            <p className="mt-4 text-sm text-white/80">
              Need help? Email us at{" "}
              <span className="font-semibold">support@jevahapp.com</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhatWeDo;
