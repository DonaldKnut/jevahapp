import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import JevahLogo from "../components/JevahLogo";

function Community() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const communityFeatures = [
    {
      title: "Prayer Wall",
      description: "Share prayer requests and pray for others in the community",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
      icon: "🙏",
      users: "10,000+ prayers",
    },
    {
      title: "Group Chats",
      description:
        "Join topic-based groups and connect with like-minded believers",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop",
      icon: "💬",
      users: "500+ groups",
    },
    {
      title: "Discussion Forums",
      description: "Engage in meaningful discussions about faith and life",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1000&auto=format&fit=crop",
      icon: "💭",
      users: "2,000+ topics",
    },
    {
      title: "Live Events",
      description:
        "Join virtual worship services, conferences, and Bible studies",
      image:
        "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1000&auto=format&fit=crop",
      icon: "📺",
      users: "50+ weekly events",
    },
    {
      title: "Mentorship Program",
      description:
        "Connect with spiritual mentors and discipleship opportunities",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop",
      icon: "👥",
      users: "200+ mentors",
    },
    {
      title: "Local Church Finder",
      description: "Discover churches and ministries in your area",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
      icon: "📍",
      users: "1,000+ churches",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Lagos, Nigeria",
      text: "The prayer wall has been a blessing. I've seen God answer so many prayers through this community.",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=400&auto=format&fit=crop",
    },
    {
      name: "Pastor Michael",
      location: "Nairobi, Kenya",
      text: "JEVAH has helped our church reach more people through live streaming and community features.",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop",
    },
    {
      name: "Grace Williams",
      location: "Accra, Ghana",
      text: "I've made lifelong friends through the group chats and found my spiritual mentor here.",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
    },
    {
      name: "David Chen",
      location: "Johannesburg, South Africa",
      text: "The forums have deepened my understanding of scripture through discussions with believers worldwide.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    },
  ];

  const stats = [
    { number: "50,000+", label: "Active Members" },
    { number: "100+", label: "Countries" },
    { number: "1M+", label: "Prayers Shared" },
    { number: "24/7", label: "Community Support" },
  ];

  return (
    <div className="min-h-screen bg-teal-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 py-16">
        <div className="mx-auto max-w-7xl px-8 text-center lg:px-12">
          <JevahLogo width={120} height={60} className="mx-auto mb-8" />
          <h1 className="text-cream-50 mb-6 text-5xl font-bold md:text-6xl">
            Gospel Community Platform
          </h1>
          <p className="text-cream-50 mx-auto mb-8 max-w-3xl text-xl leading-relaxed">
            Connect with believers worldwide through prayer walls, group chats,
            forums, and live events. Build meaningful relationships and grow in
            faith together.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="https://play.google.com"
              className="rounded-xl bg-orange-400 px-8 py-4 font-bold text-white transition-colors duration-200 hover:scale-105 hover:bg-orange-300"
            >
              Join Community
            </a>
            <a
              href="mailto:support@jevahapp.com"
              className="rounded-xl border-2 border-orange-400 px-8 py-4 font-bold text-orange-400 transition-all duration-200 hover:scale-105 hover:bg-orange-400 hover:text-white"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="bg-teal-700 py-16">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
              >
                <div className="mb-2 text-3xl font-bold text-orange-400 md:text-4xl">
                  {stat.number}
                </div>
                <div className="text-cream-50 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Features */}
      <section ref={ref} className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div
            className={`mb-16 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              Community Features
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Powerful tools to connect, share, and grow together in faith
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {communityFeatures.map((feature, index) => (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 ${
                  isIntersecting ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute left-4 top-4">
                    <div className="text-3xl">{feature.icon}</div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="mb-2 text-xl font-bold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm font-semibold text-orange-300">
                      {feature.users}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-cream-50 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              Community Stories
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Hear from believers who have found connection and growth through
              JEVAH
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
              >
                <div className="mb-4 flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="mr-4 h-12 w-12 rounded-full border-2 border-orange-400 object-cover"
                  />
                  <div>
                    <h3 className="text-cream-50 font-bold">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-orange-300">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
                <p className="text-cream-50 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-8 text-center lg:px-12">
          <div className="rounded-3xl bg-gradient-to-r from-orange-400 to-orange-300 p-12">
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              Join Our Global Gospel Community
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-white">
              Connect with believers from around the world and grow in faith
              together through JEVAH
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="https://play.google.com"
                className="rounded-xl bg-white px-8 py-4 font-bold text-orange-400 transition-colors duration-200 hover:scale-105 hover:bg-gray-100"
              >
                Join Now
              </a>
              <a
                href="mailto:support@jevahapp.com"
                className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-white hover:text-orange-400"
              >
                Get Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Community;
