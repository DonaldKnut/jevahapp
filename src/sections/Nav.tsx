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
            <div className="fixed inset-0 top-[15vh] z-30 bg-black/50 sm:hidden" />
          </Transition>
          <Transition
            show={open}
            enter="transition-transform duration-300 ease-out"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-300 ease-in"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Disclosure.Panel className="fixed inset-y-0 right-0 top-[15vh] z-40 w-80 bg-white/95 backdrop-blur-md px-8 pt-8 shadow-2xl sm:hidden">
              <div className="space-y-4">
                {navLinks.map((link, index) => (
                  <Disclosure.Button
                    key={index}
                    as={Link}
                    to={link.href}
                    className="block py-4 text-lg font-medium text-gray-900 transition-all duration-300 hover:text-[#FFA500] hover:translate-x-2"
                  >
                    {link.children}
                  </Disclosure.Button>
                ))}
                <Disclosure.Button
                  as={Link}
                  to="#download"
                  className="mt-6 block w-full rounded-full bg-jevah-green px-6 py-3 text-center text-white transition-all duration-300 hover:bg-jevah-green-hover hover:shadow-lg"
                >
                  Download App
                </Disclosure.Button>
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

export default Nav;
