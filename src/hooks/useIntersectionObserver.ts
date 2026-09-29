import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverProps {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

function withZeroThreshold(threshold: number | number[]): number[] {
  const list = Array.isArray(threshold) ? threshold : [threshold];
  // Always observe ratio 0 so tall sections still fire on short mobile viewports.
  // (A lone 0.1 threshold can never be reached when sectionHeight >> viewportHeight.)
  return Array.from(new Set([0, ...list])).sort((a, b) => a - b);
}

/**
 * Reveal-on-scroll helper.
 * Guarantees a 0 threshold so content is not stuck at opacity-0 on narrow phones.
 */
export function useIntersectionObserver<T extends Element = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = "0px 0px -5% 0px",
  triggerOnce = true,
}: UseIntersectionObserverProps = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const hasIntersectedRef = useRef(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible =
          entry.isIntersecting || entry.intersectionRatio > 0;
        setIsIntersecting(visible);

        if (visible && !hasIntersectedRef.current) {
          hasIntersectedRef.current = true;
          setHasIntersected(true);
          if (triggerOnce) observer.unobserve(element);
        }
      },
      {
        threshold: withZeroThreshold(threshold),
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return {
    ref,
    isIntersecting: triggerOnce ? hasIntersected : isIntersecting,
  };
}
