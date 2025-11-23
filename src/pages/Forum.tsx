import { useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import ButtonLink from "../common/ButtonLink";
import ForumImg from "../assets/logos/forum.png";

function Forum() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    { name: "All", count: 12 },
    { name: "Prayer Requests", count: 4 },
    { name: "Bible Study", count: 3 },
    { name: "Testimonies", count: 2 },
    { name: "Questions & Answers", count: 3 },
  ];

  const forumPosts = [
    {
      title: "How to Deepen Your Prayer Life",
      author: "Sarah M.",
      category: "Prayer Requests",
      replies: 24,
      views: 156,
      lastActivity: "2 hours ago",
      excerpt:
        "I've been struggling with maintaining a consistent prayer life. Any tips or resources that have helped you?",
      isPinned: true,
    },
    {
      title: "Understanding the Book of Revelation",
      author: "Michael T.",
      category: "Bible Study",
      replies: 18,
      views: 203,
      lastActivity: "5 hours ago",
      excerpt:
        "Looking for a study group to go through Revelation together. Anyone interested in joining?",
      isPinned: false,
    },
    {
      title: "Testimony: God's Faithfulness in Difficult Times",
      author: "Jennifer L.",
      category: "Testimonies",
      replies: 32,
      views: 289,
      lastActivity: "1 day ago",
      excerpt:
        "I wanted to share how God has been faithful to me during this challenging season...",
      isPinned: true,
    },
    {
      title: "What Does the Bible Say About Tithing?",
      author: "David K.",
      category: "Questions & Answers",
      replies: 15,
      views: 178,
      lastActivity: "2 days ago",
      excerpt:
        "I'm new to faith and have questions about tithing. Can someone explain the biblical perspective?",
      isPinned: false,
    },
    {
      title: "Prayer Request: Healing for My Mother",
      author: "Maria R.",
      category: "Prayer Requests",
      replies: 42,
      views: 312,
      lastActivity: "2 days ago",
      excerpt:
        "Please pray for my mother who is undergoing surgery this week. We trust in God's healing power.",
      isPinned: false,
    },
    {
      title: "Weekly Bible Study: Book of James",
      author: "Pastor Johnson",
      category: "Bible Study",
      replies: 28,
      views: 245,
      lastActivity: "3 days ago",
      excerpt:
        "Join us this week as we study the Book of James. Discussion questions will be posted daily.",
      isPinned: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 py-20 px-8 pt-[20vh] lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div
              className={`${isIntersecting ? "animate-fade-in-left" : "opacity-0"}`}
            >
              <h1
                className={`mb-6 text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: "0.2s" }}
              >
                Community Forum
              </h1>
              <p
                className={`mb-8 text-lg text-gray-700 md:text-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: "0.4s" }}
              >
                Connect with believers worldwide. Share prayer requests, ask
                questions, discuss Bible studies, and encourage one another in
                faith.
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
                  Join the Discussion
                </ButtonLink>
              </div>
            </div>
            <div
              className={`${isIntersecting ? "animate-fade-in-right" : "opacity-0"}`}
            >
              <img
                src={ForumImg}
                alt="Forum"
                className="h-auto w-full rounded-2xl"
                style={{ transform: "rotate(-12deg)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-8 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.name)}
                className={`rounded-full px-6 py-2 font-medium transition-all duration-300 ${
                  selectedCategory === category.name
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

      {/* Forum Posts */}
      <section ref={ref} className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Recent Posts</h2>
            <button
              className="rounded-full px-6 py-2 text-white transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: "#090E24" }}
            >
              + New Post
            </button>
          </div>

          <div className="space-y-4">
            {forumPosts.map((post, index) => (
              <div
                key={index}
                className={`rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {post.isPinned && (
                        <span className="text-xl">📌</span>
                      )}
                      <h3 className="text-xl font-bold text-gray-900">
                        {post.title}
                      </h3>
                    </div>
                    <p className="mb-3 text-gray-600">{post.excerpt}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>By {post.author}</span>
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: "#256E63" }}
                      >
                        {post.category}
                      </span>
                      <span>💬 {post.replies} replies</span>
                      <span>👀 {post.views} views</span>
                      <span>🕐 {post.lastActivity}</span>
                    </div>
                  </div>
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
            Join the Conversation
          </h2>
          <p
            className={`mb-8 text-lg text-gray-700 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            Download the Jevah app to participate in forum discussions, share
            your thoughts, and connect with the community.
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

export default Forum;

