import Carousel from "../common/Carousel";
import StoreLinks, { BtnTypes } from "../common/StoreLinks";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

function Reviews() {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const slides = [
    {
      src: "https://images.unsplash.com/photo-1595986630530-969786b19b4d?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      text: '"JEVAH has transformed my spiritual journey! The gospel music, sermons, and prayer community have brought me closer to God and connected me with believers worldwide."',
      name: "Sarah Johnson",
      country: "Nigeria",
    },
    {
      src: "https://images.unsplash.com/photo-1554196038-950a8ab51827?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      text: '"As a pastor, JEVAH has been instrumental in reaching my congregation. The live streaming features and devotional content help us stay connected even when we can\'t meet in person."',
      name: "Pastor Michael",
      country: "Kenya",
    },
    {
      src: "https://images.unsplash.com/photo-1622556498246-755f44ca76f3?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      text: "\"My children love the educational games on JEVAH! It's amazing how they're learning about faith while having fun. The marketplace also helps me find quality Christian resources.\"",
      name: "Grace Williams",
      country: "Ghana",
    },
  ];
  return (
    <section
      ref={ref}
      id="reviews"
      className="flex max-w-7xl flex-col items-center justify-between px-8 py-20 lg:m-auto lg:flex-row lg:px-12"
    >
      <article
        className={`mb-10 flex flex-col items-center justify-center lg:w-1/2 lg:items-start ${isIntersecting ? "animate-fade-in-left" : "opacity-0"}`}
      >
        <h2
          className={`text-cream-50 mb-4 max-w-[16ch] text-center text-4xl font-semibold lg:w-full lg:text-left ${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.2s" }}
        >
          Join thousands growing in faith with JEVAH
        </h2>
        <div
          className={`${isIntersecting ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.4s" }}
        >
          <StoreLinks type={BtnTypes.Standard} />
        </div>
      </article>
      <div
        className={`${isIntersecting ? "animate-fade-in-right" : "opacity-0"}`}
      >
        <Carousel slides={slides} />
      </div>
    </section>
  );
}

export default Reviews;
