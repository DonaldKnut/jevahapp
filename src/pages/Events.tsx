import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import ButtonLink from "../common/ButtonLink";

function Events() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const upcomingEvents = [
    {
      title: "Sunday Morning Worship Service",
      date: "December 15, 2024",
      time: "10:00 AM - 12:00 PM EST",
      location: "Live Stream",
      speaker: "Pastor Michael Johnson",
      description:
        "Join us for an inspiring Sunday morning service with powerful worship and a message on faith and perseverance.",
      image:
        "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=600&auto=format&fit=crop",
      type: "Worship Service",
    },
    {
      title: "Bible Study: Book of Psalms",
      date: "December 18, 2024",
      time: "7:00 PM - 8:30 PM EST",
      location: "Online",
      speaker: "Rev. Sarah Williams",
      description:
        "Deep dive into the Book of Psalms. Explore the poetic prayers and praises that have inspired believers for generations.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
      type: "Bible Study",
    },
    {
      title: "Youth Night: Faith in Action",
      date: "December 20, 2024",
      time: "6:30 PM - 8:00 PM EST",
      location: "Live Stream",
      speaker: "Pastor Lisa Chen",
      description:
        "An interactive session for young believers to explore how to live out their faith in everyday life.",
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=600&auto=format&fit=crop",
      type: "Youth Event",
    },
    {
      title: "Prayer & Fasting Conference",
      date: "January 5, 2025",
      time: "9:00 AM - 5:00 PM EST",
      location: "Live Stream",
      speaker: "Multiple Speakers",
      description:
        "A day of prayer, fasting, and seeking God together. Join believers worldwide for this powerful spiritual gathering.",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
      type: "Conference",
    },
    {
      title: "Gospel Music Night",
      date: "January 12, 2025",
      time: "7:00 PM - 9:00 PM EST",
      location: "Live Stream",
      speaker: "Various Artists",
      description:
        "An evening of powerful gospel music featuring renowned artists. Experience worship through music and song.",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop",
      type: "Music Event",
    },
    {
      title: "Women's Fellowship",
      date: "January 19, 2025",
      time: "2:00 PM - 4:00 PM EST",
      location: "Online",
      speaker: "Rev. Sarah Williams",
      description:
        "A special gathering for women to connect, share, and grow together in faith. All women are welcome.",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=600&auto=format&fit=crop",
      type: "Fellowship",
    },
  ];

  const eventTypes = [
    { name: "All Events", count: upcomingEvents.length },
    { name: "Worship Service", count: 1 },
    { name: "Bible Study", count: 1 },
    { name: "Youth Event", count: 1 },
    { name: "Conference", count: 1 },
    { name: "Music Event", count: 1 },
    { name: "Fellowship", count: 1 },
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
              Upcoming Events
            </h1>
            <p
              className={`mx-auto mb-8 max-w-3xl text-lg text-gray-700 md:text-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.4s" }}
            >
              Join us for inspiring worship services, Bible studies, conferences,
              and fellowship events. Connect with believers worldwide.
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
                Download App to Join
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Event Types Filter */}
      <section className="bg-white py-8 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap justify-center gap-4">
            {eventTypes.map((type, index) => (
              <button
                key={index}
                className={`rounded-full px-6 py-2 font-medium transition-all duration-300 ${
                  index === 0
                    ? "bg-[#090E24] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type.name} ({type.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section ref={ref} className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute left-4 top-4">
                    <span
                      className="rounded-full px-3 py-1 text-sm font-semibold text-white"
                      style={{ backgroundColor: "#256E63" }}
                    >
                      {event.type}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    {event.title}
                  </h3>
                  <p className="mb-2 text-sm" style={{ color: "#256E63" }}>
                    {event.speaker}
                  </p>
                  <p className="mb-4 text-sm text-gray-600">
                    {event.description}
                  </p>
                  <div className="mb-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🕐</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <button
                    className="w-full rounded-full px-4 py-2 text-white transition-all duration-300 hover:opacity-90"
                    style={{ backgroundColor: "#090E24" }}
                  >
                    Join Event
                  </button>
                </div>
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
            Never Miss an Event
          </h2>
          <p
            className={`mb-8 text-lg text-gray-700 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            Download the Jevah app to get notifications about upcoming events
            and join live streams directly from your device.
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

export default Events;

