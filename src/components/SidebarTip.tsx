import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export default function SidebarTip({
  label,
  show,
  children,
}: {
  label: string;
  show: boolean;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  function place() {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const top = Math.min(
      Math.max(r.top + r.height / 2, 18),
      window.innerHeight - 18
    );
    setPos({ top, left: r.right + 10 });
  }

  function hide() {
    setPos(null);
  }

  useEffect(() => {
    if (!pos) return;
    const onScroll = () => setPos(null);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [pos]);

  if (!show) return <>{children}</>;

  return (
    <div
      ref={wrapRef}
      className="relative flex w-full justify-center"
      onMouseEnter={place}
      onMouseLeave={hide}
      onFocus={place}
      onBlur={hide}
    >
      {children}
      {pos
        ? createPortal(
            <span
              role="tooltip"
              className="pointer-events-none fixed z-[200] whitespace-nowrap rounded-lg bg-[#0b1a1f] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xl ring-1 ring-white/20"
              style={{
                top: pos.top,
                left: pos.left,
                transform: "translateY(-50%)",
              }}
            >
              {label}
              <span className="absolute right-full top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rotate-45 bg-[#0b1a1f] ring-1 ring-white/20" />
            </span>,
            document.body
          )
        : null}
    </div>
  );
}
