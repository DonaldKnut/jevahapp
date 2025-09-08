import { useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import JevahLogo from "../components/JevahLogo";

function Sermons() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const [selectedSermon, setSelectedSermon] = useState(0);

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

  const sermonSeries = [
    {
      title: "Faith in Action",
      speaker: "Pastor Michael Johnson",
      episodes: 8,
      progress: 5,
      thumbnail:
        "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=400&auto=format&fit=crop",
      description:
        "A comprehensive study on putting faith into practice in daily life",
    },
    {
      title: "The Book of Psalms",
      speaker: "Rev. Sarah Williams",
      episodes: 12,
      progress: 3,
      thumbnail:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      description:
        "Deep dive into the poetic prayers and praises of King David",
    },
    {
      title: "Walking with God",
      speaker: "Bishop David Thompson",
      episodes: 6,
      progress: 6,
      thumbnail:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
      description:
        "Learning to cultivate a closer relationship with our Heavenly Father",
    },
  ];

  return (
    <div className="min-h-screen bg-teal-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 py-16">
        <div className="mx-auto max-w-7xl px-8 text-center lg:px-12">
          <JevahLogo width={120} height={60} className="mx-auto mb-8" />
          <h1 className="text-cream-50 mb-6 text-5xl font-bold md:text-6xl">
            📖 Inspiring Sermons & Teachings
          </h1>
          <p className="text-cream-50 mx-auto mb-8 max-w-3xl text-xl leading-relaxed">
            Watch thousands of powerful sermons, Bible studies, and spiritual
            teachings from pastors worldwide. Grow in faith through God's word
            with HD video streaming.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="https://play.google.com"
              className="rounded-xl bg-orange-400 px-8 py-4 font-bold text-white transition-colors duration-200 hover:scale-105 hover:bg-orange-300"
            >
              📺 Watch Sermons
            </a>
            <a
              href="mailto:support@jevahapp.com"
              className="rounded-xl border-2 border-orange-400 px-8 py-4 font-bold text-orange-400 transition-all duration-200 hover:scale-105 hover:bg-orange-400 hover:text-white"
            >
              📧 Sermon Support
            </a>
          </div>
        </div>
      </div>

      {/* Featured Sermon Player */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              🎬 Featured Sermon
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Watch our most popular sermon this week
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm">
              <div className="relative">
                <img
                  src={featuredSermons[selectedSermon].thumbnail}
                  alt={featuredSermons[selectedSermon].title}
                  className="h-64 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <button className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-400 text-white transition-colors hover:bg-orange-300">
                    <span className="text-2xl">▶️</span>
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-red-500 px-2 py-1 text-sm font-bold text-white">
                      LIVE
                    </span>
                    <span className="rounded bg-black/50 px-2 py-1 text-sm text-white">
                      2.3K watching
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-cream-50 mb-2 text-2xl font-bold">
                  {featuredSermons[selectedSermon].title}
                </h3>
                <p className="mb-2 text-lg text-orange-300">
                  {featuredSermons[selectedSermon].speaker}
                </p>
                <p className="text-cream-50/80 mb-4 text-sm">
                  {featuredSermons[selectedSermon].church}
                </p>
                <p className="text-cream-50 mb-4">
                  {featuredSermons[selectedSermon].description}
                </p>

                <div className="text-cream-50/80 flex items-center gap-6 text-sm">
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
      <section ref={ref} className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div
            className={`mb-16 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              🔴 Live Events
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Join live worship services and Bible studies happening now
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {liveEvents.map((event, index) => (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 ${
                  isIntersecting ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <img
                    src={event.thumbnail}
                    alt={event.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute left-4 top-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        event.status === "Live Now"
                          ? "bg-red-500 text-white"
                          : "bg-orange-400 text-white"
                      }`}
                    >
                      {event.status === "Live Now"
                        ? "🔴 LIVE"
                        : "⏰ Starting Soon"}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="rounded bg-black/50 px-2 py-1 text-sm text-white">
                      {event.viewers}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-cream-50 mb-2 text-xl font-bold">
                    {event.title}
                  </h3>
                  <p className="mb-2 text-orange-300">{event.speaker}</p>
                  <p className="text-cream-50/80 text-sm">🕐 {event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sermon Series */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              📚 Sermon Series
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Follow comprehensive teaching series from start to finish
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {sermonSeries.map((series, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
              >
                <img
                  src={series.thumbnail}
                  alt={series.title}
                  className="h-48 w-full object-cover"
                />

                <div className="p-6">
                  <h3 className="text-cream-50 mb-2 text-xl font-bold">
                    {series.title}
                  </h3>
                  <p className="mb-3 text-orange-300">{series.speaker}</p>
                  <p className="text-cream-50/80 mb-4 text-sm">
                    {series.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-cream-50/80 mb-2 flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {series.progress}/{series.episodes} episodes
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/20">
                      <div
                        className="h-2 rounded-full bg-orange-400 transition-all duration-300"
                        style={{
                          width: `${(series.progress / series.episodes) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <button className="w-full rounded-lg bg-orange-400 py-2 font-bold text-white transition-colors hover:bg-orange-300">
                    Continue Series
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Sermons */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              📺 Recent Sermons
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Latest teachings from our community of pastors
            </p>
          </div>

          <div className="space-y-6">
            {featuredSermons.map((sermon, index) => (
              <div
                key={index}
                className="flex items-center gap-6 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
              >
                <img
                  src={sermon.thumbnail}
                  alt={sermon.title}
                  className="h-24 w-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-cream-50 mb-1 text-xl font-bold">
                    {sermon.title}
                  </h3>
                  <p className="mb-2 text-orange-300">
                    {sermon.speaker} • {sermon.church}
                  </p>
                  <p className="text-cream-50/80 mb-2 text-sm">
                    {sermon.description}
                  </p>
                  <div className="text-cream-50/60 flex items-center gap-4 text-sm">
                    <span>📅 {sermon.date}</span>
                    <span>⏱️ {sermon.duration}</span>
                    <span>👀 {sermon.views}</span>
                    <span>📖 {sermon.scripture}</span>
                  </div>
                </div>
                <button className="text-cream-50 transition-colors hover:text-orange-400">
                  <span className="text-3xl">▶️</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-7xl px-8 text-center lg:px-12">
          <div className="rounded-3xl bg-gradient-to-r from-orange-400 to-orange-300 p-12">
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              📖 Start Growing in Faith Today
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-white">
              Download JEVAH and access thousands of inspiring sermons, live
              events, and Bible studies. Join thousands of believers deepening
              their faith through God's word.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="https://play.google.com"
                className="rounded-xl bg-white px-8 py-4 font-bold text-orange-400 transition-colors duration-200 hover:scale-105 hover:bg-gray-100"
              >
                📺 Download Sermon App
              </a>
              <a
                href="mailto:support@jevahapp.com"
                className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-white hover:text-orange-400"
              >
                📧 Sermon Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Sermons;
