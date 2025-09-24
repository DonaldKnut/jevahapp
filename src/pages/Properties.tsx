import { useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

function Properties() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const [selectedType, setSelectedType] = useState("residential");

  const propertyTypes = [
    { id: "residential", name: "Residential", icon: "🏠" },
    { id: "commercial", name: "Commercial", icon: "🏢" },
    { id: "land", name: "Land", icon: "🌍" },
    { id: "investment", name: "Investment", icon: "💰" },
  ];

  const properties = {
    residential: [
      {
        name: "Luxury Villa in Prime Location",
        price: "$850,000",
        location: "Downtown District",
        image: "🏠",
        features: [
          "4 bedrooms",
          "3 bathrooms",
          "2,500 sq ft",
          "Garden",
          "Parking",
        ],
        description:
          "Spacious family home with modern amenities and excellent location.",
        roi: "12%",
        verified: true,
      },
      {
        name: "Modern Apartment Complex",
        price: "$450,000",
        location: "City Center",
        image: "🏠",
        features: [
          "2 bedrooms",
          "2 bathrooms",
          "1,200 sq ft",
          "Balcony",
          "Gym",
        ],
        description:
          "Contemporary living with city views and premium facilities.",
        roi: "15%",
        verified: true,
      },
      {
        name: "Suburban Family Home",
        price: "$320,000",
        location: "Quiet Suburbs",
        image: "🏠",
        features: [
          "3 bedrooms",
          "2 bathrooms",
          "1,800 sq ft",
          "Yard",
          "Garage",
        ],
        description: "Perfect for families seeking peace and space.",
        roi: "10%",
        verified: true,
      },
    ],
    commercial: [
      {
        name: "Office Building Downtown",
        price: "$1,200,000",
        location: "Business District",
        image: "🏢",
        features: ["5 floors", "20 offices", "Parking", "Elevator", "Security"],
        description: "Prime commercial property with high rental potential.",
        roi: "18%",
        verified: true,
      },
      {
        name: "Retail Space Plaza",
        price: "$750,000",
        location: "Shopping Area",
        image: "🏢",
        features: [
          "Ground floor",
          "High foot traffic",
          "Parking",
          "Storage",
          "AC",
        ],
        description: "Excellent retail location with strong customer base.",
        roi: "16%",
        verified: true,
      },
      {
        name: "Warehouse Facility",
        price: "$950,000",
        location: "Industrial Zone",
        image: "🏢",
        features: [
          "10,000 sq ft",
          "Loading dock",
          "Office space",
          "Security",
          "Parking",
        ],
        description:
          "Large industrial space perfect for logistics and storage.",
        roi: "14%",
        verified: true,
      },
    ],
    land: [
      {
        name: "Residential Development Land",
        price: "$180,000",
        location: "Growing Suburb",
        image: "🌍",
        features: [
          "2 acres",
          "Zoned residential",
          "Utilities ready",
          "Road access",
          "Surveyed",
        ],
        description:
          "Prime land for residential development with great potential.",
        roi: "25%",
        verified: true,
      },
      {
        name: "Commercial Plot",
        price: "$320,000",
        location: "Highway Access",
        image: "🌍",
        features: [
          "1.5 acres",
          "Commercial zoning",
          "Highway frontage",
          "Utilities",
          "Surveyed",
        ],
        description: "Strategic commercial land with excellent visibility.",
        roi: "22%",
        verified: true,
      },
      {
        name: "Agricultural Land",
        price: "$95,000",
        location: "Rural Area",
        image: "🌍",
        features: [
          "5 acres",
          "Fertile soil",
          "Water access",
          "Road access",
          "Surveyed",
        ],
        description: "Productive agricultural land with farming potential.",
        roi: "20%",
        verified: true,
      },
    ],
    investment: [
      {
        name: "Rental Property Portfolio",
        price: "$650,000",
        location: "Multiple Locations",
        image: "💰",
        features: [
          "3 properties",
          "Steady income",
          "Tenant occupied",
          "Managed",
          "Appreciating",
        ],
        description: "Diversified rental portfolio with consistent returns.",
        roi: "17%",
        verified: true,
      },
      {
        name: "REIT Investment Opportunity",
        price: "$100,000",
        location: "Diversified",
        image: "💰",
        features: [
          "Professional management",
          "Diversified assets",
          "Regular dividends",
          "Liquid",
          "Low risk",
        ],
        description: "Real Estate Investment Trust with stable returns.",
        roi: "13%",
        verified: true,
      },
      {
        name: "Land Banking Project",
        price: "$250,000",
        location: "Development Zone",
        image: "💰",
        features: [
          "Future development",
          "Government plans",
          "Appreciation potential",
          "Low maintenance",
          "Long-term",
        ],
        description: "Strategic land banking for future development projects.",
        roi: "30%",
        verified: true,
      },
    ],
  };

  const services = [
    {
      icon: "🔍",
      title: "Property Verification",
      description:
        "All properties are thoroughly verified for legal compliance and authenticity",
    },
    {
      icon: "📊",
      title: "Investment Analysis",
      description:
        "Detailed ROI analysis and market research for informed decisions",
    },
    {
      icon: "📋",
      title: "Legal Documentation",
      description: "Complete legal documentation and title transfer assistance",
    },
    {
      icon: "💰",
      title: "Financing Options",
      description: "Flexible financing solutions and mortgage assistance",
    },
    {
      icon: "🏠",
      title: "Property Management",
      description: "Professional property management services for investors",
    },
    {
      icon: "📈",
      title: "Market Insights",
      description: "Expert market analysis and investment recommendations",
    },
  ];

  const testimonials = [
    {
      name: "Robert Williams",
      investment: "Residential Portfolio",
      text: "Jingles Properties helped me build a profitable real estate portfolio. Their verification process gave me confidence in every purchase.",
      rating: 5,
    },
    {
      name: "Jennifer Martinez",
      investment: "Commercial Property",
      text: "The investment analysis and ROI projections were spot-on. I've seen excellent returns on my commercial property investment.",
      rating: 5,
    },
    {
      name: "Michael Thompson",
      investment: "Land Banking",
      text: "Their land banking strategy has been incredibly profitable. The team's expertise in market trends is unmatched.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-800 to-blue-600 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-8 lg:px-12">
          <div className="text-center text-white">
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              Jingles Properties
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed">
              Your trusted partner in real estate. We specialize in selling
              verified, high-yielding properties; both buildings and lands.
              Through land banking and other smart real estate investments,
              Jingles Properties helps you secure wealth and build financial
              stability with confidence.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="rounded-xl bg-blue-400 px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-300">
                Browse Properties
              </button>
              <button className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-white hover:text-green-800">
                Investment Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Property Type Selection */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="flex flex-wrap justify-center gap-4">
            {propertyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center gap-3 rounded-xl px-6 py-4 font-semibold transition-all duration-300 ${
                  selectedType === type.id
                    ? "bg-blue-400 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                {type.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section ref={ref} className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div
            className={`mb-16 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-800">
              {propertyTypes.find((t) => t.id === selectedType)?.name}{" "}
              Properties
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Verified, high-yielding properties for smart investments
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {properties[selectedType as keyof typeof properties].map(
              (property, index) => (
                <div
                  key={index}
                  className={`rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    isIntersecting ? "animate-fade-in-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-center text-6xl">{property.image}</div>
                    {property.verified && (
                      <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-600">
                        ✓ Verified
                      </div>
                    )}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800">
                    {property.name}
                  </h3>
                  <div className="mb-2 text-sm text-gray-500">
                    {property.location}
                  </div>
                  <div className="mb-4 text-3xl font-bold text-blue-400">
                    {property.price}
                  </div>
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Expected ROI:</span>
                    <span className="font-bold text-green-600">
                      {property.roi}
                    </span>
                  </div>
                  <p className="mb-4 text-gray-600">{property.description}</p>
                  <ul className="mb-6 space-y-2">
                    {property.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <span className="mr-3 text-green-500">✓</span>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full rounded-xl bg-blue-400 py-3 font-bold text-white transition-all duration-300 hover:bg-blue-300">
                    View Details
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-gray-100 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-800">
              Our Services
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Comprehensive real estate solutions for investors and buyers
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white p-8 text-center shadow-lg"
              >
                <div className="mb-4 text-4xl">{service.icon}</div>
                <h3 className="mb-3 text-xl font-bold text-gray-800">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
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
              Success Stories
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Hear from our satisfied investors and property buyers
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
                    {testimonial.investment}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Calculator */}
      <section className="bg-gradient-to-r from-green-400 to-blue-400 py-20">
        <div className="mx-auto max-w-4xl px-8 text-center lg:px-12">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Calculate Your Investment Potential
          </h2>
          <p className="mb-8 text-xl text-white">
            Use our investment calculator to estimate returns on your real
            estate investment
          </p>
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Property Value
                </label>
                <input
                  type="number"
                  placeholder="$500,000"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Expected ROI
                </label>
                <input
                  type="number"
                  placeholder="15%"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Investment Period
                </label>
                <input
                  type="number"
                  placeholder="5 years"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>
            <button className="mt-6 rounded-xl bg-blue-400 px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-blue-300">
              Calculate Returns
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-400 to-blue-300 py-20">
        <div className="mx-auto max-w-4xl px-8 text-center lg:px-12">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Ready to Build Your Real Estate Portfolio?
          </h2>
          <p className="mb-8 text-xl text-white">
            Contact us today for a free investment consultation
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="rounded-xl bg-white px-8 py-4 font-bold text-blue-400 transition-all duration-300 hover:scale-105 hover:bg-gray-100">
              Free Consultation
            </button>
            <button className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-white hover:text-blue-400">
              View Properties
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Properties;

