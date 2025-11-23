import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

function Terms() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const sections = [
    {
      title: "Acceptance of Terms",
      content: [
        "By accessing and using the Jevah app, you accept and agree to be bound by these Terms and Conditions.",
        "If you do not agree to these terms, please do not use our services.",
        "We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of any changes.",
      ],
    },
    {
      title: "Use of Service",
      content: [
        "Jevah is provided for personal, non-commercial use to strengthen your faith and connect with the Christian community.",
        "You agree to use the service in accordance with all applicable laws and regulations.",
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "You agree not to use the service for any unlawful purpose or to transmit any harmful content.",
      ],
    },
    {
      title: "User Content",
      content: [
        "You retain ownership of any content you post, share, or upload to Jevah.",
        "By posting content, you grant us a license to use, display, and distribute that content within the app.",
        "You are solely responsible for the content you post and must ensure it does not violate any rights of others.",
        "We reserve the right to remove any content that violates these terms or is deemed inappropriate.",
      ],
    },
    {
      title: "Intellectual Property",
      content: [
        "All content, features, and functionality of Jevah are owned by us and are protected by copyright, trademark, and other intellectual property laws.",
        "You may not reproduce, distribute, or create derivative works from our content without express written permission.",
        "The Jevah name, logo, and branding are trademarks of Jevah App.",
      ],
    },
    {
      title: "Prohibited Activities",
      content: [
        "You may not attempt to gain unauthorized access to any part of the service.",
        "You may not use automated systems to access the service without permission.",
        "You may not interfere with or disrupt the service or servers connected to the service.",
        "You may not use the service to harass, abuse, or harm other users.",
        "You may not post content that is defamatory, obscene, or violates the rights of others.",
      ],
    },
    {
      title: "Disclaimer of Warranties",
      content: [
        "Jevah is provided 'as is' without warranties of any kind, either express or implied.",
        "We do not guarantee that the service will be uninterrupted, secure, or error-free.",
        "We are not responsible for the accuracy, completeness, or usefulness of any content provided by users.",
      ],
    },
    {
      title: "Limitation of Liability",
      content: [
        "To the fullest extent permitted by law, Jevah shall not be liable for any indirect, incidental, or consequential damages.",
        "Our total liability for any claims arising from your use of the service shall not exceed the amount you paid us in the past 12 months.",
      ],
    },
    {
      title: "Termination",
      content: [
        "We reserve the right to terminate or suspend your account at any time for violation of these terms.",
        "You may terminate your account at any time by contacting us or using the account deletion feature in the app.",
        "Upon termination, your right to use the service will immediately cease.",
      ],
    },
    {
      title: "Governing Law",
      content: [
        "These Terms and Conditions shall be governed by and construed in accordance with applicable laws.",
        "Any disputes arising from these terms shall be resolved through appropriate legal channels.",
      ],
    },
    {
      title: "Contact Information",
      content: [
        "If you have any questions about these Terms and Conditions, please contact us at:",
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
              Terms & Conditions
            </h1>
            <p
              className={`mx-auto mb-8 max-w-3xl text-lg text-gray-700 md:text-xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.4s" }}
            >
              Please read these terms carefully before using the Jevah app. By
              using our service, you agree to be bound by these terms.
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
            Questions About Our Terms?
          </h2>
          <p
            className={`mb-8 text-lg text-gray-700 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            If you have any questions about these Terms and Conditions, please
            contact our legal team.
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

export default Terms;

