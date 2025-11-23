import JevahLogoImg from "../assets/logos/logo.png";

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
  return (
    <div className={`inline-block ${className}`}>
      <img
        src={JevahLogoImg}
        alt="JEVAH Logo"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  );
}

export default JevahLogo;
