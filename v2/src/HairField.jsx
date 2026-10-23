import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import pie1 from "./feet/pie1.json";
import pie2 from "./feet/pie2.json";

const urls = import.meta.glob("./feet/*-hair-*.png", { eager: true, import: "default", query: "?url" });

const sprites = [...pie1.hairs, ...pie2.hairs].filter((hair) => Math.max(hair.w, hair.h) >= 22);

const CELL = 85;
const SIZE = 1.4;
const FALLOFF = 380;

const frameRect = (vw, vh) => {
  const w = Math.min(vw * 0.88, (vh * 0.86) / 1.45);
  const h = w * 1.45;
  return { x0: (vw - w) / 2, y0: (vh - h) / 2, x1: (vw + w) / 2, y1: (vh + h) / 2 };
};

const layout = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const f = frameRect(vw, vh);
  const hairs = [];

  for (let cy = 0; cy < vh; cy += CELL) {
    for (let cx = 0; cx < vw; cx += CELL) {
      const x = cx + Math.random() * CELL;
      const y = cy + Math.random() * CELL;
      const dx = Math.max(f.x0 - x, 0, x - f.x1);
      const dy = Math.max(f.y0 - y, 0, y - f.y1);
      const d = Math.hypot(dx, dy);
      const t = Math.min(1, d / FALLOFF);
      if (d < 14 || Math.random() > 0.08 + 0.92 * t ** 1.6) continue;
      const scale = Math.min(1, 0.12 + t ** 0.8);
      const sprite = sprites[Math.floor(Math.random() * sprites.length)];
      hairs.push({ x, y, scale, sprite, tilt: gsap.utils.random(-70, 70) });
    }
  }

  return hairs;
};

const HairField = () => {
  const root = useRef();
  const [hairs, setHairs] = useState(layout);

  useLayoutEffect(() => {
    const onResize = () => setHairs(layout());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".field-hair").forEach((el, i) => {
        const swing = gsap.utils.random(15, 40);
        gsap.fromTo(
          el,
          { rotate: hairs[i].tilt - swing, scaleY: gsap.utils.random(0.7, 1) },
          {
            rotate: hairs[i].tilt + swing,
            scaleY: gsap.utils.random(1.1, 1.5),
            duration: gsap.utils.random(0.35, 1.1),
            delay: gsap.utils.random(0, 1),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, [hairs]);

  return (
    <div className="field" ref={root} aria-hidden="true">
      {hairs.map(({ x, y, scale, sprite }, i) => {
        const k = SIZE * scale;
        return (
          <img
            key={i}
            className="field-hair"
            src={urls[`./feet/${sprite.file}`]}
            alt=""
            style={{
              left: x - sprite.bx * k,
              top: y - sprite.by * k,
              width: sprite.w * k,
              height: sprite.h * k,
              transformOrigin: `${sprite.bx * k}px ${sprite.by * k}px`,
            }}
          />
        );
      })}
    </div>
  );
};

export default HairField;
