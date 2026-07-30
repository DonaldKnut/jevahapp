import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { StarIcon, SparklesIcon, HeartIcon } from "@heroicons/react/24/solid";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";

const testimonials = [
  {
    initials: "C.W.",
    name: "Clara W.",
    role: "Devotional Listener",
    avatarBg: "from-teal-600 to-emerald-500",
    quote:
      "Jevah has transformed my daily devotional time. The comprehensive content and easy-to-use interface make it my go-to app for spiritual growth.",
    location: "Lagos, Nigeria",
    rating: 5,
    tag: "Spiritual Growth",
  },
  {
    initials: "M.H.",
    name: "Michael H.",
    role: "Parent & Community Member",
    avatarBg: "from-[#256E63] to-teal-700",
    quote:
      "I love how Jevah brings everything together in one place. The prayer community feature has been a blessing, and my children enjoy the Children's Zone.",
    location: "London, UK",
    rating: 5,
    tag: "Family & Prayer",
  },
  {
    initials: "J.P.",
    name: "Jonathan P.",
    role: "Worship Enthusiast",
    avatarBg: "from-amber-500 to-orange-600",
    quote:
      "The gospel music library is incredible, and the sermons have been so inspiring. This app has become essential to my faith journey.",
    location: "Atlanta, USA",
    rating: 5,
    tag: "Gospel Music",
  },
  {
    initials: "S.R.",
    name: "Sarah R.",
    role: "Busy Parent",
    avatarBg: "from-purple-600 to-indigo-600",
    quote:
      "As a busy parent, I appreciate having quality Christian content for my kids. The Children's Zone is engaging and educational.",
    location: "Toronto, Canada",
    rating: 5,
    tag: "Children's Zone",
  },
  {
    initials: "D.T.",
    name: "David T.",
    role: "Church Member",
    avatarBg: "from-[#0B1A1F] to-[#12263a]",
    quote:
      "The community features help me stay connected with my church members and other believers. It's like having a church in my pocket.",
    location: "Accra, Ghana",
    rating: 5,
    tag: "Community",
  },
  {
    initials: "A.K.",
    name: "Amanda K.",
    role: "Active Reader & Listener",
    avatarBg: "from-sky-600 to-blue-700",
    quote:
      "Jevah has everything I need for spiritual growth. The e-books, music, and sermons are all top-quality content that I can access anytime.",
    location: "Nairobi, Kenya",
    rating: 5,
    tag: "E-Books & Sermons",
  },
];

export default function Testimonials() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-jevah-muted via-[#eef3f1] to-jevah-bg px-4 py-24 transition-colors duration-300 dark:from-jevah-bg dark:via-jevah-surface dark:to-jevah-bg sm:px-8 lg:px-12"
    >
      <div
        className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#256E63]/5 blur-3xl dark:bg-jevah-accent/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-1/4 h-96 w-96 rounded-full bg-amber-400/5 blur-3xl dark:bg-amber-500/10"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#256E63]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#256E63] dark:bg-jevah-accent/15 dark:text-jevah-accent">
            <HeartIcon className="h-4 w-4" />
            Testimonials & Stories
          </div>

          <h2
            className={`mt-4 text-3xl font-extrabold tracking-tight text-jevah-text sm:text-4xl md:text-5xl transition-all duration-700 ${
              isIntersecting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            What Believers Say About Us
          </h2>

          <p
            className={`mt-4 text-base text-jevah-text-muted sm:text-lg transition-all duration-700 delay-100 ${
              isIntersecting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            Real stories from thousands of believers growing daily in faith, worship,
            and community with Jevah.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className={`group relative flex flex-col justify-between rounded-3xl border border-jevah-border bg-jevah-surface p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#256E63]/30 hover:shadow-2xl hover:shadow-[#256E63]/10 dark:bg-jevah-elevated dark:hover:border-jevah-accent/35 dark:hover:shadow-jevah-accent/10 ${
                isIntersecting ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="absolute right-6 top-6 text-slate-200 transition-colors group-hover:text-[#256E63]/20 dark:text-slate-600 dark:group-hover:text-jevah-accent/25">
                <ChatBubbleLeftEllipsisIcon className="h-9 w-9" />
              </div>

              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                <p className="mt-4 text-sm font-normal italic leading-relaxed text-jevah-text-muted sm:text-base">
                  "{item.quote}"
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-jevah-border pt-5">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.avatarBg} text-sm font-extrabold text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-jevah-text">{item.name}</h3>
                    <p className="text-xs text-jevah-text-muted">{item.role}</p>
                  </div>
                </div>

                <span className="rounded-full bg-jevah-muted px-3 py-1 text-[11px] font-semibold text-jevah-text-muted transition-colors group-hover:bg-[#256E63]/10 group-hover:text-[#256E63] dark:group-hover:bg-jevah-accent/15 dark:group-hover:text-jevah-accent">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`mt-16 rounded-3xl border border-[#256E63]/20 bg-gradient-to-r from-[#256E63] to-[#1e5a52] p-8 text-white shadow-xl transition-all duration-700 delay-300 dark:border-jevah-accent/25 dark:from-jevah-elevated dark:to-jevah-surface ${
            isIntersecting ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:px-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-[#4ECDC4] ring-1 ring-white/20 dark:bg-jevah-accent/15 dark:text-jevah-accent">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Join 50,000+ Active Believers Today
                </h3>
                <p className="text-xs text-white/70">
                  Experience gospel music, devotionals, and Christian fellowship on
                  Jevah.
                </p>
              </div>
            </div>

            <a
              href="/#download"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#256E63] transition-all duration-200 hover:bg-white/90 hover:shadow-lg active:scale-95 dark:bg-jevah-accent dark:text-[#0b1a1f] dark:hover:bg-jevah-accent-hover"
            >
              Get Jevah App Free
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
