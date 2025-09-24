import JevahLogo from "../components/JevahLogo";
import StoreLinks, { BtnTypes } from "../common/StoreLinks";
import Twitter from "../assets/logos/icons8-twitterx.svg";
import Facebook from "../assets/logos/icons8-facebook.svg";
import Linkedin from "../assets/logos/icons8-linkedin.svg";

function Footer() {
  return (
    <section className="bg-teal-800">
      <div className="text-cream-50 flex max-w-7xl flex-col px-8 py-12 lg:px-12 xl:m-auto">
        <div className="flex flex-col justify-between gap-12 md:flex-row md:gap-0">
          <div>
            <div className="mb-4">
              <JevahLogo width={120} height={60} />
            </div>
            <p>A Household Brand of Trust, Taste & Value</p>
          </div>
          <div className="flex gap-10">
            <div className="flex flex-col gap-2">
              <p className="text-orange-300">Services</p>
              <a href="#catering">Catering & Events</a>
              <a href="#fulcrums">Fulcrums</a>
              <a href="#properties">Properties</a>
              <a href="#about">About Us</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-orange-300">Business</p>
              <a href="#food">Food Industry</a>
              <a href="#fashion">Fashion Industry</a>
              <a href="#realestate">Real Estate</a>
              <a href="#investments">Investments</a>
              <a href="mailto:info@jinglesconglomerate.com">Support</a>
            </div>
          </div>
          <div className="w-fit">
            <h2 className="text-orange-300">Contact Jingles</h2>
            <div className="mt-4">
              <p className="text-cream-50 mb-2 text-sm">Get In Touch</p>
              <a
                href="mailto:info@jinglesconglomerate.com"
                className="text-orange-300 transition-colors duration-200 hover:text-orange-400"
              >
                info@jinglesconglomerate.com
              </a>
            </div>
            <div className="mt-4">
              <p className="text-cream-50 mb-2 text-sm">Call Us</p>
              <a
                href="tel:+1234567890"
                className="text-orange-300 transition-colors duration-200 hover:text-orange-400"
              >
                +1 (234) 567-890
              </a>
            </div>
          </div>
        </div>
        <div className="mt-14 flex justify-between border-t-2 border-t-teal-600 pt-10">
          <p className="w-[16ch] text-orange-300 md:w-full">
            &copy; 2024 Jingles Conglomerate. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="https://twitter.com" target="_blank">
              <img src={Twitter} alt="Twitter logo" />
            </a>
            <a href="https://www.facebook.com" target="_blank">
              <img src={Facebook} alt="Facebook logo" />
            </a>
            <a href="https://www.linkedin.com" target="_blank">
              <img src={Linkedin} alt="Linkedin logo" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Footer;
