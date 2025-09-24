import { useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

function About() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState("story");

  const tabs = [
    { id: "story", name: "Our Story", icon: "📖" },
    { id: "mission", name: "Mission", icon: "🎯" },
    { id: "values", name: "Values", icon: "💎" },
    { id: "team", name: "Team", icon: "👥" },
  ];

  const milestones = [
    {
      year: "2015",
      title: "Foundation",
      description:
        "Jingles Conglomerate was founded with a vision to create a household brand of trust, taste, and value.",
    },
    {
      year: "2017",
      title: "Catering Launch",
      description:
        "Launched Jingles Catering & Event Planning, bringing elegance and flavor to celebrations.",
    },
    {
      year: "2019",
      title: "Fulcrums Expansion",
      description:
        "Established Jingles Fulcrums as the premier hub for fashion industry equipment and supplies.",
    },
    {
      year: "2021",
      title: "Properties Division",
      description:
        "Introduced Jingles Properties, specializing in verified, high-yielding real estate investments.",
    },
    {
      year: "2023",
      title: "Market Leadership",
      description:
        "Achieved market leadership across all three sectors with thousands of satisfied customers.",
    },
    {
      year: "2024",
      title: "Future Vision",
      description:
        "Continuing to expand and innovate, building experiences and creating wealth opportunities.",
    },
  ];

  const values = [
    {
      icon: "🤝",
      title: "Trust",
      description:
        "We build lasting relationships through transparency, reliability, and consistent delivery of excellence.",
    },
    {
      icon: "🎨",
      title: "Taste",
      description:
        "We bring elegance, sophistication, and quality to everything we do, from food to fashion to real estate.",
    },
    {
      icon: "💡",
      title: "Value",
      description:
        "We deliver exceptional value through innovative solutions, competitive pricing, and superior service.",
    },
    {
      icon: "⚡",
      title: "Excellence",
      description:
        "We strive for excellence in every interaction, product, and service we provide.",
    },
    {
      icon: "🌱",
      title: "Innovation",
      description:
        "We embrace innovation and continuously evolve to meet changing market needs and customer expectations.",
    },
    {
      icon: "🤲",
      title: "Integrity",
      description:
        "We conduct business with the highest ethical standards and maintain integrity in all our dealings.",
    },
  ];

  const teamMembers = [
    {
      name: "Sarah Jingles",
      position: "Founder & CEO",
      image: "👩‍💼",
      bio: "Visionary leader with 15+ years in business development and brand building.",
      expertise: "Strategic Planning, Brand Development",
    },
    {
      name: "Michael Chen",
      position: "Head of Catering",
      image: "👨‍🍳",
      bio: "Culinary expert with international experience in fine dining and event planning.",
      expertise: "Culinary Arts, Event Management",
    },
    {
      name: "Emily Rodriguez",
      position: "Fulcrums Director",
      image: "👩‍💻",
      bio: "Fashion industry veteran with deep knowledge of equipment and supply chain management.",
      expertise: "Fashion Industry, Supply Chain",
    },
    {
      name: "David Thompson",
      position: "Properties Manager",
      image: "👨‍💼",
      bio: "Real estate investment specialist with proven track record in property development.",
      expertise: "Real Estate, Investment Analysis",
    },
    {
      name: "Lisa Wang",
      position: "Operations Director",
      image: "👩‍🔧",
      bio: "Operations expert ensuring seamless delivery across all business divisions.",
      expertise: "Operations, Process Optimization",
    },
    {
      name: "James Wilson",
      position: "Customer Relations",
      image: "👨‍💬",
      bio: "Customer satisfaction specialist dedicated to building lasting client relationships.",
      expertise: "Customer Service, Relationship Management",
    },
  ];

  const achievements = [
    {
      number: "10,000+",
      label: "Satisfied Customers",
      icon: "😊",
    },
    {
      number: "500+",
      label: "Events Catered",
      icon: "🎉",
    },
    {
      number: "1,000+",
      label: "Machines Sold",
      icon: "🪡",
    },
    {
      number: "200+",
      label: "Properties Sold",
      icon: "🏠",
    },
    {
      number: "15%",
      label: "Average ROI",
      icon: "📈",
    },
    {
      number: "99%",
      label: "Customer Satisfaction",
      icon: "⭐",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-800 to-pink-600 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-8 lg:px-12">
          <div className="text-center text-white">
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              About Jingles Conglomerate
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed">
              A trusted household brand redefining lifestyles through food,
              fashion, and real estate. From catering and flawless event
              planning, to sewing machines and accessories, and verified
              high-yield properties, Jingles delivers excellence, empowers
              industries, and creates wealth opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="flex flex-wrap justify-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-xl px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-purple-400 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section ref={ref} className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          {activeTab === "story" && (
            <div
              className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            >
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-4xl font-bold text-gray-800">
                  Our Journey
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600">
                  From humble beginnings to market leadership across multiple
                  industries
                </p>
              </div>

              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center gap-8 md:flex-row ${
                      index % 2 === 1 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="mb-2 text-2xl font-bold text-purple-400">
                        {milestone.year}
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-gray-800">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-pink-400 text-4xl text-white">
                      {milestone.year.slice(-2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "mission" && (
            <div
              className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            >
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-4xl font-bold text-gray-800">
                  Our Mission
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600">
                  Empowering industries and creating wealth opportunities
                  through excellence
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-8 shadow-lg">
                  <h3 className="mb-4 text-2xl font-bold text-gray-800">
                    Vision Statement
                  </h3>
                  <p className="leading-relaxed text-gray-600">
                    To be the leading household brand that redefines lifestyles
                    through innovative solutions in food, fashion, and real
                    estate, creating lasting value for our customers and
                    communities.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-8 shadow-lg">
                  <h3 className="mb-4 text-2xl font-bold text-gray-800">
                    Mission Statement
                  </h3>
                  <p className="leading-relaxed text-gray-600">
                    We don't just do business, we build experiences, empower
                    industries, and create wealth opportunities. We are your
                    household brand for celebrations, creativity, and
                    investments.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "values" && (
            <div
              className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            >
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-4xl font-bold text-gray-800">
                  Our Core Values
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600">
                  The principles that guide everything we do
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-white p-8 text-center shadow-lg"
                  >
                    <div className="mb-4 text-4xl">{value.icon}</div>
                    <h3 className="mb-3 text-xl font-bold text-gray-800">
                      {value.title}
                    </h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div
              className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            >
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-4xl font-bold text-gray-800">
                  Meet Our Team
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600">
                  The passionate professionals driving our success
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-white p-8 text-center shadow-lg"
                  >
                    <div className="mb-4 text-6xl">{member.image}</div>
                    <h3 className="mb-2 text-xl font-bold text-gray-800">
                      {member.name}
                    </h3>
                    <div className="mb-3 font-semibold text-purple-400">
                      {member.position}
                    </div>
                    <p className="mb-4 text-sm text-gray-600">{member.bio}</p>
                    <div className="text-sm text-gray-500">
                      {member.expertise}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Achievements */}
      <section className="bg-gray-100 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-800">
              Our Achievements
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Numbers that speak to our success and customer satisfaction
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 text-4xl">{achievement.icon}</div>
                <div className="mb-2 text-3xl font-bold text-purple-400">
                  {achievement.number}
                </div>
                <div className="text-sm text-gray-600">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-400 to-pink-400 py-20">
        <div className="mx-auto max-w-4xl px-8 text-center lg:px-12">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Ready to Experience Excellence?
          </h2>
          <p className="mb-8 text-xl text-white">
            Join thousands of satisfied customers who trust Jingles Conglomerate
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="rounded-xl bg-white px-8 py-4 font-bold text-purple-400 transition-all duration-300 hover:scale-105 hover:bg-gray-100">
              Get Started
            </button>
            <button className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-white hover:text-purple-400">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;

