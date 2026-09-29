import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import ButtonLink from "../common/ButtonLink";
import JevahLogo from "../components/JevahLogo";
import { useFeedback } from "../components/admin/Feedback";
import Facebook from "../assets/logos/icons8-facebook.svg";
import AppStore from "../assets/logos/app_store.png";
import PlayStore from "../assets/logos/play_store.png";

const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address (e.g. name@example.com)."),
});

function Footer() {
  const { toast } = useFeedback();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = newsletterSchema.safeParse({ email });
    if (!result.success) {
      const msg = result.error.issues[0]?.message || "Invalid email address.";
      setError(msg);
      toast.error("Subscription Error", msg);
      return;
    }

    toast.success("Subscribed!", "Thanks for joining the Jevah newsletter.");
    setEmail("");
    setError(null);
  };

  return (
    <footer
      className="px-4 py-10 transition-colors duration-300 xs:px-6 sm:px-8 lg:px-12"
      style={{ backgroundColor: "var(--jevah-footer)" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Left Column - Logo, Download Button, App Store Buttons, Newsletter */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <Link to="/" className="inline-block transition-transform hover:opacity-90 active:scale-95">
                <JevahLogo onDark width={128} height={56} />
              </Link>
            </div>
            
            {/* Download App Button */}
            <div className="mb-4">
              <ButtonLink
                href="#download"
                className="inline-block rounded-full bg-jevah-green px-5 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-jevah-green-hover hover:shadow-lg"
              >
                Download App
              </ButtonLink>
            </div>

            {/* Newsletter Subscription with Zod Validation */}
            <div className="mb-6">
              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Subscribe to newsletter"
                    className={`w-full rounded-xl border bg-transparent px-4 py-2 text-xs font-semibold text-white placeholder-gray-400 focus:outline-none transition-colors ${
                      error
                        ? "border-rose-500 focus:ring-2 focus:ring-rose-500/50"
                        : "border-gray-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                    }`}
                  />
                  {error && (
                    <p className="mt-1 text-[11px] font-bold text-rose-400">
                      {error}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-white px-4 py-2.5 text-xs font-black text-gray-900 shadow-md transition-all duration-300 hover:bg-emerald-400 hover:text-white active:scale-95"
                >
                  Send
                </button>
              </form>
            </div>

            {/* App Store Buttons */}
            <div className="mb-6 flex gap-2">
              <a
                href="https://www.apple.com/app-store"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={AppStore}
                  alt="Download on the App Store"
                  className="h-10 w-auto"
                />
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={PlayStore}
                  alt="Get it on Google Play"
                  className="h-10 w-auto"
                />
              </a>
            </div>

            <p className="text-sm text-white">
              © Jevah App 2024. All rights reserved.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-emerald-400">Product</h3>
            <ul className="space-y-2.5">
              {[
                { to: "/#features", label: "Features" },
                { to: "/bible", label: "Jevah Bible" },
                { to: "/sermons", label: "Sermons" },
                { to: "/explore", label: "Latest" },
                { to: "/music", label: "Music" },
                { to: "/artists", label: "Gospel Artists" },
                { to: "/ebooks", label: "E-books" },
                { to: "/children", label: "Children's Zone" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 transition-all duration-200 hover:translate-x-1.5 hover:text-emerald-300"
                  >
                    <span className="text-[10px] opacity-0 transition-all duration-200 group-hover:opacity-100 text-emerald-400">
                      ›
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information Column */}
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-amber-400">Information</h3>
            <ul className="space-y-2.5">
              {[
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms & Conditions" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
                { to: "/#faq", label: "FAQ" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 transition-all duration-200 hover:translate-x-1.5 hover:text-amber-300"
                  >
                    <span className="text-[10px] opacity-0 transition-all duration-200 group-hover:opacity-100 text-amber-400">
                      ›
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Column */}
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-teal-400">Community</h3>
            <ul className="space-y-2.5">
              {[
                { to: "/blog", label: "Blog" },
                { to: "/forum", label: "Forum" },
                { to: "/events", label: "Events" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 transition-all duration-200 hover:translate-x-1.5 hover:text-teal-300"
                  >
                    <span className="text-[10px] opacity-0 transition-all duration-200 group-hover:opacity-100 text-teal-400">
                      ›
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-300 transition-all duration-200 hover:translate-x-1.5 hover:text-teal-300"
                >
                  <img src={Facebook} alt="Facebook" className="h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110" />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/Jevah_hq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-300 transition-all duration-200 hover:translate-x-1.5 hover:text-white"
                >
                  <svg className="h-4 w-4 fill-current text-white transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>X (Twitter)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/jevahhq/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-300 transition-all duration-200 hover:translate-x-1.5 hover:text-pink-300"
                >
                  <svg className="h-4 w-4 fill-current text-pink-400 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
