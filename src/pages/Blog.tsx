import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import ButtonLink from "../common/ButtonLink";

function Blog() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const featuredPost = {
    title: "5 Ways to Deepen Your Prayer Life",
    author: "Pastor Michael Johnson",
    date: "December 10, 2024",
    category: "Spiritual Growth",
    excerpt:
      "Discover practical strategies to strengthen your prayer life and develop a deeper connection with God. Learn how to make prayer a natural part of your daily routine.",
    image:
      "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=800&auto=format&fit=crop",
    readTime: "5 min read",
  };

  const blogPosts = [
    {
      title: "Understanding the Book of Psalms",
      author: "Rev. Sarah Williams",
      date: "December 8, 2024",
      category: "Bible Study",
      excerpt:
        "Explore the poetic prayers and praises of King David. Learn how the Psalms can guide your worship and provide comfort in difficult times.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
      readTime: "7 min read",
    },
    {
      title: "Building Faith in Your Children",
      author: "Pastor Lisa Chen",
      date: "December 5, 2024",
      category: "Family",
      excerpt:
        "Practical tips for parents on how to nurture faith in children through everyday moments, Bible stories, and age-appropriate activities.",
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=600&auto=format&fit=crop",
      readTime: "6 min read",
    },
    {
      title: "The Power of Community in Faith",
      author: "Bishop David Thompson",
      date: "December 3, 2024",
      category: "Community",
      excerpt:
        "Why fellowship matters and how connecting with other believers can strengthen your walk with God and provide support during life's challenges.",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
      readTime: "8 min read",
    },
    {
      title: "Finding Peace in Times of Anxiety",
      author: "Dr. James Wilson",
      date: "November 30, 2024",
      category: "Mental Health",
      excerpt:
        "Biblical wisdom and practical strategies for managing anxiety and finding God's peace in the midst of life's storms.",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop",
      readTime: "6 min read",
    },
    {
      title: "Worship Through Music: A Guide",
      author: "Music Ministry Team",
      date: "November 28, 2024",
      category: "Worship",
      excerpt:
        "How gospel music can enhance your worship experience and help you connect with God on a deeper level through song and praise.",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop",
      readTime: "5 min read",
    },
    {
      title: "Living Out Your Faith at Work",
      author: "Pastor Michael Johnson",
      date: "November 25, 2024",
      category: "Christian Living",
      excerpt:
        "Practical ways to be a light for Christ in your workplace while maintaining professionalism and building meaningful relationships.",
      image:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=600&auto=format&fit=crop",
      readTime: "7 min read",
    },
  ];

  const categories = [
    { name: "All", count: 12 },
    { name: "Spiritual Growth", count: 3 },
    { name: "Bible Study", count: 2 },
    { name: "Family", count: 2 },
    { name: "Community", count: 2 },
    { name: "Worship", count: 1 },
    { name: "Christian Living", count: 2 },
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
              Jevah Blog
            </h1>
            <p
              className={`mx-auto mb-8 max-w-3xl text-lg text-gray-700 md:text-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.4s" }}
            >
              Inspiring articles, Bible studies, and faith-based content to help
              you grow in your relationship with God and connect with the
              Christian community.
            </p>
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

      {/* Featured Post */}
      <section ref={ref} className="bg-white py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2
            className={`mb-8 text-3xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Featured Article
          </h2>
          <div
            className={`overflow-hidden rounded-2xl bg-gray-50 shadow-lg transition-all duration-300 hover:shadow-xl md:flex ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            <img
              src={featuredPost.image}
              alt={featuredPost.title}
              className="h-64 w-full object-cover md:h-auto md:w-1/2"
            />
            <div className="flex flex-col justify-center p-8 md:w-1/2">
              <div className="mb-4 flex items-center gap-4 text-sm">
                <span
                  className="rounded-full px-3 py-1 font-semibold text-white"
                  style={{ backgroundColor: "#256E63" }}
                >
                  {featuredPost.category}
                </span>
                <span className="text-gray-500">{featuredPost.readTime}</span>
              </div>
              <h3 className="mb-3 text-3xl font-bold text-gray-900">
                {featuredPost.title}
              </h3>
              <p className="mb-4 text-gray-600">{featuredPost.excerpt}</p>
              <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
                <span>By {featuredPost.author}</span>
                <span>•</span>
                <span>{featuredPost.date}</span>
              </div>
              <button
                className="w-full rounded-full px-6 py-3 text-white transition-all duration-300 hover:opacity-90 md:w-auto"
                style={{ backgroundColor: "#090E24" }}
              >
                Read Article
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2
            className={`mb-12 text-center text-4xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Recent Articles
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post, index) => (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-3 text-sm">
                    <span
                      className="rounded-full px-3 py-1 font-semibold text-white"
                      style={{ backgroundColor: "#256E63" }}
                    >
                      {post.category}
                    </span>
                    <span className="text-gray-500">{post.readTime}</span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    {post.title}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">{post.excerpt}</p>
                  <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>
                  <button
                    className="w-full rounded-full px-4 py-2 text-white transition-all duration-300 hover:opacity-90"
                    style={{ backgroundColor: "#090E24" }}
                  >
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-white py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div
            className={`rounded-2xl p-8 text-center md:p-12 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ backgroundColor: "#090E24" }}
          >
            <h2 className="mb-4 text-3xl font-bold text-white">
              Stay Updated with Our Blog
            </h2>
            <p className="mb-6 text-lg text-gray-200">
              Subscribe to our newsletter and never miss a new article. Get
              weekly updates on faith, Bible study, and Christian living
              delivered to your inbox.
            </p>
            <form className="flex flex-col gap-4 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-full border border-gray-600 bg-transparent px-6 py-3 text-white placeholder-gray-400 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="rounded-full bg-white px-8 py-3 font-semibold text-gray-900 transition-all duration-300 hover:bg-gray-100"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className={`mb-6 text-4xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Join the Jevah Community
          </h2>
          <p
            className={`mb-8 text-lg text-gray-700 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            Download the Jevah app to access more content, join discussions, and
            connect with believers worldwide.
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

export default Blog;

