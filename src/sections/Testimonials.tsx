import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { StarIcon, HeartIcon } from "@heroicons/react/24/solid";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";

const testimonials = [
  {
    initials: "C.W.",
    name: "Clara W.",
    role: "Devotional Listener",
    avatarBg: "from-teal-600 to-emerald-500",
    quote:
      "Jevah has transformed my daily devotional time. The comprehensive content and easy-to-use interface make it my go-to app for spiritual growth.",
    tag: "Spiritual Growth",
  },
  {
    initials: "M.H.",
    name: "Michael H.",
    role: "Parent & Community Member",
    avatarBg: "from-[#256E63] to-teal-700",
    quote:
      "I love how Jevah brings everything together in one place. The prayer community feature has been a blessing, and my children enjoy the Children's Zone.",
    tag: "Family & Prayer",
  },
  {
    initials: "J.P.",
    name: "Jonathan P.",
    role: "Worship Enthusiast",
    avatarBg: "from-amber-500 to-orange-600",
    quote:
      "The gospel music library is incredible, and the sermons have been so inspiring. This app has become essential to my faith journey.",
    tag: "Gospel Music",
  },
  {
    initials: "S.R.",
    name: "Sarah R.",
    role: "Busy Parent",
    avatarBg: "from-purple-600 to-indigo-600",
    quote:
      "As a busy parent, I appreciate having quality Christian content for my kids. The Children's Zone is engaging and educational.",
    tag: "Children's Zone",
  },
  {
    initials: "D.T.",
    name: "David T.",
    role: "Church Member",
    avatarBg: "from-[#0B1A1F] to-[#12263a]",
    quote:
      "The community features help me stay connected with my church members and other believers. It's like having a church in my pocket.",
    tag: "Community",
  },
  {
    initials: "A.K.",
    name: "Amanda K.",
    role: "Active Reader & Listener",
    avatarBg: "from-sky-600 to-blue-700",
    quote:
      "Jevah has everything I need for spiritual growth. The e-books, music, and sermons are all top-quality content that I can access anytime.",
    tag: "E-Books & Sermons",
  },
];

export default function Testimonials() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.08 });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-jevah-bg px-4 py-24 transition-colors duration-300 sm:px-8 lg:px-12"
    >
      <div
        className="quote-orb pointer-events-none absolute -left-16 top-16 h-72 w-72 rounded-full bg-[#256E63]/10 blur-3xl dark:bg-jevah-accent/15"
        aria-hidden
      />
      <div
        className="quote-orb pointer-events-none absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-500/15"
        style={{ animationDelay: "-6s" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#256E63]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#256E63] dark:bg-jevah-accent/15 dark:text-jevah-accent">
            <HeartIcon className="quote-heart h-3.5 w-3.5" />
            Stories
          </div>
          <h2
            className={`mt-4 text-3xl font-extrabold tracking-tight text-jevah-text sm:text-4xl transition-all duration-700 ${
              isIntersecting ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            What believers say
          </h2>
          <p
            className={`mt-3 text-sm text-jevah-text-muted sm:text-base transition-all duration-700 delay-100 ${
              isIntersecting ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            Real words from people growing in faith, worship, and family on Jevah.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <article
              key={item.name}
              className={`quote-float ${isIntersecting ? "opacity-100" : "opacity-0"}`}
              style={{
                animationDelay: `${index * 0.38}s`,
                transitionDelay: `${index * 70}ms`,
              }}
            >
              <div className="group relative flex h-full flex-col rounded-3xl border border-jevah-border/70 bg-jevah-surface/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#256E63]/25 hover:shadow-xl hover:shadow-[#256E63]/10 dark:bg-jevah-elevated/90">
              <ChatBubbleLeftEllipsisIcon
                className="quote-mark-dance absolute right-5 top-5 h-7 w-7 text-[#256E63]/20 dark:text-jevah-accent/25"
                style={{ animationDelay: `${index * 0.22}s` }}
              />

              <span className="mb-3 inline-flex w-fit rounded-full bg-jevah-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-jevah-text-muted">
                {item.tag}
              </span>

              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className="quote-star h-3.5 w-3.5 fill-current"
                    style={{ animationDelay: `${index * 0.12 + i * 0.16}s` }}
                  />
                ))}
              </div>

              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-jevah-text">
                “{item.quote}”
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.avatarBg} text-[11px] font-extrabold text-white shadow-sm`}
                >
                  {item.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-jevah-text">
                    {item.name}
                  </p>
                  <p className="truncate text-xs text-jevah-text-muted">
                    {item.role}
                  </p>
                </div>
              </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
