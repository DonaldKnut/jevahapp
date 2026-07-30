import AppStore from "../assets/logos/app-store.png";
import PlayStore from "../assets/logos/play-store.png";
import { BtnTypes } from "./StoreLinks.types";

interface StoreLinksProps {
  type: BtnTypes;
}

const badgeClass =
  "h-12 w-auto transition-transform duration-300 md:h-14 dark:rounded-xl dark:bg-white/95 dark:p-1 dark:shadow-md";

const badgeClassSm =
  "h-10 w-auto transition-transform duration-300 dark:rounded-lg dark:bg-white/95 dark:p-1 dark:shadow-md";

function StoreLinks({ type }: StoreLinksProps) {
  if (type === BtnTypes.Standard) {
    return (
      <div className="flex justify-center gap-4">
        <a
          href="https://www.apple.com/app-store"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform duration-300 hover:scale-105"
        >
          <img
            src={AppStore}
            alt="Download on the App Store"
            className={badgeClass}
          />
        </a>
        <a
          href="https://play.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform duration-300 hover:scale-105"
        >
          <img
            src={PlayStore}
            alt="Get it on Google Play"
            className={badgeClass}
          />
        </a>
      </div>
    );
  }
  if (type === BtnTypes.Variant) {
    return (
      <div className="flex flex-col gap-2">
        <a
          href="https://www.apple.com/app-store"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform duration-300 hover:scale-105"
        >
          <img
            src={AppStore}
            alt="Download on the App Store"
            className={badgeClassSm}
          />
        </a>
        <a
          href="https://play.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform duration-300 hover:scale-105"
        >
          <img
            src={PlayStore}
            alt="Get it on Google Play"
            className={badgeClassSm}
          />
        </a>
      </div>
    );
  }
}

export default StoreLinks;
