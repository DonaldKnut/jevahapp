import JevahLogoLight from "../assets/logos/logo.png";
import { useTheme } from "../context/ThemeContext";

const JEVAH_LOGO_DARK =
  "https://res.cloudinary.com/dajpllbyu/image/upload/v1785405074/jevahh_app-removebg-preview_v6cpg3.png";

interface JevahLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

function JevahLogo({
  width = 120,
  height = 60,
  className = "",
}: JevahLogoProps) {
  const { resolved } = useTheme();
  const src = resolved === "dark" ? JEVAH_LOGO_DARK : JevahLogoLight;

  return (
    <div className={`inline-block ${className}`}>
      <img
        src={src}
        alt="JEVAH Logo"
        width={width}
        height={height}
        className="object-contain transition-opacity duration-300"
      />
    </div>
  );
}

export default JevahLogo;
