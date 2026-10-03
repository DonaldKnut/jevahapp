import { useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useFeedback } from "../components/admin/Feedback";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

function Contact() {
  useDocumentMeta({
    title: "Contact Jevah — Tevadice Limited",
    description:
      "Customer service for Jevah: support@jevahapp.com and +234 703 774 2764. Registered office of Tevadice Limited in Ogba, Lagos, Nigeria.",
    canonicalPath: "/contact",
  });
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const { toast } = useFeedback();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mapsSearch = (address: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const registeredAddress =
    "1B Ondo Street, Okeira, Ogba, Lagos, Nigeria";
  const secondaryAddress =
    "23A, Bashorun Okusanya Street, Off Admiralty Road, Off Admiralty Way, Lekki Phase 1, Lagos, Nigeria";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        "Thank you for your message!",
        "We'll get back to you within 24 hours."
      );
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 px-4 py-16 pt-24 xs:px-6 sm:px-8 sm:py-20 sm:pt-[20vh] lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div
            className={`text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h1
              className={`mb-4 text-[1.7rem] font-bold leading-tight text-gray-900 xs:mb-6 xs:text-4xl md:text-6xl lg:text-7xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.2s" }}
            >
              Get In Touch
            </h1>
            <p
              className={`mx-auto mb-8 max-w-3xl text-lg text-gray-700 md:text-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.4s" }}
            >
              Have a question or need support? This is the customer service
              contact for Jevah, the platform operated by Tevadice Limited.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section ref={ref} className="bg-white py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Contact Form */}
            <div
              className={`${isIntersecting ? "animate-fade-in-left" : "opacity-0"}`}
            >
              <div className="rounded-2xl bg-gray-50 p-8">
                <h2 className="mb-6 text-3xl font-bold text-gray-900">
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-[#256E63] focus:outline-none focus:ring-2 focus:ring-[#256E63]/20"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-[#256E63] focus:outline-none focus:ring-2 focus:ring-[#256E63]/20"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-[#256E63] focus:outline-none focus:ring-2 focus:ring-[#256E63]/20"
                      placeholder="Tell us how we can help..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full rounded-full px-6 py-3 font-semibold text-white transition-all duration-300 ${
                      isSubmitting
                        ? "cursor-not-allowed opacity-50"
                        : "hover:opacity-90 hover:shadow-lg"
                    }`}
                    style={{ backgroundColor: "#090E24" }}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div
              className={`${isIntersecting ? "animate-fade-in-right" : "opacity-0"}`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="space-y-6">
                <div className="rounded-2xl bg-gray-50 p-8">
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    Customer Support
                  </h3>
                  <p className="mb-6 text-sm text-gray-600">
                    Customer service contact for Jevah.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl" aria-hidden="true">
                        📞
                      </div>
                      <div>
                        <div className="mb-1 font-semibold text-gray-900">
                          Phone
                        </div>
                        <a
                          href="tel:+2347037742764"
                          className="text-[#256E63] transition-colors duration-200 hover:text-[#1e5a52]"
                        >
                          +234 703 774 2764
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="text-3xl" aria-hidden="true">
                        📧
                      </div>
                      <div>
                        <div className="mb-1 font-semibold text-gray-900">
                          Email
                        </div>
                        <a
                          href="mailto:support@jevahapp.com"
                          className="text-[#256E63] transition-colors duration-200 hover:text-[#1e5a52]"
                        >
                          support@jevahapp.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-8 text-white"
                  style={{ backgroundColor: "#090E24" }}
                >
                  <h3 className="mb-4 text-2xl font-bold">
                    Quick Response Guarantee
                  </h3>
                  <p className="mb-6 text-gray-200">
                    We respond to all inquiries within 24 hours. For urgent
                    matters, please call us directly.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href="tel:+2347037742764"
                      className="rounded-full bg-white px-6 py-3 text-center font-semibold text-[#090E24] transition-all duration-300 hover:bg-gray-100 hover:shadow-lg"
                    >
                      Call Now
                    </a>
                    <a
                      href="mailto:support@jevahapp.com"
                      className="rounded-full border-2 border-white px-6 py-3 text-center font-semibold text-white transition-all duration-300 hover:bg-white hover:text-[#090E24]"
                    >
                      Email Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 xs:px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Our Offices
          </h2>
          <p className="mt-3 max-w-2xl text-gray-600">
            Tevadice Limited operates Jevah from the offices below. The
            registered office is the company’s registered address. The secondary
            office is a separate location.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#256E63]">
                Registered office
              </p>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Tevadice Limited
              </h3>
              <address className="mt-3 text-base not-italic leading-relaxed text-gray-700">
                1B Ondo Street, Okeira, Ogba, Lagos, Nigeria
              </address>
              <a
                href={mapsSearch(registeredAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-semibold text-[#256E63] hover:underline"
              >
                Search this address on Google Maps
              </a>
            </article>
            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Secondary office
              </p>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Tevadice Limited
              </h3>
              <address className="mt-3 text-base not-italic leading-relaxed text-gray-700">
                23A, Bashorun Okusanya Street,
                <br />
                Off Admiralty Road, Off Admiralty Way,
                <br />
                Lekki Phase 1, Lagos, Nigeria
              </address>
              <p className="mt-3 text-sm text-gray-500">
                This is not the registered address.
              </p>
              <a
                href={mapsSearch(secondaryAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-semibold text-[#256E63] hover:underline"
              >
                Search this address on Google Maps
              </a>
            </article>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Each map link opens a Google Maps search for the written address.
            It is not an embedded or independently verified pin.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2
            className={`mb-12 text-center text-4xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                question: "How do I download the Jevah app?",
                answer:
                  "You can download Jevah from the App Store or Google Play Store. Simply search for 'Jevah' and tap the download button.",
              },
              {
                question: "Is Jevah free to use?",
                answer:
                  "Yes, Jevah is free to download and use. Some premium features may be available through in-app purchases.",
              },
              {
                question: "How do I create an account?",
                answer:
                  "After downloading the app, open it and tap 'Sign Up' to create your account. You can use your email address or social media accounts.",
              },
              {
                question: "Can I use Jevah offline?",
                answer:
                  "Some features like downloaded content can be accessed offline, but most features require an internet connection.",
              },
              {
                question: "How do I report a problem?",
                answer:
                  "You can report problems through the app's settings menu or by contacting us directly through this contact form.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className={`rounded-lg bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
