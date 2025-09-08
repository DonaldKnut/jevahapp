import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import JevahLogo from "../components/JevahLogo";

function Marketplace() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const productCategories = [
    {
      title: "Christian Books",
      description: "Inspirational books, devotionals, and biblical studies",
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1000&auto=format&fit=crop",
      icon: "📚",
      items: "2,500+ books",
    },
    {
      title: "E-books & Audiobooks",
      description: "Digital books and audio versions for mobile reading",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
      icon: "📱",
      items: "1,800+ digital",
    },
    {
      title: "Children's Resources",
      description: "Educational games, toys, and activities for kids",
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=1000&auto=format&fit=crop",
      icon: "🎮",
      items: "500+ items",
    },
    {
      title: "Worship Materials",
      description: "Songbooks, sheet music, and worship resources",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1000&auto=format&fit=crop",
      icon: "🎵",
      items: "800+ resources",
    },
    {
      title: "Ministry Tools",
      description: "Resources for pastors, leaders, and church workers",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop",
      icon: "⛪",
      items: "600+ tools",
    },
    {
      title: "Gift Items",
      description: "Christian gifts, jewelry, and inspirational items",
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=1000&auto=format&fit=crop",
      icon: "🎁",
      items: "1,200+ gifts",
    },
  ];

  const featuredProducts = [
    {
      title: "Daily Devotional Collection",
      price: "$9.99",
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=400&auto=format&fit=crop",
      rating: 5,
      reviews: "1,200+ reviews",
    },
    {
      title: "Children's Bible Stories",
      price: "$12.99",
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=400&auto=format&fit=crop",
      rating: 5,
      reviews: "800+ reviews",
    },
    {
      title: "Worship Song Collection",
      price: "$7.99",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop",
      rating: 5,
      reviews: "950+ reviews",
    },
    {
      title: "Pastor's Resource Kit",
      price: "$24.99",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
      rating: 5,
      reviews: "600+ reviews",
    },
  ];

  const features = [
    {
      icon: "🛒",
      title: "Easy Shopping",
      description:
        "Browse and purchase Christian resources with secure payment",
    },
    {
      icon: "📱",
      title: "Mobile Access",
      description: "Shop on any device with our mobile-optimized marketplace",
    },
    {
      icon: "⭐",
      title: "Quality Assurance",
      description: "All products are vetted for quality and Christian values",
    },
    {
      icon: "🚚",
      title: "Fast Delivery",
      description:
        "Quick shipping for physical products, instant access for digital",
    },
    {
      icon: "💝",
      title: "Gift Options",
      description:
        "Send gifts to friends and family with personalized messages",
    },
    {
      icon: "🔄",
      title: "Easy Returns",
      description: "Hassle-free returns and exchanges for your peace of mind",
    },
  ];

  const sellers = [
    {
      name: "Grace Publishing",
      specialty: "Devotionals & Study Guides",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      products: "500+ products",
    },
    {
      name: "Faith Kids Store",
      specialty: "Children's Resources",
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=400&auto=format&fit=crop",
      products: "300+ products",
    },
    {
      name: "Worship Resources Co.",
      specialty: "Music & Worship Materials",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop",
      products: "400+ products",
    },
    {
      name: "Ministry Tools Inc.",
      specialty: "Pastor & Leader Resources",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
      products: "250+ products",
    },
  ];

  return (
    <div className="min-h-screen bg-teal-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 py-16">
        <div className="mx-auto max-w-7xl px-8 text-center lg:px-12">
          <JevahLogo width={120} height={60} className="mx-auto mb-8" />
          <h1 className="text-cream-50 mb-6 text-5xl font-bold md:text-6xl">
            Christian Marketplace
          </h1>
          <p className="text-cream-50 mx-auto mb-8 max-w-3xl text-xl leading-relaxed">
            Discover Christian books, devotionals, children's resources, worship
            materials, and faith-based products from trusted sellers worldwide.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="https://play.google.com"
              className="rounded-xl bg-orange-400 px-8 py-4 font-bold text-white transition-colors duration-200 hover:scale-105 hover:bg-orange-300"
            >
              Shop Now
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

      {/* Featured Products */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              Featured Products
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Popular Christian resources loved by our community
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
              >
                <div className="relative h-48">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-4 top-4 rounded-full bg-orange-400 px-3 py-1 text-sm font-bold text-white">
                    {product.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-cream-50 mb-2 text-lg font-bold">
                    {product.title}
                  </h3>
                  <div className="mb-2 flex items-center">
                    <div className="flex text-orange-400">
                      {[...Array(product.rating)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                    <span className="text-cream-50/80 ml-2 text-sm">
                      {product.reviews}
                    </span>
                  </div>
                  <button className="w-full rounded-lg bg-orange-400 py-2 font-bold text-white transition-colors duration-200 hover:bg-orange-300">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section ref={ref} className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div
            className={`mb-16 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              Product Categories
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Explore our wide range of Christian resources and products
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {productCategories.map((category, index) => (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 ${
                  isIntersecting ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute left-4 top-4">
                    <div className="text-3xl">{category.icon}</div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="mb-2 text-xl font-bold text-white">
                      {category.title}
                    </h3>
                    <p className="text-sm font-semibold text-orange-300">
                      {category.items}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-cream-50 leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Sellers */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              Trusted Sellers
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Shop from verified Christian businesses and ministries
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {sellers.map((seller, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
              >
                <div className="relative mb-4">
                  <img
                    src={seller.image}
                    alt={seller.name}
                    className="mx-auto h-20 w-20 rounded-full border-4 border-orange-400 object-cover"
                  />
                </div>
                <h3 className="text-cream-50 mb-2 text-lg font-bold">
                  {seller.name}
                </h3>
                <p className="mb-2 text-sm text-orange-300">
                  {seller.specialty}
                </p>
                <p className="text-cream-50/80 text-sm">{seller.products}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              Shopping Features
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Enjoy a seamless shopping experience with powerful features
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
              >
                <div className="mb-4 text-5xl">{feature.icon}</div>
                <h3 className="text-cream-50 mb-3 text-xl font-bold">
                  {feature.title}
                </h3>
                <p className="text-cream-50/80 leading-relaxed">
                  {feature.description}
                </p>
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
              Start Shopping for Christian Resources
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-white">
              Discover quality Christian products and support ministries through
              our marketplace
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="https://play.google.com"
                className="rounded-xl bg-white px-8 py-4 font-bold text-orange-400 transition-colors duration-200 hover:scale-105 hover:bg-gray-100"
              >
                Shop Now
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

export default Marketplace;
