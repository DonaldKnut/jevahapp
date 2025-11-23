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
      className="bg-gray-50 py-20 px-8 lg:px-12"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          className={`mb-12 text-center text-4xl font-bold text-gray-900 md:text-5xl ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
        >
          Frequently Asked Questions (FAQ)
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Disclosure key={index}>
              {({ open }) => (
                <div
                  className={`rounded-lg border border-gray-300 bg-white ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <Disclosure.Button className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                    <span className="font-semibold text-gray-900">
                      {faq.question}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200" style={{ backgroundColor: open ? '#090E24' : '#090E24' }}>
                      <PlusIcon
                        className={`h-5 w-5 transition-transform duration-200 ${
                          open ? "rotate-45" : ""
                        }`}
                        style={{ color: '#ffffff' }}
                      />
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 pb-4 text-gray-700">
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

