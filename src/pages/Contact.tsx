import { useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

function Contact() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    "Catering & Event Planning",
    "Fulcrums (Fashion Equipment)",
    "Properties (Real Estate)",
    "General Inquiry",
    "Partnership Opportunity",
  ];

  const contactInfo = [
    {
      icon: "📧",
      title: "Email",
      details: "info@jinglesconglomerate.com",
      action: "mailto:info@jinglesconglomerate.com",
    },
    {
      icon: "📞",
      title: "Phone",
      details: "+1 (234) 567-890",
      action: "tel:+1234567890",
    },
    {
      icon: "📍",
      title: "Address",
      details: "123 Business District, City Center, State 12345",
      action: "https://maps.google.com",
    },
    {
      icon: "🕒",
      title: "Business Hours",
      details: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
      action: null,
    },
  ];

  const offices = [
    {
      city: "Main Office",
      address: "123 Business District, City Center",
      phone: "+1 (234) 567-890",
      email: "info@jinglesconglomerate.com",
      services: ["All Services", "Headquarters"],
    },
    {
      city: "Catering Branch",
      address: "456 Food Court, Culinary District",
      phone: "+1 (234) 567-891",
      email: "catering@jinglesconglomerate.com",
      services: ["Catering", "Event Planning"],
    },
    {
      city: "Fulcrums Showroom",
      address: "789 Fashion Avenue, Design Quarter",
      phone: "+1 (234) 567-892",
      email: "fulcrums@jinglesconglomerate.com",
      services: ["Sewing Machines", "Fashion Equipment"],
    },
    {
      city: "Properties Office",
      address: "321 Investment Plaza, Financial District",
      phone: "+1 (234) 567-893",
      email: "properties@jinglesconglomerate.com",
      services: ["Real Estate", "Investment"],
    },
  ];

  const faqs = [
    {
      question: "What services does Jingles Conglomerate offer?",
      answer:
        "We offer three main services: Jingles Catering & Event Planning for celebrations, Jingles Fulcrums for fashion industry equipment, and Jingles Properties for real estate investments.",
    },
    {
      question: "How can I get a quote for catering services?",
      answer:
        "You can contact our catering team directly at catering@jinglesconglomerate.com or call +1 (234) 567-891. We'll provide a free consultation and custom quote.",
    },
    {
      question: "Do you offer financing for real estate investments?",
      answer:
        "Yes, we provide flexible financing options and mortgage assistance for qualified investors. Our team will help you find the best financing solution for your needs.",
    },
    {
      question: "What is your warranty policy for sewing machines?",
      answer:
        "All our sewing machines come with comprehensive warranties ranging from 2-5 years depending on the model. We also offer extended warranty options.",
    },
    {
      question: "How do you verify properties for investment?",
      answer:
        "All properties undergo thorough verification including legal compliance checks, title verification, market analysis, and ROI projections before being offered to our clients.",
    },
    {
      question: "Do you provide installation services for equipment?",
      answer:
        "Yes, we offer professional installation and setup services for all equipment purchases, along with training programs for operators.",
    },
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert(
        "Thank you for your message! We'll get back to you within 24 hours.",
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-800 to-cyan-600 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-8 lg:px-12">
          <div className="text-center text-white">
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              Contact Jingles Conglomerate
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed">
              Ready to experience excellence? Get in touch with our team for
              personalized service and expert advice across all our business
              divisions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section ref={ref} className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div
              className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            >
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <h2 className="mb-6 text-3xl font-bold text-gray-800">
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-400 focus:outline-none"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-400 focus:outline-none"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-400 focus:outline-none"
                        placeholder="+1 (234) 567-890"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Service Interest *
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-400 focus:outline-none"
                      >
                        <option value="">Select a service</option>
                        {services.map((service, index) => (
                          <option key={index} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-400 focus:outline-none"
                      placeholder="Tell us about your needs and how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full rounded-xl py-4 font-bold text-white transition-all duration-300 ${
                      isSubmitting
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-indigo-400 hover:scale-105 hover:bg-indigo-300"
                    }`}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div
              className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="space-y-6">
                <div className="rounded-2xl bg-white p-8 shadow-lg">
                  <h3 className="mb-6 text-2xl font-bold text-gray-800">
                    Get In Touch
                  </h3>
                  <div className="space-y-4">
                    {contactInfo.map((info, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="text-2xl">{info.icon}</div>
                        <div>
                          <div className="font-bold text-gray-800">
                            {info.title}
                          </div>
                          {info.action ? (
                            <a
                              href={info.action}
                              className="text-indigo-400 transition-colors duration-200 hover:text-indigo-300"
                            >
                              {info.details}
                            </a>
                          ) : (
                            <div className="text-gray-600">{info.details}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-indigo-400 to-cyan-400 p-8 text-white">
                  <h3 className="mb-4 text-2xl font-bold">
                    Quick Response Guarantee
                  </h3>
                  <p className="mb-4">
                    We respond to all inquiries within 24 hours. For urgent
                    matters, please call us directly.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href="tel:+1234567890"
                      className="rounded-xl bg-white px-6 py-3 font-bold text-indigo-400 transition-all duration-300 hover:scale-105 hover:bg-gray-100"
                    >
                      Call Now
                    </a>
                    <a
                      href="mailto:info@jinglesconglomerate.com"
                      className="rounded-xl border-2 border-white px-6 py-3 font-bold text-white transition-all duration-300 hover:bg-white hover:text-indigo-400"
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

      {/* Office Locations */}
      <section className="bg-gray-100 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-800">
              Our Office Locations
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Visit us at any of our convenient locations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {offices.map((office, index) => (
              <div key={index} className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="mb-3 text-lg font-bold text-gray-800">
                  {office.city}
                </h3>
                <div className="mb-4 text-sm text-gray-600">
                  {office.address}
                </div>
                <div className="mb-2">
                  <a
                    href={`tel:${office.phone}`}
                    className="text-indigo-400 transition-colors duration-200 hover:text-indigo-300"
                  >
                    {office.phone}
                  </a>
                </div>
                <div className="mb-4">
                  <a
                    href={`mailto:${office.email}`}
                    className="text-indigo-400 transition-colors duration-200 hover:text-indigo-300"
                  >
                    {office.email}
                  </a>
                </div>
                <div className="text-sm text-gray-500">
                  {office.services.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-8 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-800">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Find answers to common questions about our services
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="mb-3 text-lg font-bold text-gray-800">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-400 to-cyan-400 py-20">
        <div className="mx-auto max-w-4xl px-8 text-center lg:px-12">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-xl text-white">
            Contact us today and let's discuss how Jingles Conglomerate can
            serve your needs
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="tel:+1234567890"
              className="rounded-xl bg-white px-8 py-4 font-bold text-indigo-400 transition-all duration-300 hover:scale-105 hover:bg-gray-100"
            >
              Call Now
            </a>
            <a
              href="mailto:info@jinglesconglomerate.com"
              className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-white hover:text-indigo-400"
            >
              Send Email
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;

