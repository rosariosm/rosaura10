import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import HairField from "./HairField";

gsap.registerPlugin(ScrollTrigger);

const paintings = Object.entries(
  import.meta.glob("./paintings/*.jpg", { eager: true, import: "default", query: "?url" })
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src);

const STEP = 1.6;
const FADE = 0.9;

const Gallery = () => {
  const root = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".painting");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: `+=${sections.length * 130 + 80}%`,
          scrub: 1,
          pin: true,
        },
      });

      tl.fromTo(".field", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 0);

      sections.forEach((section, i) => {
        const at = i * STEP;
        const frame = section.querySelector(".frame");
        const art = section.querySelector(".art");

        tl.fromTo(frame, { autoAlpha: 0 }, { autoAlpha: 1, ease: "sine.inOut", duration: FADE }, at)
          .fromTo(art, { scale: 1.12 }, { scale: 1, ease: "none", duration: STEP + FADE }, at)
          .to(frame, { autoAlpha: 0, ease: "sine.inOut", duration: FADE }, at + STEP);
      });

      tl.fromTo(".outro", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, ">-0.1").to({}, {
        duration: 0.8,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="gallery" ref={root}>
      <HairField />
      {paintings.map((src) => (
        <div className="painting" key={src}>
          <div className="frame">
            <div className="art">
              <img src={src} alt="" />
            </div>
          </div>
        </div>
      ))}
      <p className="outro" lang="es">
        <span>
          no sé qué estoy haciendo de mi vida
          <br />
          (pero viene bien)
        </span>
      </p>
    </section>
  );
};

export default Gallery;
