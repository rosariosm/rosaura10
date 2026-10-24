import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const urls = import.meta.glob("./color/*.webp", { eager: true, import: "default", query: "?url" });

const PRODUCTS = [
  { name: "jugo", h: 593 },
  { name: "perrito", h: 334 },
  { name: "lata", h: 488 },
  { name: "barrita", h: 707 },
  { name: "helado", h: 353 },
  { name: "cereal", h: 602 },
  { name: "yerba", h: 421 },
];
const TALLEST = 707;
const BELT_TOP = 66;
const STRIPE = 46;
const ROLLER = 26;

let audio;
const beep = () => {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") audio.resume();
    if (audio.state !== "running") return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "square";
    osc.frequency.value = 2400;
    gain.gain.setValueAtTime(0.06, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.12);
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.12);
  } catch {
    audio = null;
  }
};

const Color = () => {
  const root = useRef();
  const track = useRef();
  const belt = useRef();
  const scanner = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray(".product", root.current);
      const sides = items.map(() => 1);
      const travel = () => track.current.scrollWidth + window.innerWidth;

      const scan = (el) => {
        beep();
        gsap.fromTo(el.firstChild, { y: 0, rotate: 0 }, { y: "-3vh", rotate: gsap.utils.random(-6, 6), duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 });
        gsap.fromTo(scanner.current, { "--flash": 1 }, { "--flash": 0, duration: 0.5, ease: "power2.out" });
      };

      const update = (x) => {
        belt.current.style.backgroundPositionX = `${x}px`;
        gsap.set(".roller", { rotate: (x / ROLLER) * 57.3 });
        const line = scanner.current.getBoundingClientRect();
        const center = line.left + line.width / 2;
        items.forEach((el, i) => {
          const r = el.getBoundingClientRect();
          const side = Math.sign(r.left + r.width / 2 - center) || 1;
          if (side !== sides[i]) {
            sides[i] = side;
            scan(el);
          }
        });
      };

      gsap.to(track.current, {
        x: () => -travel(),
        ease: "none",
        onUpdate() {
          update(gsap.getProperty(track.current, "x"));
        },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${travel() * 1.4}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="color" ref={root} aria-label="una cinta de supermercado con mis dibujos en color">
      <div className="checkout-scanner" ref={scanner} style={{ top: `${BELT_TOP - 12}vh` }} aria-hidden="true">
        <span className="checkout-window" />
      </div>
      <div className="checkout-track" ref={track} style={{ bottom: `${100 - BELT_TOP}vh` }}>
        {PRODUCTS.map(({ name, h }) => (
          <div key={name} className="product" style={{ height: `calc(${h / TALLEST} * var(--product))` }}>
            <img src={urls[`./color/${name}.webp`]} alt={name} />
          </div>
        ))}
      </div>
      <div className="checkout-belt" style={{ top: `${BELT_TOP}vh` }} aria-hidden="true">
        <span className="roller roller-left" />
        <div className="belt" ref={belt} style={{ backgroundSize: `${STRIPE}px 100%` }} />
        <span className="roller roller-right" />
      </div>
      <p className="color-note" lang="es">
        cinta provisoria: espera tu dibujo
      </p>
    </section>
  );
};

export default Color;
