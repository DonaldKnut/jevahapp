import { useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

function Fulcrums() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const [selectedCategory, setSelectedCategory] = useState("machines");

  const categories = [
    { id: "machines", name: "Sewing Machines", icon: "🪡" },
    { id: "parts", name: "Spare Parts", icon: "⚙️" },
    { id: "accessories", name: "Accessories", icon: "🎒" },
    { id: "mannequins", name: "Mannequins", icon: "👗" },
  ];

  const products = {
    machines: [
      {
        name: "Professional Industrial Sewing Machine",
        price: "$2,499",
        image: "🪡",
        features: [
          "Heavy-duty construction",
          "High-speed operation",
          "Industrial grade",
          "5-year warranty",
        ],
        description:
          "Perfect for large-scale production and professional tailoring shops.",
      },
      {
        name: "Home Sewing Machine Deluxe",
        price: "$399",
        image: "🪡",
        features: [
          "50+ built-in stitches",
          "Automatic threading",
          "LCD display",
          "2-year warranty",
        ],
        description: "Ideal for home use and small tailoring businesses.",
      },
      {
        name: "Embroidery Machine Pro",
        price: "$1,899",
        image: "🪡",
        features: [
          "Multi-needle design",
          "Large embroidery area",
          "USB connectivity",
          "3-year warranty",
        ],
        description:
          "Advanced embroidery capabilities for professional designers.",
      },
    ],
    parts: [
      {
        name: "Sewing Machine Motor",
        price: "$199",
        image: "⚙️",
        features: [
          "High torque",
          "Quiet operation",
          "Energy efficient",
          "Universal fit",
        ],
        description: "Replacement motor for most sewing machine models.",
      },
      {
        name: "Needle Set Professional",
        price: "$29",
        image: "⚙️",
        features: [
          "Various sizes",
          "Premium quality",
          "Sharp precision",
          "Long-lasting",
        ],
        description: "Complete set of professional-grade needles.",
      },
      {
        name: "Thread Tension Assembly",
        price: "$89",
        image: "⚙️",
        features: [
          "Precise adjustment",
          "Durable construction",
          "Easy installation",
          "Compatible",
        ],
        description: "Replacement tension assembly for smooth operation.",
      },
    ],
    accessories: [
      {
        name: "Professional Sewing Kit",
        price: "$149",
        image: "🎒",
        features: [
          "50+ tools",
          "Premium materials",
          "Portable case",
          "Lifetime warranty",
        ],
        description:
          "Complete toolkit for professional seamstresses and tailors.",
      },
      {
        name: "Fabric Cutting Mat",
        price: "$79",
        image: "🎒",
        features: [
          "Self-healing surface",
          "Grid markings",
          "Large size",
          "Durable",
        ],
        description: "Professional cutting mat for precise fabric cutting.",
      },
      {
        name: "Thread Organizer Rack",
        price: "$45",
        image: "🎒",
        features: [
          "Holds 100+ spools",
          "Space-saving design",
          "Easy access",
          "Sturdy construction",
        ],
        description: "Organize and display your thread collection efficiently.",
      },
    ],
    mannequins: [
      {
        name: "Professional Dress Form",
        price: "$299",
        image: "👗",
        features: [
          "Adjustable sizing",
          "Pinnable surface",
          "Stable base",
          "Professional grade",
        ],
        description: "Essential tool for fashion design and tailoring.",
      },
      {
        name: "Male Mannequin Torso",
        price: "$249",
        image: "👗",
        features: [
          "Realistic proportions",
          "Durable construction",
          "Adjustable height",
          "Professional finish",
        ],
        description: "Perfect for menswear design and fitting.",
      },
      {
        name: "Child Mannequin Set",
        price: "$199",
        image: "👗",
        features: [
          "Multiple sizes",
          "Safe materials",
          "Realistic design",
          "Easy to dress",
        ],
        description: "Complete set for children's clothing design.",
      },
    ],
  };

  const features = [
    {
      icon: "🚚",
      title: "Free Delivery",
      description: "Free delivery on orders over $500 within the city",
    },
    {
      icon: "🔧",
      title: "Expert Installation",
      description: "Professional installation and setup services available",
    },
    {
      icon: "🛡️",
      title: "Warranty Protection",
      description: "Comprehensive warranty on all products and services",
    },
    {
      icon: "📞",
      title: "24/7 Support",
      description: "Round-the-clock customer support and technical assistance",
    },
    {
      icon: "🎓",
      title: "Training Programs",
      description: "Free training sessions for new machine operators",
    },
    {
      icon: "💳",
      title: "Flexible Payment",
      description: "Multiple payment options including installment plans",
    },
  ];

  const testimonials = [
    {
      name: "Maria Santos",
      business: "Santos Tailoring",
      text: "Jingles Fulcrums has been our trusted partner for over 5 years. Their machines are reliable and their service is exceptional.",
      rating: 5,
    },
    {
      name: "David Kim",
      business: "Kim Fashion House",
      text: "The professional dress forms and accessories have transformed our design process. Highly recommended!",
      rating: 5,
    },
    {
      name: "Lisa Johnson",
      business: "Johnson's Sewing Studio",
      text: "From machines to spare parts, Jingles Fulcrums has everything we need. The quality is outstanding.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-800 to-purple-600 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-8 lg:px-12">
          <div className="text-center text-white">
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              Jingles Fulcrums
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed">
              The one-stop hub for the fashion industry. Deals in all types of
              sewing machines, spare parts, and accessories, alongside
              mannequins and sewing essentials. Whether for small tailoring
              shops or large fashion houses, Jingles Fulcrums powers creativity
              with reliable tools.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="rounded-xl bg-purple-400 px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-purple-300">
                Browse Products
              </button>
              <button className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-white hover:text-blue-800">
                Get Quote
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Selection */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-3 rounded-xl px-6 py-4 font-semibold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-purple-400 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section ref={ref} className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div
            className={`mb-16 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-800">
              {categories.find((c) => c.id === selectedCategory)?.name}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Professional-grade equipment and accessories for the fashion
              industry
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products[selectedCategory as keyof typeof products].map(
              (product, index) => (
                <div
                  key={index}
                  className={`rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    isIntersecting ? "animate-fade-in-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-4 text-center text-6xl">
                    {product.image}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800">
                    {product.name}
                  </h3>
                  <div className="mb-4 text-3xl font-bold text-purple-400">
                    {product.price}
                  </div>
                  <p className="mb-4 text-gray-600">{product.description}</p>
                  <ul className="mb-6 space-y-2">
                    {product.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <span className="mr-3 text-green-500">✓</span>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full rounded-xl bg-purple-400 py-3 font-bold text-white transition-all duration-300 hover:bg-purple-300">
                    Add to Cart
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-100 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-800">
              Why Choose Jingles Fulcrums?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              We're committed to providing the best products and services for
              the fashion industry
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white p-8 text-center shadow-lg"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-3 text-xl font-bold text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
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
              What Our Customers Say
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Trusted by fashion professionals and businesses worldwide
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
                    {testimonial.business}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-400 to-purple-300 py-20">
        <div className="mx-auto max-w-4xl px-8 text-center lg:px-12">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Ready to Power Your Fashion Business?
          </h2>
          <p className="mb-8 text-xl text-white">
            Contact us today for expert advice and custom solutions
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="rounded-xl bg-white px-8 py-4 font-bold text-purple-400 transition-all duration-300 hover:scale-105 hover:bg-gray-100">
              Get Expert Advice
            </button>
            <button className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-white hover:text-purple-400">
              Visit Showroom
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Fulcrums;

