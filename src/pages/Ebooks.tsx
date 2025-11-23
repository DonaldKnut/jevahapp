import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import ButtonLink from "../common/ButtonLink";

function Ebooks() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const categories = [
    { name: "All", count: 24 },
    { name: "Devotionals", count: 8 },
    { name: "Bible Study", count: 6 },
    { name: "Christian Living", count: 5 },
    { name: "Theology", count: 3 },
    { name: "Biography", count: 2 },
  ];

  const featuredBooks = [
    {
      title: "Walking in Faith: A Daily Devotional",
      author: "Pastor Michael Johnson",
      category: "Devotionals",
      pages: 365,
      rating: 4.8,
      description:
        "A year-long journey through Scripture with daily reflections and prayers to strengthen your walk with God.",
      image:
        "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=300&auto=format&fit=crop",
    },
    {
      title: "Understanding the Bible",
      author: "Dr. Sarah Williams",
      category: "Bible Study",
      pages: 420,
      rating: 4.9,
      description:
        "A comprehensive guide to understanding Scripture, its history, context, and application to modern life.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    },
    {
      title: "The Power of Prayer",
      author: "Rev. David Thompson",
      category: "Christian Living",
      pages: 280,
      rating: 4.7,
      description:
        "Discover the transformative power of prayer and learn practical ways to deepen your communication with God.",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop",
    },
    {
      title: "Living with Purpose",
      author: "Bishop Lisa Chen",
      category: "Christian Living",
      pages: 320,
      rating: 4.6,
      description:
        "Find your God-given purpose and learn how to live a life of meaning and impact in today's world.",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=300&auto=format&fit=crop",
    },
    {
      title: "Systematic Theology",
      author: "Dr. James Wilson",
      category: "Theology",
      pages: 650,
      rating: 4.9,
      description:
        "An in-depth exploration of Christian doctrine and theology for serious students of the faith.",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=300&auto=format&fit=crop",
    },
    {
      title: "The Life of C.S. Lewis",
      author: "Biographer Team",
      category: "Biography",
      pages: 380,
      rating: 4.8,
      description:
        "An inspiring biography of one of the greatest Christian writers and thinkers of the 20th century.",
      image:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=300&auto=format&fit=crop",
    },
  ];

  const recentBooks = [
    {
      title: "Morning Devotions",
      author: "Various Authors",
      category: "Devotionals",
      pages: 180,
      rating: 4.5,
    },
    {
      title: "Bible Study Guide: Romans",
      author: "Study Group",
      category: "Bible Study",
      pages: 240,
      rating: 4.7,
    },
    {
      title: "Faith in Action",
      author: "Pastor Johnson",
      category: "Christian Living",
      pages: 200,
      rating: 4.6,
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
              Christian E-books Library
            </h1>
            <p
              className={`mx-auto mb-8 max-w-3xl text-lg text-gray-700 md:text-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.4s" }}
            >
              Access thousands of Christian e-books, devotionals, Bible studies,
              and theological works. Read on any device, anywhere, anytime.
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
                Browse Library
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-8 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`rounded-full px-6 py-2 font-medium transition-all duration-300 ${
                  index === 0
                    ? "bg-[#090E24] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section ref={ref} className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2
            className={`mb-12 text-center text-4xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Featured Books
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredBooks.map((book, index) => (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="h-48 w-32 object-cover"
                  />
                  <div className="flex-1 p-6">
                    <div className="mb-2">
                      <span
                        className="rounded-full px-2 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: "#256E63" }}
                      >
                        {book.category}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-gray-900">
                      {book.title}
                    </h3>
                    <p className="mb-2 text-sm" style={{ color: "#256E63" }}>
                      {book.author}
                    </p>
                    <p className="mb-3 text-sm text-gray-600">
                      {book.description}
                    </p>
                    <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
                      <span>📄 {book.pages} pages</span>
                      <span>⭐ {book.rating}</span>
                    </div>
                    <button
                      className="w-full rounded-full px-4 py-2 text-white transition-all duration-300 hover:opacity-90"
                      style={{ backgroundColor: "#090E24" }}
                    >
                      Read Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Books */}
      <section className="bg-white py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2
            className={`mb-12 text-center text-4xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Recently Added
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {recentBooks.map((book, index) => (
              <div
                key={index}
                className={`rounded-2xl bg-gray-50 p-6 shadow-md transition-all duration-300 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: "#256E63" }}
                  >
                    {book.category}
                  </span>
                  <span className="text-sm text-gray-500">⭐ {book.rating}</span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {book.title}
                </h3>
                <p className="mb-3 text-sm" style={{ color: "#256E63" }}>
                  {book.author}
                </p>
                <div className="mb-4 text-sm text-gray-500">
                  📄 {book.pages} pages
                </div>
                <button
                  className="w-full rounded-full px-4 py-2 text-white transition-all duration-300 hover:opacity-90"
                  style={{ backgroundColor: "#090E24" }}
                >
                  Read Now
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
            Start Reading Today
          </h2>
          <p
            className={`mb-8 text-lg text-gray-700 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            Download the Jevah app to access our complete e-book library. Read
            offline, bookmark your favorites, and take notes as you study.
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

export default Ebooks;

