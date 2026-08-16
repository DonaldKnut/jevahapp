import { useState } from "react";
import { Link } from "react-router-dom";
import ButtonLink from "../common/ButtonLink";
import JevahLogo from "../components/JevahLogo";
import { useFeedback } from "../components/admin/Feedback";
import Facebook from "../assets/logos/icons8-facebook.svg";
import AppStore from "../assets/logos/app_store.png";
import PlayStore from "../assets/logos/play_store.png";

function Footer() {
  const { toast } = useFeedback();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Subscribed!", "Thanks for joining the Jevah newsletter.");
    setEmail("");
  };

  return (
    <footer
      className="py-12 px-8 transition-colors duration-300 lg:px-12"
      style={{ backgroundColor: "var(--jevah-footer)" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Left Column - Logo, Download Button, App Store Buttons, Newsletter */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <Link to="/" className="inline-block transition-transform hover:opacity-90 active:scale-95">
                <JevahLogo width={112} height={52} />
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

            {/* Newsletter Subscription */}
            <div className="mb-6">
              <form onSubmit={handleSubmit} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Subscribe to newsletter"
                  required
                  className="w-full rounded-lg border border-gray-600 bg-transparent px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-white px-4 py-2 text-gray-900 transition-all duration-300 hover:bg-gray-100"
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
            <h3 className="mb-4 font-semibold text-white">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/#features"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/bible"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Jevah Bible
                </Link>
              </li>
              <li>
                <Link
                  to="/sermons"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sermons
                </Link>
              </li>
              <li>
                <Link
                  to="/music"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Music
                </Link>
              </li>
              <li>
                <Link
                  to="/ebooks"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  E-books
                </Link>
              </li>
              <li>
                <Link
                  to="/children"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Children's Zone
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Column */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Information</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/#faq"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Column */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/blog"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/forum"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Forum
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <img src={Facebook} alt="Facebook" className="w-5 h-5" />
                  Facebook
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
