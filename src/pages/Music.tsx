import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import JevahLogo from "../components/JevahLogo";

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
    <div className="min-h-screen bg-teal-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 py-16">
        <div className="mx-auto max-w-7xl px-8 text-center lg:px-12">
          <JevahLogo width={120} height={60} className="mx-auto mb-8" />
          <h1 className="text-cream-50 mb-6 text-5xl font-bold md:text-6xl">
            🎵 Gospel Music Streaming
          </h1>
          <p className="text-cream-50 mx-auto mb-8 max-w-3xl text-xl leading-relaxed">
            Stream over 10,000 gospel songs, hymns, and worship music from
            artists worldwide. Create playlists, discover new artists, and
            worship anywhere.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="https://play.google.com"
              className="rounded-xl bg-orange-400 px-8 py-4 font-bold text-white transition-colors duration-200 hover:scale-105 hover:bg-orange-300"
            >
              🎧 Start Listening
            </a>
            <a
              href="mailto:support@jevahapp.com"
              className="rounded-xl border-2 border-orange-400 px-8 py-4 font-bold text-orange-400 transition-all duration-200 hover:scale-105 hover:bg-orange-400 hover:text-white"
            >
              📧 Music Support
            </a>
          </div>
        </div>
      </div>

      {/* Music Player Interface */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              🎶 Now Playing
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Experience our music player interface
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
              <div className="mb-6 flex items-center gap-6">
                <img
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=200&auto=format&fit=crop"
                  alt="Now Playing"
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-cream-50 text-2xl font-bold">
                    Amazing Grace
                  </h3>
                  <p className="text-lg text-orange-300">Various Artists</p>
                  <p className="text-cream-50/80 text-sm">2.5M plays</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-2 h-2 w-full rounded-full bg-white/20">
                  <div
                    className="h-2 rounded-full bg-orange-400"
                    style={{ width: "35%" }}
                  ></div>
                </div>
                <div className="text-cream-50/80 flex justify-between text-sm">
                  <span>1:23</span>
                  <span>3:45</span>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button className="text-cream-50 transition-colors hover:text-orange-400">
                  <span className="text-2xl">⏮️</span>
                </button>
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-400 text-white transition-colors hover:bg-orange-300">
                  <span className="text-xl">▶️</span>
                </button>
                <button className="text-cream-50 transition-colors hover:text-orange-400">
                  <span className="text-2xl">⏭️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Songs */}
      <section ref={ref} className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div
            className={`mb-16 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              🔥 Trending Now
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              The most played gospel songs this week
            </p>
          </div>

          <div className="space-y-4">
            {trendingSongs.map((song, index) => (
              <div
                key={index}
                className={`flex items-center gap-6 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 ${
                  isIntersecting ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-8 text-2xl font-bold text-orange-400">
                  {index + 1}
                </div>
                <img
                  src={song.image}
                  alt={song.title}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-cream-50 text-xl font-bold">
                    {song.title}
                  </h3>
                  <p className="text-orange-300">{song.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-cream-50/80 text-sm">{song.plays} plays</p>
                  <p className="text-cream-50/60 text-sm">{song.duration}</p>
                </div>
                <button className="text-cream-50 transition-colors hover:text-orange-400">
                  <span className="text-2xl">▶️</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Playlists */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              📋 Featured Playlists
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Curated collections for every worship moment
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {playlists.map((playlist, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
              >
                <img
                  src={playlist.image}
                  alt={playlist.title}
                  className="mb-4 h-32 w-full rounded-xl object-cover"
                />
                <h3 className="text-cream-50 mb-2 text-lg font-bold">
                  {playlist.title}
                </h3>
                <p className="mb-2 text-sm text-orange-300">
                  {playlist.creator}
                </p>
                <div className="text-cream-50/80 flex justify-between text-sm">
                  <span>{playlist.songs} songs</span>
                  <span>{playlist.followers} followers</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Artists */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              ⭐ Top Gospel Artists
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Follow your favorite gospel artists and discover new ones
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {artists.map((artist, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
              >
                <div className="relative mb-4">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="mx-auto h-20 w-20 rounded-full border-4 border-orange-400 object-cover"
                  />
                  {artist.verified && (
                    <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-400 text-xs text-white">
                      ✓
                    </div>
                  )}
                </div>
                <h3 className="text-cream-50 mb-2 text-lg font-bold">
                  {artist.name}
                </h3>
                <p className="mb-2 text-sm text-orange-300">
                  {artist.followers} followers
                </p>
                <p className="text-cream-50/80 text-sm">{artist.songs} songs</p>
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
              🎵 Start Your Gospel Music Journey
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-white">
              Download JEVAH and access unlimited gospel music, create
              playlists, and discover new artists. Join thousands of believers
              worshiping through music.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="https://play.google.com"
                className="rounded-xl bg-white px-8 py-4 font-bold text-orange-400 transition-colors duration-200 hover:scale-105 hover:bg-gray-100"
              >
                🎧 Download Music App
              </a>
              <a
                href="mailto:support@jevahapp.com"
                className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-white hover:text-orange-400"
              >
                📧 Music Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Music;
