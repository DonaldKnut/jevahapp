import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import ButtonLink from "../common/ButtonLink";

function Music() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const trendingSongs = [
    {
      title: "Amazing Grace",
      artist: "Various Artists",
      duration: "3:45",
      plays: "2.5M",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop",
    },
    {
      title: "How Great Thou Art",
      artist: "Gospel Choir",
      duration: "4:12",
      plays: "1.8M",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
    },
    {
      title: "Blessed Assurance",
      artist: "Contemporary Worship",
      duration: "3:28",
      plays: "1.2M",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    },
    {
      title: "Great Is Thy Faithfulness",
      artist: "Traditional Hymns",
      duration: "4:05",
      plays: "950K",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop",
    },
  ];

  const playlists = [
    {
      title: "Sunday Morning Worship",
      songs: 25,
      followers: "12K",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop",
      creator: "Grace Community Church",
    },
    {
      title: "Gospel Classics",
      songs: 18,
      followers: "8.5K",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
      creator: "Music Ministry",
    },
    {
      title: "Contemporary Praise",
      songs: 32,
      followers: "15K",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      creator: "New Life Fellowship",
    },
    {
      title: "Children's Gospel",
      songs: 15,
      followers: "5.2K",
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=400&auto=format&fit=crop",
      creator: "Kids Ministry",
    },
  ];

  const artists = [
    {
      name: "Kirk Franklin",
      followers: "2.1M",
      songs: 45,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      verified: true,
    },
    {
      name: "CeCe Winans",
      followers: "1.8M",
      songs: 38,
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=400&auto=format&fit=crop",
      verified: true,
    },
    {
      name: "Tasha Cobbs Leonard",
      followers: "1.5M",
      songs: 42,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
      verified: true,
    },
    {
      name: "Travis Greene",
      followers: "1.2M",
      songs: 35,
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop",
      verified: true,
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
              Gospel Music Streaming
            </h1>
            <p
              className={`mx-auto mb-8 max-w-3xl text-lg text-gray-700 md:text-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.4s" }}
            >
              Stream over 10,000 gospel songs, hymns, and worship music from
              artists worldwide. Create playlists, discover new artists, and
              worship anywhere.
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
                Start Listening
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Music Player Interface */}
      <section ref={ref} className="bg-white py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div
            className={`mb-12 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Now Playing
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Experience our music player interface
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div
              className={`rounded-2xl bg-gray-50 p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="mb-6 flex items-center gap-6">
                <img
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=200&auto=format&fit=crop"
                  alt="Now Playing"
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Amazing Grace
                  </h3>
                  <p className="text-lg" style={{ color: "#256E63" }}>
                    Various Artists
                  </p>
                  <p className="text-sm text-gray-600">2.5M plays</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ width: "35%", backgroundColor: "#256E63" }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>1:23</span>
                  <span>3:45</span>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button className="text-gray-600 transition-colors hover:text-[#256E63]">
                  <span className="text-2xl">⏮</span>
                </button>
                <button
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: "#256E63" }}
                >
                  <span className="text-xl">▶</span>
                </button>
                <button className="text-gray-600 transition-colors hover:text-[#256E63]">
                  <span className="text-2xl">⏭</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Songs */}
      <section className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div
            className={`mb-12 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Trending Now
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              The most played gospel songs this week
            </p>
          </div>

          <div className="space-y-4">
            {trendingSongs.map((song, index) => (
              <div
                key={index}
                className={`flex items-center gap-6 rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-8 text-2xl font-bold" style={{ color: "#256E63" }}>
                  {index + 1}
                </div>
                <img
                  src={song.image}
                  alt={song.title}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {song.title}
                  </h3>
                  <p style={{ color: "#256E63" }}>{song.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{song.plays} plays</p>
                  <p className="text-sm text-gray-500">{song.duration}</p>
                </div>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: "#090E24" }}
                >
                  <span className="text-lg">▶</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Playlists */}
      <section className="bg-white py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div
            className={`mb-12 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Featured Playlists
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Curated collections for every worship moment
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {playlists.map((playlist, index) => (
              <div
                key={index}
                className={`rounded-2xl bg-gray-50 p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <img
                  src={playlist.image}
                  alt={playlist.title}
                  className="mb-4 h-32 w-full rounded-xl object-cover"
                />
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {playlist.title}
                </h3>
                <p className="mb-2 text-sm" style={{ color: "#256E63" }}>
                  {playlist.creator}
                </p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{playlist.songs} songs</span>
                  <span>{playlist.followers} followers</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Artists */}
      <section className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div
            className={`mb-12 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Top Gospel Artists
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Follow your favorite gospel artists and discover new ones
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {artists.map((artist, index) => (
              <div
                key={index}
                className={`rounded-2xl bg-white p-6 text-center shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="relative mb-4">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="mx-auto h-20 w-20 rounded-full border-4 object-cover"
                    style={{ borderColor: "#256E63" }}
                  />
                  {artist.verified && (
                    <div
                      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                      style={{ backgroundColor: "#256E63" }}
                    >
                      ✓
                    </div>
                  )}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {artist.name}
                </h3>
                <p className="mb-2 text-sm" style={{ color: "#256E63" }}>
                  {artist.followers} followers
                </p>
                <p className="text-sm text-gray-600">{artist.songs} songs</p>
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
            Start Your Gospel Music Journey
          </h2>
          <p
            className={`mb-8 text-lg text-gray-700 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            Download Jevah and access unlimited gospel music, create playlists,
            and discover new artists. Join thousands of believers worshiping
            through music.
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

export default Music;
