import { useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import JevahLogo from "../components/JevahLogo";

function Support() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create mailto link with form data
    const mailtoLink = `mailto:support@jevahapp.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`,
    )}`;
    window.location.href = mailtoLink;
  };

  const faqs = [
    {
      question: "How do I download the JEVAH app?",
      answer:
        "You can download JEVAH from the Google Play Store or Apple App Store. Simply search for 'JEVAH' and click install.",
    },
    {
      question: "Is JEVAH free to use?",
      answer:
        "Yes! JEVAH offers a free tier with access to basic features. Premium features are available with optional subscriptions.",
    },
    {
      question: "How do I create an account?",
      answer:
        "Open the JEVAH app and tap 'Sign Up'. You can create an account using your email address or social media accounts.",
    },
    {
      question: "Can I access JEVAH offline?",
      answer:
        "Yes! You can download music, sermons, and e-books for offline access. Look for the download icon next to content.",
    },
    {
      question: "How do I join community groups?",
      answer:
        "Navigate to the Community section and browse available groups. You can join groups based on your interests and location.",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Absolutely! We use industry-standard encryption to protect your data and never share your personal information with third parties.",
    },
  ];

  const contactMethods = [
    {
      icon: "📧",
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@jevahapp.com",
      action: "Send Email",
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      contact: "Available 24/7",
      action: "Start Chat",
    },
    {
      icon: "📞",
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "+1 (555) 123-4567",
      action: "Call Now",
    },
    {
      icon: "📚",
      title: "Help Center",
      description: "Browse our comprehensive help articles",
      contact: "Self-service",
      action: "Visit Help Center",
    },
  ];

  const supportTopics = [
    {
      title: "Account & Login",
      description:
        "Help with account creation, login issues, and password recovery",
      icon: "👤",
    },
    {
      title: "App Features",
      description:
        "Learn how to use music streaming, sermons, and community features",
      icon: "📱",
    },
    {
      title: "Payment & Billing",
      description: "Questions about subscriptions, payments, and billing",
      icon: "💳",
    },
    {
      title: "Technical Issues",
      description: "Troubleshoot app crashes, performance issues, and bugs",
      icon: "🔧",
    },
    {
      title: "Content & Media",
      description: "Help with downloading, streaming, and accessing content",
      icon: "🎵",
    },
    {
      title: "Community & Groups",
      description: "Support for prayer walls, forums, and group features",
      icon: "👥",
    },
  ];

  return (
    <div className="min-h-screen bg-teal-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 py-16">
        <div className="mx-auto max-w-7xl px-8 text-center lg:px-12">
          <JevahLogo width={120} height={60} className="mx-auto mb-8" />
          <h1 className="text-cream-50 mb-6 text-5xl font-bold md:text-6xl">
            Support Center
          </h1>
          <p className="text-cream-50 mx-auto mb-8 max-w-3xl text-xl leading-relaxed">
            We're here to help! Get support for your JEVAH experience through
            multiple channels. Our team is committed to helping you grow in
            faith.
          </p>
        </div>
      </div>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              Get in Touch
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Choose your preferred way to contact our support team
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
              >
                <div className="mb-4 text-5xl">{method.icon}</div>
                <h3 className="text-cream-50 mb-3 text-xl font-bold">
                  {method.title}
                </h3>
                <p className="text-cream-50/80 mb-4 leading-relaxed">
                  {method.description}
                </p>
                <p className="mb-4 font-semibold text-orange-300">
                  {method.contact}
                </p>
                <a
                  href={
                    method.title === "Email Support"
                      ? "mailto:support@jevahapp.com"
                      : "#"
                  }
                  className="rounded-lg bg-orange-400 px-6 py-3 font-bold text-white transition-colors duration-200 hover:bg-orange-300"
                >
                  {method.action}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section ref={ref} className="bg-teal-700 py-20">
        <div className="mx-auto max-w-4xl px-8 lg:px-12">
          <div
            className={`mb-16 text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              Send Us a Message
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Fill out the form below and we'll get back to you as soon as
              possible
            </p>
          </div>

          <div
            className={`rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="text-cream-50 mb-2 block font-semibold"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="text-cream-50 placeholder-cream-50/60 w-full rounded-lg border border-white/30 bg-white/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="text-cream-50 mb-2 block font-semibold"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="text-cream-50 placeholder-cream-50/60 w-full rounded-lg border border-white/30 bg-white/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="text-cream-50 mb-2 block font-semibold"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="text-cream-50 w-full rounded-lg border border-white/30 bg-white/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Select a topic</option>
                  <option value="Account Support">Account Support</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Payment Question">Payment Question</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="text-cream-50 mb-2 block font-semibold"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="text-cream-50 placeholder-cream-50/60 w-full rounded-lg border border-white/30 bg-white/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Describe your question or issue in detail..."
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="rounded-xl bg-orange-400 px-8 py-4 font-bold text-white transition-colors duration-200 hover:scale-105 hover:bg-orange-300"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              Frequently Asked Questions
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Find quick answers to common questions about JEVAH
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
              >
                <h3 className="text-cream-50 mb-3 text-xl font-bold">
                  {faq.question}
                </h3>
                <p className="text-cream-50/80 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Topics */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-cream-50 mb-6 text-4xl font-bold">
              Support Topics
            </h2>
            <p className="text-cream-50 mx-auto max-w-3xl text-xl">
              Browse help articles organized by topic
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {supportTopics.map((topic, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
              >
                <div className="mb-4 text-4xl">{topic.icon}</div>
                <h3 className="text-cream-50 mb-3 text-xl font-bold">
                  {topic.title}
                </h3>
                <p className="text-cream-50/80 leading-relaxed">
                  {topic.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-8 text-center lg:px-12">
          <div className="rounded-3xl bg-gradient-to-r from-orange-400 to-orange-300 p-12">
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              Still Need Help?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-white">
              Our support team is here to help you get the most out of JEVAH
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="mailto:support@jevahapp.com"
                className="rounded-xl bg-white px-8 py-4 font-bold text-orange-400 transition-colors duration-200 hover:scale-105 hover:bg-gray-100"
              >
                Email Support
              </a>
              <a
                href="https://play.google.com"
                className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-white hover:text-orange-400"
              >
                Download App
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Support;
