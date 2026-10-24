import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

import pie1 from "./feet/pie1.json";

const feet = import.meta.glob("./feet/pie1*.png", { eager: true, import: "default", query: "?url" });
const dolphin = Object.entries(
  import.meta.glob("./delfin/line-*.png", { eager: true, import: "default", query: "?url" })
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src);

const CROP = { x: 40, y: 780, w: 500, h: 538 };
const LEG_PX = 72;
const HAIR_BOOST = 1.8;

const Leg = () => {
  const root = useRef();
  const k = LEG_PX / CROP.h;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const swings = gsap.utils.toArray(".leg-hair").map((el) => {
        const swing = gsap.utils.random(8, 18);
        return gsap.fromTo(
          el,
          { rotate: -swing },
          {
            rotate: swing,
            duration: gsap.utils.random(0.5, 1.1),
            delay: gsap.utils.random(0, 0.8),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          }
        );
      });
      const link = root.current.closest("a");
      const bristle = (on) => {
        gsap.to(root.current, { "--bristle": on ? 1 : 0, duration: on ? 0.25 : 0.6, ease: "power2.out" });
        swings.forEach((tween) => gsap.to(tween, { timeScale: on ? 4 : 1, duration: 0.3 }));
      };
      const on = () => bristle(true);
      const off = () => bristle(false);
      link.addEventListener("pointerenter", on);
      link.addEventListener("pointerleave", off);
      link.addEventListener("focus", on);
      link.addEventListener("blur", off);
      return () => {
        link.removeEventListener("pointerenter", on);
        link.removeEventListener("pointerleave", off);
        link.removeEventListener("focus", on);
        link.removeEventListener("blur", off);
      };
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <span className="leg" ref={root} style={{ width: CROP.w * k, height: LEG_PX }}>
      <img
        className="leg-base"
        src={feet["./feet/pie1.png"]}
        alt=""
        style={{ width: pie1.w * k, left: -CROP.x * k, top: -CROP.y * k }}
      />
      {pie1.hairs.map((hair) => {
        const s = k * HAIR_BOOST;
        return (
          <img
            key={hair.file}
            className="leg-hair"
            src={feet[`./feet/${hair.file}`]}
            alt=""
            style={{
              left: (hair.x + hair.bx - CROP.x) * k - hair.bx * s,
              top: (hair.y + hair.by - CROP.y) * k - hair.by * s,
              width: hair.w * s,
              height: hair.h * s,
              transformOrigin: `${hair.bx * s}px ${hair.by * s}px`,
            }}
          />
        );
      })}
    </span>
  );
};

const Dolphin = () => {
  const root = useRef();

  useLayoutEffect(() => {
    const frames = gsap.utils.toArray(root.current.querySelectorAll("img"));
    const show = (i) => frames.forEach((img, j) => (img.style.visibility = i === j ? "visible" : "hidden"));
    let frame = 0;
    let timer = 0;
    const link = root.current.closest("a");
    const on = () => {
      clearInterval(timer);
      timer = setInterval(() => show((frame = (frame + 1) % frames.length)), 90);
    };
    const off = () => {
      clearInterval(timer);
      show((frame = 0));
    };
    show(0);
    link.addEventListener("pointerenter", on);
    link.addEventListener("pointerleave", off);
    link.addEventListener("focus", on);
    link.addEventListener("blur", off);
    return () => {
      clearInterval(timer);
      link.removeEventListener("pointerenter", on);
      link.removeEventListener("pointerleave", off);
      link.removeEventListener("focus", on);
      link.removeEventListener("blur", off);
    };
  }, []);

  return (
    <span className="mini-dolphin" ref={root}>
      {dolphin.map((src) => (
        <img key={src} src={src} alt="" />
      ))}
    </span>
  );
};

const Underline = () => (
  <svg className="menu-underline" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
    <path d="M2 5 C 18 2, 30 7, 46 4 S 78 2, 98 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const ITEMS = [
  { key: "pelos", label: "pelos", Icon: Leg },
  { key: "delfin", label: "delfín", Icon: Dolphin },
];

const Menu = ({ page }) => (
  <nav className="menu" aria-label="secciones">
    {ITEMS.map(({ key, label, Icon }) => (
      <a key={key} href={`#${key}`} aria-label={label} aria-current={key === page ? "page" : undefined}>
        <Icon />
        <Underline />
      </a>
    ))}
  </nav>
);

export default Menu;
