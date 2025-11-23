import { useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import ButtonLink from "../common/ButtonLink";

function ContactUs() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
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
    // Handle form submission here
    console.log("Form submitted:", formData);
    // Reset form
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
      className="bg-white py-20 px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Left Side - Contact Information */}
          <div
            className={`${isIntersecting ? "animate-fade-in-left" : "opacity-0"}`}
          >
            <h2 className="mb-6 text-4xl font-bold text-gray-900">
              Contact Us
            </h2>
            <p className="mb-6 text-lg text-gray-700">
              We're available 9 am - 11 pm WAT
            </p>
            <div className="mb-6">
              <ButtonLink
                href="https://wa.me/2347037742764"
                target="_blank"
                className="inline-block rounded-full border-2 border-orange-400 bg-white px-6 py-3 text-orange-400 transition-all duration-300 hover:bg-orange-50"
              >
                Let's chat on WhatsApp
              </ButtonLink>
            </div>
            <div className="mb-6">
              <p className="mb-2 text-lg text-gray-700">Wanna call instead?</p>
              <a
                href="tel:+2347037742764"
                className="flex items-center gap-2 text-lg text-gray-900 hover:text-orange-400"
              >
                <svg
                  className="h-6 w-6"
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
                +234 703 774 2764
              </a>
            </div>
            <p className="text-gray-600">
              Leave us a message and we'll get back to you within 48 hrs
            </p>
          </div>

          {/* Right Side - Contact Form */}
          <div
            className={`${isIntersecting ? "animate-fade-in-right" : "opacity-0"}`}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone number"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
                />
              </div>
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pb-8 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
                />
                <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                  {messageLength}/{maxLength}
                </div>
              </div>
              <div>
                <input
                  type="text"
                  id="useCase"
                  name="useCase"
                  value={formData.useCase}
                  onChange={handleChange}
                  placeholder="How Do You Intend to Use Jevah?"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full px-6 py-3 text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg"
                style={{ backgroundColor: '#090E24' }}
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
