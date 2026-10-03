import { useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import ButtonLink from "../common/ButtonLink";
import { useFeedback } from "../components/admin/Feedback";

function ContactUs() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const { toast } = useFeedback();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    message: "",
    useCase: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent", "We'll get back to you within 24 hours.");
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      message: "",
      useCase: "",
    });
  };

  const messageLength = formData.message.length;
  const maxLength = 150;

  return (
    <section
      ref={ref}
      id="contact"
      className="jevah-section py-20 px-8 transition-colors duration-300 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2">
          <div
            className={`${isIntersecting ? "animate-fade-in-left" : "opacity-0"} space-y-6`}
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span>We're available 9 am - 11 pm WAT</span>
              </div>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-jevah-text sm:text-5xl">
                Contact Us
              </h2>
              <p className="mt-2 text-base text-jevah-text-muted">
                Have questions or need assistance? Reach out to our team instantly via WhatsApp or direct phone call.
              </p>
            </div>

            {/* WhatsApp Card */}
            <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-jevah-text">Instant WhatsApp Chat</h3>
                  <p className="text-xs text-jevah-text-muted">Quick responses from our team</p>
                </div>
                <ButtonLink
                  href="https://wa.me/2347037742764"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:bg-emerald-400 hover:shadow-emerald-500/25 active:scale-95"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                  Let's chat on WhatsApp
                </ButtonLink>
              </div>
            </div>

            {/* Direct Phone Call Card */}
            <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
                Wanna call instead?
              </p>
              <a
                href="tel:+2347037742764"
                className="inline-flex items-center gap-3 text-xl font-black text-jevah-text transition-colors hover:text-amber-500"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <span>+234 703 774 2764</span>
              </a>
            </div>

              <p className="text-xs text-jevah-text-muted">
                Customer service for Jevah, operated by Tevadice Limited. Or leave a message below.
              </p>
          </div>

          <div
            className={`${isIntersecting ? "animate-fade-in-right" : "opacity-0"}`}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full name"
                required
                className="jevah-marketing-input"
              />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="jevah-marketing-input"
              />
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone number"
                required
                className="jevah-marketing-input"
              />
              <div className="relative">
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your message"
                  required
                  rows={6}
                  maxLength={maxLength}
                  className="jevah-marketing-input pb-8"
                />
                <div className="absolute bottom-3 right-3 text-sm text-jevah-text-muted">
                  {messageLength}/{maxLength}
                </div>
              </div>
              <input
                type="text"
                id="useCase"
                name="useCase"
                value={formData.useCase}
                onChange={handleChange}
                placeholder="How Do You Intend to Use Jevah?"
                required
                className="jevah-marketing-input"
              />
              <button
                type="submit"
                className="jevah-btn-dark w-full rounded-full px-6 py-3 transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactUs;
