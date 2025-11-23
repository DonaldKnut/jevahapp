import { Disclosure, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/16/solid";
import { Link } from "react-router-dom";
import JevahLogo from "../components/JevahLogo";
import ButtonLink from "../common/ButtonLink";
import { useScroll } from "../hooks/useScroll";

function Nav() {
  const isScrolled = useScroll(100);
  
  const textLinkClasses =
    "text-gray-900 hover:text-[#FFA500] active:text-[#FFA500] font-medium transition-colors";

  const navLinks = [
    { href: "/", children: "Home" },
    { href: "#features", children: "Features" },
    { href: "/about", children: "About Us" },
    { href: "/contact", children: "Contact" },
  ];

  return (
    <Disclosure as="nav">
      {({ open }) => (
        <>
          <div
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
              isScrolled
                ? "bg-white/80 backdrop-blur-md shadow-lg"
                : "bg-gradient-to-br from-blue-100 via-teal-50 to-green-100"
            }`}
          >
            <div className="relative flex h-[15vh] max-w-7xl items-center justify-between px-8 lg:px-12 xl:mx-auto">
            {/* Logo - Left */}
            <Link to="/" className="z-10">
              <JevahLogo width={128} height={64} />
            </Link>

            {/* Menu Items - Center */}
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center space-x-4 sm:flex lg:space-x-8">
              {navLinks.map((link, index) => (
                <Link key={index} to={link.href} className={textLinkClasses}>
                  {link.children}
                </Link>
              ))}
            </div>

            {/* CTA Button - Right */}
            <div className="z-10 flex items-center gap-4">
              <ButtonLink
                href="#download"
                children={"Download App"}
                className="hidden rounded-full bg-jevah-green px-5 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-jevah-green-hover hover:shadow-lg active:bg-jevah-green-hover sm:flex"
              />
              <Disclosure.Button className="text-gray-900 rounded-md p-2 hover:bg-white/50 hover:text-gray-900 sm:hidden">
                {open ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </Disclosure.Button>
            </div>
            </div>
          </div>
          <Transition
            show={open}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm sm:hidden" />
          </Transition>
          <Transition
            show={open}
            enter="transition-transform duration-500 ease-out"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-300 ease-in"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Disclosure.Panel className="fixed inset-y-0 right-0 z-[70] w-80 bg-white shadow-2xl sm:hidden">
              {/* Header with Logo and Close Button */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 px-6 py-6">
                <Disclosure.Button 
                  as={Link} 
                  to="/" 
                  className="flex items-center opacity-0 transition-all duration-500"
                  style={{ 
                    animation: open ? 'slideInFromRight 0.5s ease-out 0.15s forwards' : 'none'
                  }}
                >
                  <JevahLogo width={100} height={50} />
                </Disclosure.Button>
                <Disclosure.Button 
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-900 transition-all duration-300 hover:bg-white hover:scale-110 opacity-0"
                  style={{ 
                    animation: open ? 'slideInFromRight 0.5s ease-out 0.15s forwards' : 'none'
                  }}
                >
                  <XMarkIcon className="h-6 w-6" />
                </Disclosure.Button>
              </div>

              {/* Menu Items */}
              <div className="flex h-[calc(100vh-15vh-80px)] flex-col justify-between px-6 py-8">
                <div className="space-y-2">
                  {navLinks.map((link, index) => (
                    <Disclosure.Button
                      key={index}
                      as={Link}
                      to={link.href}
                      className="block rounded-lg px-4 py-4 text-left text-lg font-medium text-gray-900 transition-all duration-300 hover:bg-gray-50 hover:text-[#FFA500] hover:translate-x-2 opacity-0"
                      style={{ 
                        animation: open ? `slideInFromRight 0.5s ease-out ${0.3 + index * 0.1}s forwards` : 'none'
                      }}
                    >
                      {link.children}
                    </Disclosure.Button>
                  ))}
                </div>

                {/* Download App Button */}
                <div className="mt-auto pt-6">
                  <Disclosure.Button
                    as={Link}
                    to="#download"
                    className="block w-full rounded-full bg-jevah-green px-6 py-4 text-center text-lg font-semibold text-white transition-all duration-300 hover:bg-jevah-green-hover hover:shadow-lg hover:scale-105 opacity-0"
                    style={{ 
                      animation: open ? 'slideInFromRight 0.5s ease-out 0.7s forwards' : 'none'
                    }}
                  >
                    Download App
                  </Disclosure.Button>
                </div>
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

export default Nav;
