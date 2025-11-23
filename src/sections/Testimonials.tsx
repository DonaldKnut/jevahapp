import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

const testimonials = [
  {
    initials: "C.W.",
    quote:
      "Jevah has transformed my daily devotional time. The comprehensive content and easy-to-use interface make it my go-to app for spiritual growth.",
  },
  {
    initials: "M.H.",
    quote:
      "I love how Jevah brings everything together in one place. The prayer community feature has been a blessing, and my children enjoy the Children's Zone.",
  },
  {
    initials: "J.P.",
    quote:
      "The gospel music library is incredible, and the sermons have been so inspiring. This app has become essential to my faith journey.",
  },
  {
    initials: "S.R.",
    quote:
      "As a busy parent, I appreciate having quality Christian content for my kids. The Children's Zone is engaging and educational.",
  },
  {
    initials: "D.T.",
    quote:
      "The community features help me stay connected with my church members and other believers. It's like having a church in my pocket.",
  },
  {
    initials: "A.K.",
    quote:
      "Jevah has everything I need for spiritual growth. The e-books, music, and sermons are all top-quality content that I can access anytime.",
  },
];

function Testimonials() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="bg-gray-50 py-20 px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          className={`mb-12 text-center text-4xl font-bold text-gray-900 md:text-5xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
        >
          What Believers Say About Us
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`rounded-lg bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-900 text-lg font-bold text-white">
                {testimonial.initials}
              </div>
              <p className="text-gray-700">{testimonial.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;

