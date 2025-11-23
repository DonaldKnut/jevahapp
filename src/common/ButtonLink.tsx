export interface ButtonLinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
  target?: string;
  logo?: string;
  upperText?: string;
  lowerText?: string;
  style?: React.CSSProperties;
}

function ButtonLink({ href, children, className, target, style }: ButtonLinkProps) {
  return (
    <a
      href={href}
      children={children}
      className={className}
      target={target}
      style={style}
    ></a>
  );
}

export default ButtonLink;
