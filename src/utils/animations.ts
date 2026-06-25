import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger if it's running in the browser
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const animateWateryReveal = (
  container: Element | string,
  elements: string | Element | NodeList | Element[],
  stagger: number = 0.1
) => {
  gsap.fromTo(
    elements,
    {
      y: 60,
      opacity: 0,
      filter: "blur(10px)",
    },
    {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration: 1.5,
      stagger: stagger,
      ease: "elastic.out(1, 0.8)", // Liquid-smooth elastic ease
      scrollTrigger: {
        trigger: container as any,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    }
  );
};

export const animateHeroReveal = (elements: string | Element | NodeList | Element[]) => {
  gsap.fromTo(
    elements,
    {
      y: 80,
      opacity: 0,
      filter: "blur(20px)",
    },
    {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration: 2,
      stagger: 0.15,
      ease: "power4.out",
    }
  );
};
