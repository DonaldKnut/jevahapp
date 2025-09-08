import JevahHQ from "../assets/logos/jevah-hq-removebg-preview.png";

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
        src={JevahHQ}
        alt="JEVAH Logo"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  );
}

export default JevahLogo;
