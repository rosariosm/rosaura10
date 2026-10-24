import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WORLD = 400;
const START = 20;
const END = 360;
const DIAMOND = 380;
const SURFACE = 34;
const DEPTH = 62;
const PEAK = 15;
const JUMP = [0.42, 0.6];
const FRAMES = 4;
const STROKES_PER_SCREEN = 6;
const TAIL = [-18, -6, 14, -6];

const ROCKS = Array.from({ length: 14 }, (_, i) => ({
  x: i * 30 + ((i * 37) % 17),
  w: 18 + ((i * 53) % 22),
  h: 8 + ((i * 29) % 14),
}));

const WEEDS = Array.from({ length: 22 }, (_, i) => ({
  x: i * 18 + ((i * 41) % 11),
  h: 10 + ((i * 23) % 18),
}));

const Dolphin = ({ frame }) => (
  <svg className="dolphin-svg" viewBox="0 0 200 80" aria-hidden="true">
    <path
      d="M190 40 C175 30 150 24 120 24 L112 8 L100 25 C70 27 45 33 28 40 C45 47 70 53 110 54 C140 55 170 50 190 40 Z"
      fill="#e9e6e1"
    />
    <path d="M120 52 L112 66 L104 53 Z" fill="#e9e6e1" />
    <g ref={frame} className="dolphin-tail">
      <path d="M32 40 L6 22 L14 40 L6 58 Z" fill="#e9e6e1" />
    </g>
    <circle cx="170" cy="36" r="2.5" fill="#000" />
  </svg>
);

const Delfin = () => {
  const root = useRef();
  const world = useRef();
  const dolphin = useRef();
  const tail = useRef();
  const diamond = useRef();

  useLayoutEffect(() => {
    const state = { target: 0, progress: 0, facing: 1, flip: 1, travelled: 0, frame: 0 };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "+=700%",
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

      const render = (time) => {
        const before = state.progress;
        state.progress += (state.target - state.progress) * 0.12;
        const p = state.progress;
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

        const frame = Math.floor(state.travelled / (100 / STROKES_PER_SCREEN / FRAMES)) % FRAMES;

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
          state.frame = frame;
          gsap.set(tail.current, { rotate: TAIL[frame], transformOrigin: "100% 50%" });
        }

        const near = gsap.utils.clamp(0, 1, 1 - Math.abs(DIAMOND - x) / 60);
        gsap.set(diamond.current, { "--glow": near });
      };

      gsap.ticker.add(render);
      return () => gsap.ticker.remove(render);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="delfin" ref={root} aria-label="un delfín que nada mientras scrolleás">
      <div className="delfin-world" ref={world} style={{ width: `${WORLD}vw` }}>
        <svg className="delfin-floor" viewBox={`0 0 ${WORLD} 100`} preserveAspectRatio="none" aria-hidden="true">
          {ROCKS.map(({ x, w, h }) => (
            <path key={x} d={`M${x} 100 Q${x + w / 2} ${100 - h * 2} ${x + w} 100 Z`} fill="#1a1a1a" />
          ))}
          {WEEDS.map(({ x, h }) => (
            <path
              key={x}
              d={`M${x} 100 q2 -${h / 3} -1 -${(h * 2) / 3} q-2 -${h / 6} 1 -${h / 3}`}
              stroke="#2c2c2c"
              strokeWidth="0.6"
              fill="none"
            />
          ))}
        </svg>
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
        <div className="delfin-diamond" style={{ left: `${DIAMOND}vw`, top: `${DEPTH - 6}vh` }}>
          <svg ref={diamond} viewBox="0 0 60 80" aria-hidden="true">
            <path d="M30 2 L58 30 L30 78 L2 30 Z" fill="none" stroke="#e9e6e1" strokeWidth="3" />
            <path d="M2 30 L58 30 M30 2 L18 30 L30 78 L42 30 Z" fill="none" stroke="#e9e6e1" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="dolphin" ref={dolphin}>
        <Dolphin frame={tail} />
      </div>
      <p className="delfin-note" lang="es">
        delfín provisorio: espera tus dibujos
      </p>
    </section>
  );
};

export default Delfin;
