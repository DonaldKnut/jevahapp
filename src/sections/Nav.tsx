import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/16/solid";
import JevahLogo from "../components/JevahLogo";
import ButtonLink from "../common/ButtonLink";

function Nav() {
  const textLinkClasses =
    "text-cream-50 hover:text-orange-300 active:text-orange-400";

  const navLinks = [
    { href: "/music", children: "Music" },
    { href: "/sermons", children: "Sermons" },
    { href: "/community", children: "Community" },
    { href: "/marketplace", children: "Marketplace" },
    { href: "/support", children: "Support" },
  ];

  return (
    <Disclosure as="nav">
      {({ open }) => (
        <>
          <div className="flex h-[15vh] max-w-7xl items-center justify-between px-8 lg:px-12 xl:m-auto">
            <div className="flex">
              <ButtonLink
                href="#"
                children={<JevahLogo width={80} height={40} />}
              />
              <div className="ml-4 hidden items-center space-x-4 sm:ml-6 sm:flex lg:ml-8 lg:space-x-8">
                {navLinks.map((link, index) => (
                  <ButtonLink
                    key={index}
                    href={link.href}
                    children={link.children}
                    className={textLinkClasses}
                  />
                ))}
              </div>
            </div>
            <ButtonLink
              href="https://play.google.com"
              target="_blank"
              children={"Join JEVAH"}
              className="active:bg hidden rounded-xl bg-orange-400 px-5 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-orange-300 hover:shadow-lg active:bg-orange-500 sm:flex"
            />
            <Disclosure.Button className="text-cream-50 rounded-md p-2 hover:bg-teal-600 hover:text-white sm:hidden">
              {open ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </Disclosure.Button>
          </div>
          <Disclosure.Panel className="space-y-1 px-4 sm:hidden">
            {navLinks.map((link, index) => (
              <Disclosure.Button
                className="text-cream-50 block hover:text-orange-300"
                as="a"
                href={link.href}
                key={index}
              >
                {link.children}
              </Disclosure.Button>
            ))}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default Nav;
