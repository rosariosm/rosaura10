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
const STROKES_PER_SCREEN = 6;

const ROCKS = Array.from({ length: 14 }, (_, i) => ({
  x: i * 30 + ((i * 37) % 17),
  w: 18 + ((i * 53) % 22),
  h: 8 + ((i * 29) % 14),
}));

const WEEDS = Array.from({ length: 22 }, (_, i) => ({
  x: i * 18 + ((i * 41) % 11),
  h: 10 + ((i * 23) % 18),
}));

const swim = Object.entries(
  import.meta.glob("./delfin/swim-*.png", { eager: true, import: "default", query: "?url" })
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
        <Dolphin frames={frames} />
      </div>
      <p className="delfin-note" lang="es">
        fondo y diamante provisorios: esperan tus dibujos
      </p>
    </section>
  );
};

export default Delfin;
