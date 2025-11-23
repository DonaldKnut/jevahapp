import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

function Privacy() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const sections = [
    {
      title: "Information We Collect",
      content: [
        "We collect information that you provide directly to us, including when you create an account, use our services, or contact us for support.",
        "This may include your name, email address, phone number, and any other information you choose to provide.",
        "We also automatically collect certain information about your device and how you interact with our app, such as your IP address, device type, and usage patterns.",
      ],
    },
    {
      title: "How We Use Your Information",
      content: [
        "We use the information we collect to provide, maintain, and improve our services.",
        "We may use your information to send you updates, newsletters, and other communications related to Jevah.",
        "We use your information to personalize your experience and to show you content that may be of interest to you.",
        "We may use aggregated and anonymized data for analytics and to improve our services.",
      ],
    },
    {
      title: "Information Sharing",
      content: [
        "We do not sell, trade, or rent your personal information to third parties.",
        "We may share your information with service providers who assist us in operating our app and conducting our business.",
        "We may disclose your information if required by law or to protect our rights and the safety of our users.",
        "In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.",
      ],
    },
    {
      title: "Data Security",
      content: [
        "We implement appropriate technical and organizational measures to protect your personal information.",
        "However, no method of transmission over the internet or electronic storage is 100% secure.",
        "While we strive to protect your information, we cannot guarantee absolute security.",
      ],
    },
    {
      title: "Your Rights",
      content: [
        "You have the right to access, update, or delete your personal information at any time.",
        "You can opt-out of receiving marketing communications from us.",
        "You may request a copy of your personal data in a portable format.",
        "You have the right to object to certain processing of your personal information.",
      ],
    },
    {
      title: "Children's Privacy",
      content: [
        "Our Children's Zone is designed with privacy in mind for young users.",
        "We do not knowingly collect personal information from children under 13 without parental consent.",
        "If you believe we have collected information from a child without consent, please contact us immediately.",
      ],
    },
    {
      title: "Changes to This Policy",
      content: [
        "We may update this Privacy Policy from time to time.",
        "We will notify you of any material changes by posting the new policy on this page.",
        "Your continued use of Jevah after changes become effective constitutes acceptance of those changes.",
      ],
    },
    {
      title: "Contact Us",
      content: [
        "If you have any questions about this Privacy Policy, please contact us at:",
        "Email: support@jevahapp.com",
        "Address: 24a Bashorun Okunsanya Street, Off Admiralty Way, Lekki Phase 1, Lagos.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 py-20 px-8 pt-[20vh] lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div
            className={`text-center ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h1
              className={`mb-6 text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.2s" }}
            >
              Privacy Policy
            </h1>
            <p
              className={`mx-auto mb-8 max-w-3xl text-lg text-gray-700 md:text-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.4s" }}
            >
              Your privacy is important to us. This policy explains how we
              collect, use, and protect your personal information when you use
              the Jevah app.
            </p>
            <p
              className={`text-sm text-gray-600 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.6s" }}
            >
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section ref={ref} className="bg-white py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div
                key={index}
                className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.content.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className="text-lg leading-relaxed"
                      style={{ color: "#090E24" }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20 px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className={`mb-6 text-4xl font-bold text-gray-900 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          >
            Questions About Privacy?
          </h2>
          <p
            className={`mb-8 text-lg text-gray-700 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            If you have any questions or concerns about our privacy practices,
            please don't hesitate to contact us.
          </p>
          <div
            className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.4s" }}
          >
            <a
              href="/contact"
              className="inline-block rounded-full px-8 py-4 text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: "#090E24" }}
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Privacy;

