/* eslint-disable react-refresh/only-export-components */
import { Disclosure } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { faqs } from "./FAQ.data";

function FAQ() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      id="faq"
      className="jevah-section-muted py-20 px-8 transition-colors duration-300 lg:px-12"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          className={`mb-12 text-center text-4xl font-bold text-jevah-text md:text-5xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
        >
          Frequently Asked Questions (FAQ)
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Disclosure key={index}>
              {({ open }) => (
                <div
                  className={`overflow-hidden rounded-lg border border-jevah-border bg-jevah-surface transition-colors duration-300 ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <Disclosure.Button className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-jevah-card">
                    <span className="font-semibold text-jevah-text">
                      {faq.question}
                    </span>
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
                      style={{ backgroundColor: "var(--jevah-disclosure-icon-bg)" }}
                    >
                      <PlusIcon
                        className={`h-5 w-5 text-white transition-transform duration-200 ${
                          open ? "rotate-45" : ""
                        }`}
                      />
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 pb-4 text-jevah-text-muted">
                    {faq.answer}
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
