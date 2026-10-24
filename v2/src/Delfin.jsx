import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import suelo from "./delfin/suelo.json";

gsap.registerPlugin(ScrollTrigger);

const WORLD = 400;
const START = 20;
const END = 360;
const DIAMOND = 380;
const SURFACE = 34;
const DEPTH = 56;
const PEAK = 15;
const JUMP = [0.42, 0.6];
const STROKES_PER_SCREEN = 6;
const SWIM = 0.72;

const floorUrls = import.meta.glob("./delfin/suelo-*.png", { eager: true, import: "default", query: "?url" });

const TALLEST = Math.max(...suelo.map((piece) => piece.h));
const FLOOR_VH = 34;
const SPACES = [30, 55, 38, 70, 26, 48, 62];
const FLOOR = Array.from({ length: 30 }, (_, i) => {
  const piece = suelo[[2, 0, 1, 2, 1, 0][i % 6]];
  return { ...piece, src: floorUrls[`./delfin/${piece.file}`], flip: i % 6 >= 3, space: SPACES[i % SPACES.length] };
});

const swim = Object.entries(
  import.meta.glob("./delfin/line-*.png", { eager: true, import: "default", query: "?url" })
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src);

const Dolphin = ({ frames }) => (
  <div className="dolphin-frames">
    {swim.map((src, i) => (
      <img
        key={src}
        ref={(el) => (frames.current[i] = el)}
        src={src}
        alt=""
        style={{ visibility: i === 0 ? "visible" : "hidden" }}
      />
    ))}
  </div>
);

const Delfin = () => {
  const root = useRef();
  const world = useRef();
  const dolphin = useRef();
  const frames = useRef([]);
  const diamond = useRef();
  const diamondBox = useRef();
  const outro = useRef();
  const note = useRef();

  useLayoutEffect(() => {
    const state = { target: 0, progress: 0, facing: 1, flip: 1, travelled: 0, frame: 0 };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "+=1000%",
        pin: true,
        onUpdate: (self) => {
          state.target = self.progress;
          const facing = self.direction;
          if (facing !== state.facing) {
            state.facing = facing;
            gsap.to(state, { flip: facing, duration: 0.35, ease: "power2.inOut", overwrite: true });
          }
        },
      });

      gsap.to(diamond.current, { rotateY: 360, duration: 3, ease: "none", repeat: -1 });

      const vw = () => window.innerWidth / 100;
      const vh = () => window.innerHeight / 100;

      const clamp = gsap.utils.clamp(0, 1);

      const render = (time) => {
        const before = clamp(state.progress / SWIM);
        state.progress += (state.target - state.progress) * 0.12;
        const p = clamp(state.progress / SWIM);
        const o = clamp((state.progress - SWIM) / (1 - SWIM));
        state.travelled += Math.abs(p - before) * (END - START);

        const x = START + (END - START) * p;
        const camera = gsap.utils.clamp(0, WORLD - 100, x - 50);

        const [j0, j1] = JUMP;
        const t = gsap.utils.clamp(0, 1, (p - j0) / (j1 - j0));
        const jumping = t > 0 && t < 1;
        const bob = jumping ? 0 : Math.sin(time * 2.2) * 1.2;
        const y = DEPTH - (DEPTH - PEAK) * Math.sin(Math.PI * t) + bob;

        const dxPx = ((END - START) * (j1 - j0)) * vw();
        const dyPx = -(DEPTH - PEAK) * Math.PI * Math.cos(Math.PI * t) * vh();
        const angle = jumping ? (Math.atan2(dyPx, dxPx) * 180) / Math.PI : Math.cos(time * 2.2) * 4;

        const frame = Math.floor(state.travelled / (100 / STROKES_PER_SCREEN / swim.length)) % swim.length;

        gsap.set(world.current, { x: -camera * vw() });
        gsap.set(dolphin.current, {
          xPercent: -50,
          yPercent: -50,
          x: (x - camera) * vw(),
          y: y * vh(),
          rotate: angle,
          scaleX: state.flip,
        });
        if (frame !== state.frame) {
          frames.current[state.frame].style.visibility = "hidden";
          frames.current[frame].style.visibility = "visible";
          state.frame = frame;
        }

        const near = clamp(1 - Math.abs(DIAMOND - x) / 60);
        const zoom = clamp(o / 0.6);
        const travel = gsap.parseEase("power2.inOut")(zoom);
        const grow = zoom ** 3;
        const fade = 1 - clamp(o / 0.35);
        const reveal = gsap.parseEase("power2.out")(clamp((o - 0.55) / 0.3));

        gsap.set(diamondBox.current, {
          xPercent: -50,
          yPercent: -50,
          x: gsap.utils.interpolate((DIAMOND - camera) * vw(), 50 * vw(), travel),
          y: gsap.utils.interpolate((DEPTH - 2) * vh(), 50 * vh(), travel),
          scale: 1 + grow * 40,
          opacity: 1 - clamp((o - 0.45) / 0.2),
        });
        gsap.set(diamond.current, { "--glow": Math.max(near, zoom) });
        gsap.set([world.current, dolphin.current, note.current], { opacity: fade });
        gsap.set(outro.current, { opacity: reveal, "--reveal": reveal });
      };

      gsap.ticker.add(render);
      return () => gsap.ticker.remove(render);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="delfin" ref={root} aria-label="un delfín que nada mientras scrolleás">
      <div className="delfin-world" ref={world} style={{ width: `${WORLD}vw` }}>
        <div className="delfin-floor" aria-hidden="true">
          {FLOOR.map(({ src, h, flip, space }, i) => (
            <img
              key={i}
              src={src}
              alt=""
              style={{
                height: `${(h / TALLEST) * FLOOR_VH}vh`,
                marginRight: `${space}vh`,
                transform: flip ? "scaleX(-1)" : undefined,
              }}
            />
          ))}
        </div>
        <svg
          className="delfin-surface"
          viewBox={`0 0 ${WORLD} 4`}
          preserveAspectRatio="none"
          style={{ top: `${SURFACE}vh` }}
          aria-hidden="true"
        >
          <path
            d={`M0 2 ${Array.from({ length: WORLD / 4 }, (_, i) => `q1 ${i % 2 ? 1.5 : -1.5} 2 0 t2 0`).join(" ")}`}
            stroke="#e9e6e1"
            strokeWidth="0.25"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="delfin-diamond" ref={diamondBox}>
        <svg ref={diamond} viewBox="0 0 60 80" aria-hidden="true">
          <path d="M30 2 L58 30 L30 78 L2 30 Z" fill="none" stroke="#e9e6e1" strokeWidth="3" />
          <path d="M2 30 L58 30 M30 2 L18 30 L30 78 L42 30 Z" fill="none" stroke="#e9e6e1" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="dolphin" ref={dolphin}>
        <Dolphin frames={frames} />
      </div>
      <div className="delfin-outro" ref={outro}>
        <img className="delfin-outro-left" src={floorUrls["./delfin/suelo-3.png"]} alt="" />
        <p lang="es">pasé mucho tiempo jugando a los jueguitos y teniendo vergüenza al pedo</p>
        <img className="delfin-outro-right" src={floorUrls["./delfin/suelo-1.png"]} alt="" />
      </div>
      <p className="delfin-note" ref={note} lang="es">
        diamante provisorio: espera tu dibujo
      </p>
    </section>
  );
};

export default Delfin;
