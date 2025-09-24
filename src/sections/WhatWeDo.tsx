import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

function WhatWeDo() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const services = [
    {
      icon: "🍽️",
      title: "Jingles Catering & Event Planning",
      description:
        "We bring flavors, elegance, and flawless coordination to your celebrations. From delicious meals and snacks to the professional planning of events and parties, Jingles Catering ensures every occasion is memorable and stress-free.",
    },
    {
      icon: "✂️",
      title: "Jingles Fulcrums",
      description:
        "The one-stop hub for the fashion industry. Deals in all types of sewing machines, spare parts, and accessories, alongside mannequins and sewing essentials. Whether for small tailoring shops or large fashion houses, Jingles Fulcrums powers creativity with reliable tools.",
    },
    {
      icon: "🏠",
      title: "Jingles Properties",
      description:
        "Your trusted partner in real estate. We specialize in selling verified, high-yielding properties; both buildings and lands. Through land banking and other smart real estate investments, Jingles Properties helps you secure wealth and build financial stability with confidence.",
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
            Our Business Divisions
          </h2>
          <p className="text-cream-50 mx-auto max-w-3xl text-xl leading-relaxed">
            At Jingles Conglomerate, we don't just do business, we build
            experiences, empower industries, and create wealth opportunities. We
            are your household brand for celebrations, creativity, and
            investments.
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
              Ready to Experience Excellence?
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-white">
              A trusted household brand redefining lifestyles through food,
              fashion, and real estate. From catering and flawless event
              planning, to sewing machines and accessories, and verified
              high-yield properties, Jingles delivers excellence, empowers
              industries, and creates wealth opportunities.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="mailto:info@jinglesconglomerate.com"
                className="rounded-xl bg-white px-8 py-4 font-bold text-orange-400 transition-colors duration-200 hover:scale-105 hover:bg-gray-100"
              >
                Get In Touch
              </a>
              <a
                href="tel:+1234567890"
                className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-white hover:text-orange-400"
              >
                Call Us Now
              </a>
            </div>
            <p className="mt-4 text-sm text-white/80">
              Need help? Email us at{" "}
              <span className="font-semibold">
                info@jinglesconglomerate.com
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhatWeDo;
