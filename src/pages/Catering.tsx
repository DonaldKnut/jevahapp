import { useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

function Catering() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const [selectedPackage, setSelectedPackage] = useState("premium");

  const packages = [
    {
      id: "basic",
      name: "Essential",
      price: "$299",
      features: [
        "Menu planning consultation",
        "Basic catering setup",
        "Standard tableware",
        "Up to 25 guests",
        "3-hour service",
      ],
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$599",
      features: [
        "Custom menu design",
        "Professional setup & decor",
        "Premium tableware",
        "Up to 50 guests",
        "5-hour service",
        "Event coordinator",
      ],
      popular: true,
    },
    {
      id: "luxury",
      name: "Luxury",
      price: "$999",
      features: [
        "Gourmet menu creation",
        "Full event planning",
        "Luxury tableware & decor",
        "Up to 100 guests",
        "8-hour service",
        "Dedicated team",
        "Cleanup included",
      ],
      popular: false,
    },
  ];

  const services = [
    {
      icon: "🍽️",
      title: "Corporate Events",
      description:
        "Professional catering for business meetings, conferences, and corporate celebrations.",
    },
    {
      icon: "💒",
      title: "Weddings",
      description:
        "Elegant wedding catering with custom menus and flawless execution for your special day.",
    },
    {
      icon: "🎂",
      title: "Birthday Parties",
      description:
        "Fun and delicious catering solutions for birthday celebrations of all ages.",
    },
    {
      icon: "🎓",
      title: "Graduations",
      description:
        "Celebrate academic achievements with our premium graduation party catering.",
    },
    {
      icon: "🏠",
      title: "Private Dinners",
      description:
        "Intimate dining experiences with gourmet meals in the comfort of your home.",
    },
    {
      icon: "🎉",
      title: "Special Occasions",
      description:
        "Custom catering for any special event, tailored to your unique requirements.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      event: "Wedding Reception",
      text: "Jingles Catering made our wedding absolutely perfect. The food was exquisite and the service was flawless.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      event: "Corporate Event",
      text: "Professional, reliable, and delicious. Our clients were impressed with the quality and presentation.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      event: "Birthday Party",
      text: "The kids loved the food and the parents loved the service. Highly recommend Jingles Catering!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-800 to-teal-600 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-8 lg:px-12">
          <div className="text-center text-white">
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              Jingles Catering & Event Planning
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed">
              We bring flavors, elegance, and flawless coordination to your
              celebrations. From delicious meals and snacks to professional
              event planning, ensuring every occasion is memorable and
              stress-free.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="rounded-xl bg-orange-400 px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-orange-300">
                Get Quote
              </button>
              <button className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-white hover:text-teal-800">
                View Menu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section ref={ref} className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div
            className={`mb-16 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-800">
              Our Catering Services
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              From intimate gatherings to grand celebrations, we deliver
              exceptional culinary experiences
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={index}
                className={`rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  isIntersecting ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 text-4xl">{service.icon}</div>
                <h3 className="mb-3 text-xl font-bold text-gray-800">
                  {service.title}
                </h3>
                <p className="leading-relaxed text-gray-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="bg-gray-100 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-800">
              Catering Packages
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Choose the perfect package for your event
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:scale-105 ${
                  pkg.popular ? "ring-2 ring-orange-400" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <span className="rounded-full bg-orange-400 px-4 py-2 text-sm font-bold text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="mb-2 text-2xl font-bold text-gray-800">
                    {pkg.name}
                  </h3>
                  <div className="mb-6 text-4xl font-bold text-orange-400">
                    {pkg.price}
                  </div>
                  <ul className="space-y-3 text-left">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <span className="mr-3 text-green-500">✓</span>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`mt-8 w-full rounded-xl py-3 font-bold transition-all duration-300 ${
                      pkg.popular
                        ? "bg-orange-400 text-white hover:bg-orange-300"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {selectedPackage === pkg.id ? "Selected" : "Select Package"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-800">
              What Our Clients Say
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Don't just take our word for it - hear from our satisfied
              customers
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-4 flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mb-4 italic text-gray-600">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-bold text-gray-800">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.event}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-400 to-orange-300 py-20">
        <div className="mx-auto max-w-4xl px-8 text-center lg:px-12">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Ready to Make Your Event Unforgettable?
          </h2>
          <p className="mb-8 text-xl text-white">
            Contact us today for a free consultation and custom quote
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="rounded-xl bg-white px-8 py-4 font-bold text-orange-400 transition-all duration-300 hover:scale-105 hover:bg-gray-100">
              Get Free Quote
            </button>
            <button className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-white hover:text-orange-400">
              Call Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Catering;

