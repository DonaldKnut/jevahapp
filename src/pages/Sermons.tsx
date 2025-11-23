import { useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import ButtonLink from "../common/ButtonLink";

function Sermons() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const [selectedSermon] = useState(0);

  const featuredSermons = [
    {
      title: "Walking in Faith Through Trials",
      speaker: "Pastor Michael Johnson",
      church: "Grace Community Church",
      duration: "45:32",
      views: "125K",
      date: "2 days ago",
      thumbnail:
        "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=600&auto=format&fit=crop",
      scripture: "James 1:2-4",
      description:
        "Discover how to maintain faith and find strength during life's most challenging moments.",
    },
    {
      title: "The Power of Prayer",
      speaker: "Rev. Sarah Williams",
      church: "New Life Fellowship",
      duration: "38:15",
      views: "98K",
      date: "5 days ago",
      thumbnail:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
      scripture: "Matthew 6:5-15",
      description:
        "Learn the transformative power of prayer and how to deepen your communication with God.",
    },
    {
      title: "Living with Purpose",
      speaker: "Bishop David Thompson",
      church: "Mount Zion Baptist",
      duration: "52:18",
      views: "156K",
      date: "1 week ago",
      thumbnail:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
      scripture: "Jeremiah 29:11",
      description:
        "Understanding God's plan for your life and how to walk in your divine purpose.",
    },
    {
      title: "The Joy of Salvation",
      speaker: "Pastor Lisa Chen",
      church: "Hope International",
      duration: "41:22",
      views: "87K",
      date: "2 weeks ago",
      thumbnail:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop",
      scripture: "Psalm 51:12",
      description:
        "Experience the overwhelming joy that comes from knowing Christ as your Savior.",
    },
  ];

  const liveEvents = [
    {
      title: "Sunday Morning Service",
      speaker: "Pastor Michael Johnson",
      time: "10:00 AM EST",
      status: "Live Now",
      viewers: "2.3K watching",
      thumbnail:
        "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=400&auto=format&fit=crop",
    },
    {
      title: "Wednesday Bible Study",
      speaker: "Rev. Sarah Williams",
      time: "7:00 PM EST",
      status: "Starting Soon",
      viewers: "1.8K registered",
      thumbnail:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    },
    {
      title: "Youth Night",
      speaker: "Pastor Lisa Chen",
      time: "6:30 PM EST",
      status: "Live Now",
      viewers: "856 watching",
      thumbnail:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=400&auto=format&fit=crop",
    },
  ];

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
              Inspiring Sermons & Teachings
            </h1>
            <p
              className={`mx-auto mb-8 max-w-3xl text-lg text-gray-700 md:text-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.4s" }}
            >
              Watch thousands of powerful sermons, Bible studies, and spiritual
              teachings from pastors worldwide. Grow in faith through God's word
              with HD video streaming.
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
                Watch Sermons
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sermon */}
      <section ref={ref} className="bg-white py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div
            className={`mb-12 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Featured Sermon
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Watch our most popular sermon this week
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div
              className={`overflow-hidden rounded-2xl bg-gray-50 shadow-lg transition-all duration-300 hover:shadow-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="relative">
                <img
                  src={featuredSermons[selectedSermon].thumbnail}
                  alt={featuredSermons[selectedSermon].title}
                  className="h-64 w-full object-cover md:h-96"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-gray-900 transition-all duration-300 hover:scale-110 hover:bg-white">
                    <span className="text-2xl">▶</span>
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                      LIVE
                    </span>
                    <span className="rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                      2.3K watching
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  {featuredSermons[selectedSermon].title}
                </h3>
                <p className="mb-2 text-lg" style={{ color: "#256E63" }}>
                  {featuredSermons[selectedSermon].speaker}
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  {featuredSermons[selectedSermon].church}
                </p>
                <p className="mb-4 text-gray-700">
                  {featuredSermons[selectedSermon].description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  <span>📅 {featuredSermons[selectedSermon].date}</span>
                  <span>⏱️ {featuredSermons[selectedSermon].duration}</span>
                  <span>👀 {featuredSermons[selectedSermon].views} views</span>
                  <span>📖 {featuredSermons[selectedSermon].scripture}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Events */}
      <section className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div
            className={`mb-12 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Live Events
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Join live worship services and Bible studies happening now
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {liveEvents.map((event, index) => (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="relative">
                  <img
                    src={event.thumbnail}
                    alt={event.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute left-4 top-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        event.status === "Live Now"
                          ? "bg-red-500 text-white"
                          : "bg-[#256E63] text-white"
                      }`}
                    >
                      {event.status === "Live Now" ? "🔴 LIVE" : "⏰ Starting Soon"}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                      {event.viewers}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    {event.title}
                  </h3>
                  <p className="mb-2" style={{ color: "#256E63" }}>
                    {event.speaker}
                  </p>
                  <p className="text-sm text-gray-600">🕐 {event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Sermons */}
      <section className="bg-white py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div
            className={`mb-12 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Recent Sermons
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Latest teachings from our community of pastors
            </p>
          </div>

          <div className="space-y-6">
            {featuredSermons.map((sermon, index) => (
              <div
                key={index}
                className={`flex flex-col items-center gap-6 rounded-2xl bg-gray-50 p-6 shadow-md transition-all duration-300 hover:shadow-lg md:flex-row ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <img
                  src={sermon.thumbnail}
                  alt={sermon.title}
                  className="h-32 w-full rounded-xl object-cover md:h-24 md:w-32"
                />
                <div className="flex-1">
                  <h3 className="mb-1 text-xl font-bold text-gray-900">
                    {sermon.title}
                  </h3>
                  <p className="mb-2" style={{ color: "#256E63" }}>
                    {sermon.speaker} • {sermon.church}
                  </p>
                  <p className="mb-2 text-sm text-gray-600">
                    {sermon.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span>📅 {sermon.date}</span>
                    <span>⏱️ {sermon.duration}</span>
                    <span>👀 {sermon.views}</span>
                    <span>📖 {sermon.scripture}</span>
                  </div>
                </div>
                <button
                  className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: "#090E24" }}
                >
                  <span className="text-xl text-white">▶</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className={`mb-6 text-4xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Start Growing in Faith Today
          </h2>
          <p
            className={`mb-8 text-lg text-gray-700 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            Download Jevah and access thousands of inspiring sermons, live
            events, and Bible studies. Join thousands of believers deepening
            their faith through God's word.
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

export default Sermons;
