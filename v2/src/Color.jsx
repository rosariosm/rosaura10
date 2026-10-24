import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import Matter from "matter-js";

const urls = import.meta.glob("./color/*.webp", { eager: true, import: "default", query: "?url" });

const PRODUCTS = [
  { name: "jugo", size: 593, w: 327, h: 560, price: 1890 },
  { name: "perrito", size: 334, w: 429, h: 319, price: 990 },
  { name: "lata", size: 488, w: 285, h: 474, price: 1450 },
  { name: "barrita", size: 707, w: 225, h: 560, price: 650 },
  { name: "helado", size: 353, w: 285, h: 340, price: 3200 },
  { name: "fosforos", label: "fósforos", size: 602, w: 469, h: 560, price: 2750 },
  { name: "yerba", size: 421, w: 428, h: 408, price: 4100 },
];
const TALLEST = 707;
const BELT_TOP = 66;
const ROLLER = 26;
const LINE = "#e9e6e1";
const STEPS = 3;
const MAX_SPEED = 12;
const MAX_SPIN = 0.06;

let audio;
const tone = (freq, at, duration, type = "square", volume = 0.06) => {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") audio.resume();
    if (audio.state !== "running") return;
    const start = audio.currentTime + at;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + duration);
  } catch {
    audio = null;
  }
};
const beep = () => tone(2400, 0, 0.12);
const chaChing = () => {
  tone(1568, 0, 0.18, "triangle", 0.12);
  tone(2093, 0.12, 0.5, "triangle", 0.12);
};

const money = (n) => `$${n.toLocaleString("es-AR")}`;

const useViewport = () => {
  const [view, setView] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setView({ w: window.innerWidth, h: window.innerHeight }), 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return view;
};

const ROWS = [["perrito", "helado", "lata"], ["jugo", "yerba"], ["barrita", "fosforos"]];
const SHELF_GAP = 0.14;
const ROW_SPAN = 1.3;

const CART_ROOM = 1.8;
const NARROW_TOP = 56;

const ratio = (name) => {
  const p = PRODUCTS.find((q) => q.name === name);
  const h = p.size / TALLEST;
  return { h, w: (h * p.w) / p.h };
};
const PRODUCT_AREA = PRODUCTS.reduce((sum, { name }) => sum + ratio(name).h * ratio(name).w, 0);
const rowHeight = (row) => Math.max(...row.map((name) => ratio(name).h));
const rowWidth = (row) => row.reduce((sum, name) => sum + ratio(name).w, 0);

const storeLayout = (W, H) => {
  const narrow = W / H < 0.75;
  const floor = H * 0.94;
  const stackH = ROWS.reduce((sum, row) => sum + rowHeight(row) + SHELF_GAP, SHELF_GAP);
  const spanW = Math.max(...ROWS.map(rowWidth)) * ROW_SPAN;
  const depth = narrow ? 0.75 : 0.55;
  const cartUnits = Math.sqrt((PRODUCT_AREA * CART_ROOM) / (0.9 * depth));
  const cartTall = (depth + 0.22) * cartUnits;
  const unit = narrow
    ? Math.min((W * 0.92) / spanW, (W * 0.8) / (cartUnits * 1.2), (H * 0.82 - NARROW_TOP - 24) / (stackH + cartTall))
    : Math.min((H * 0.8) / stackH, (W * 0.86) / (spanW + cartUnits * 1.2 + 0.3), (H * 0.75) / cartTall);
  const x0 = narrow ? (W - spanW * unit) / 2 : W * 0.05;
  const x1 = x0 + spanW * unit;
  const base = narrow ? H * 0.12 + NARROW_TOP + stackH * unit : floor;
  let y = base - SHELF_GAP * unit;
  const shelves = ROWS.map((row) => {
    const shelf = { row, y };
    y -= (rowHeight(row) + SHELF_GAP) * unit;
    return shelf;
  });
  const cartW = cartUnits * unit;
  const cx = narrow ? (W - cartW * 0.2) / 2 : Math.min(W * 0.97 - cartW * 0.72, Math.max(W * 0.72, x1 + W * 0.04 + cartW / 2));
  const wheel = cartW * 0.07;
  const basketH = cartW * depth;
  const bottom = floor - wheel * 2 - cartW * 0.08;
  const top = bottom - basketH;
  const cart = {
    cx,
    top,
    bottom,
    wheel,
    tl: [cx - cartW / 2, top],
    tr: [cx + cartW / 2, top],
    bl: [cx - cartW * 0.4, bottom],
    br: [cx + cartW * 0.4, bottom],
    wheels: [cx - cartW * 0.3, cx + cartW * 0.3],
  };
  const hint = narrow ? { left: W / 2, top: H * 0.12 + 8 } : { left: cx, top: H * 0.12 };
  const finish = narrow ? { left: W / 2, top: H * 0.12 + NARROW_TOP - 8 } : { left: cx, top: top - wheel * 2.5 };
  return { unit, floor, gondola: { x0, x1, top: y + SHELF_GAP * unit, base }, shelves, cart, hint, finish };
};

const insideCart = ({ x, y }, cart) => {
  if (y < cart.top - 10 || y > cart.bottom) return false;
  const t = (y - cart.top) / (cart.bottom - cart.top);
  const left = cart.tl[0] + (cart.bl[0] - cart.tl[0]) * t;
  const right = cart.tr[0] + (cart.br[0] - cart.tr[0]) * t;
  return x > left && x < right;
};

const Cart = ({ cart, group, wheels }) => {
  const { tl, tr, bl, br, top, bottom, wheel } = cart;
  const ribs = [0.2, 0.4, 0.6, 0.8].map((t) => [tl[0] + (tr[0] - tl[0]) * t, bl[0] + (br[0] - bl[0]) * t]);
  const mid = (top + bottom) / 2;
  const axle = bottom + cart.wheel * 1.2;
  return (
    <g ref={group}>
      <polygon points={`${tl} ${tr} ${br} ${bl}`} fill="none" stroke={LINE} strokeWidth="3" strokeLinejoin="round" />
      {ribs.map(([a, b]) => (
        <line key={a} x1={a} y1={top} x2={b} y2={bottom} stroke={LINE} strokeWidth="1.5" />
      ))}
      <line x1={(tl[0] + bl[0]) / 2} y1={mid} x2={(tr[0] + br[0]) / 2} y2={mid} stroke={LINE} strokeWidth="1.5" />
      <polyline
        points={`${tr} ${tr[0] + wheel * 1.6},${top - wheel * 2.2} ${tr[0] + wheel * 2.8},${top - wheel * 2.2}`}
        fill="none"
        stroke={LINE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <polyline
        points={`${bl[0]},${bottom} ${bl[0]},${axle} ${br[0]},${axle} ${br[0]},${bottom}`}
        fill="none"
        stroke={LINE}
        strokeWidth="3"
      />
      {cart.wheels.map((x, i) => (
        <g key={x} ref={(el) => (wheels.current[i] = el)} style={{ transformOrigin: `${x}px ${axle + wheel}px` }}>
          <circle cx={x} cy={axle + wheel} r={wheel} fill="#000" stroke={LINE} strokeWidth="3" />
          <line x1={x - wheel} y1={axle + wheel} x2={x + wheel} y2={axle + wheel} stroke={LINE} strokeWidth="2" />
        </g>
      ))}
    </g>
  );
};

const Store = ({ view, onCheckout }) => {
  const scene = useRef();
  const imgs = useRef([]);
  const group = useRef();
  const wheels = useRef([]);
  const button = useRef();
  const [count, setCount] = useState(0);
  const finish = useRef();
  const { w: W, h: H } = view;
  const layout = storeLayout(W, H);
  const { unit, floor, gondola, shelves, cart, hint, finish: finishAt } = layout;

  const sizes = PRODUCTS.map((p) => {
    const h = (p.size / TALLEST) * unit;
    return { h, w: (h * p.w) / p.h };
  });

  useLayoutEffect(() => {
    const { Engine, Events, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter;
    const engine = Engine.create({ positionIterations: 12, velocityIterations: 10, constraintIterations: 4, enableSleeping: true });
    const wall = { isStatic: true, friction: 0.8 };
    const segment = ([x1, y1], [x2, y2], thickness = 10) =>
      Bodies.rectangle((x1 + x2) / 2, (y1 + y2) / 2, Math.hypot(x2 - x1, y2 - y1), thickness, {
        ...wall,
        angle: Math.atan2(y2 - y1, x2 - x1),
      });

    const cartParts = [segment(cart.bl, cart.br), segment(cart.tl, cart.bl), segment(cart.tr, cart.br)];
    Composite.add(engine.world, [
      Bodies.rectangle(W / 2, floor + 30, W * 3, 60, wall),
      Bodies.rectangle(-30, 0, 60, H * 4, wall),
      Bodies.rectangle(W + 30, 0, 60, H * 4, wall),
      Bodies.rectangle(W / 2, -H - 30, W * 3, 60, wall),
      ...shelves.map(({ y }) => segment([gondola.x0, y], [gondola.x1, y], 8)),
      ...cartParts,
    ]);

    const spots = {};
    shelves.forEach(({ row, y }) => {
      const widths = row.map((name) => sizes[PRODUCTS.findIndex((p) => p.name === name)].w);
      const gap = (gondola.x1 - gondola.x0 - widths.reduce((a, b) => a + b, 0)) / (row.length + 1);
      let x = gondola.x0 + gap;
      row.forEach((name, i) => {
        spots[name] = { x: x + widths[i] / 2, y };
        x += widths[i] + gap;
      });
    });
    const bodies = PRODUCTS.map((p, i) => {
      const { w, h } = sizes[i];
      const body = Bodies.rectangle(spots[p.name].x, spots[p.name].y - 4 - h / 2, w, h, {
        chamfer: { radius: Math.min(w, h) * 0.12 },
        friction: 0.8,
        frictionStatic: 1,
        frictionAir: 0.05,
        restitution: 0,
        density: 0.004,
        slop: 0.08,
        label: p.name,
      });
      Body.setInertia(body, body.inertia * 4);
      return body;
    });
    Composite.add(engine.world, bodies);

    const mouse = Mouse.create(scene.current);
    mouse.element.removeEventListener("wheel", mouse.mousewheel);
    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
    const grab = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.15, damping: 0.3 } });
    Composite.add(engine.world, grab);
    Events.on(grab, "startdrag", ({ body }) => (body.collisionFilter.mask = 0));
    Events.on(grab, "enddrag", ({ body }) => (body.collisionFilter.mask = -1));

    const roll = { dx: 0 };
    let inCart = [];

    const render = (time, deltaMs) => {
      const step = Math.min(deltaMs, 33) / STEPS;
      for (let k = 0; k < STEPS; k++) {
        Engine.update(engine, step);
        bodies.forEach((b) => {
          if (b.isStatic || b === grab.body) return;
          const { x, y } = b.velocity;
          const speed = Math.hypot(x, y);
          if (speed > MAX_SPEED) Body.setVelocity(b, { x: (x / speed) * MAX_SPEED, y: (y / speed) * MAX_SPEED });
          if (Math.abs(b.angularVelocity) > MAX_SPIN) Body.setAngularVelocity(b, Math.sign(b.angularVelocity) * MAX_SPIN);
        });
      }
      const next = bodies.filter((b) => insideCart(b.position, cart));
      if (next.length !== inCart.length || next.some((b, i) => b !== inCart[i])) {
        inCart = next;
        setCount(next.length);
      }
      bodies.forEach((b, i) => {
        const { w, h } = sizes[i];
        const dx = b.isStatic && inCart.includes(b) ? roll.dx : 0;
        imgs.current[i].style.transform = `translate(${b.position.x - w / 2 + dx}px, ${b.position.y - h / 2}px) rotate(${b.angle}rad)`;
      });
      group.current.style.transform = `translateX(${roll.dx}px)`;
      wheels.current.forEach((el) => (el.style.transform = `rotate(${roll.dx / cart.wheel}rad)`));
    };
    gsap.ticker.add(render);

    finish.current = () => {
      const bought = inCart.slice().sort((a, b) => a.position.x - b.position.x);
      Composite.remove(engine.world, grab);
      bodies.forEach((b) => Body.setStatic(b, true));
      gsap.to(
        imgs.current.filter((_, i) => !bought.includes(bodies[i])),
        { opacity: 0, duration: 0.4 }
      );
      gsap.to(button.current, { opacity: 0, duration: 0.2 });
      gsap.to(roll, {
        dx: W - cart.tl[0] + 40,
        duration: 1.6,
        delay: 0.3,
        ease: "power2.in",
        onComplete: () => onCheckout(bought.map((b) => b.label)),
      });
    };

    return () => {
      gsap.ticker.remove(render);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div className="store" ref={scene}>
      <svg className="store-lines" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <line x1="0" y1={floor} x2={W} y2={floor} stroke={LINE} strokeWidth="3" />
        {shelves.map(({ y }) => (
          <line key={y} x1={gondola.x0} y1={y} x2={gondola.x1} y2={y} stroke={LINE} strokeWidth="4" strokeLinecap="round" />
        ))}
        {[gondola.x0, gondola.x1].map((x) => (
          <line key={x} x1={x} y1={gondola.top} x2={x} y2={gondola.base} stroke={LINE} strokeWidth="3" />
        ))}
        <Cart cart={cart} group={group} wheels={wheels} />
      </svg>
      {PRODUCTS.map((p, i) => (
        <img
          key={p.name}
          ref={(el) => (imgs.current[i] = el)}
          className="store-product"
          src={urls[`./color/${p.name}.webp`]}
          alt={p.label ?? p.name}
          draggable="false"
          style={{ width: sizes[i].w, height: sizes[i].h }}
        />
      ))}
      {count === 0 && (
        <p className="store-hint" lang="es" style={hint}>
          agarrá los productos y tiralos al carrito
        </p>
      )}
      {count > 0 && (
        <button
          ref={button}
          className="store-finish"
          type="button"
          style={finishAt}
          onClick={() => finish.current()}
        >
          finalizar compra
        </button>
      )}
    </div>
  );
};

const Checkout = ({ items, onAgain }) => {
  const root = useRef();
  const track = useRef();
  const belt = useRef();
  const scanner = useRef();
  const drawer = useRef();
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);
  const bought = items.map((name) => PRODUCTS.find((p) => p.name === name));

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const products = gsap.utils.toArray(".product", root.current);
      const sides = products.map(() => -1);
      const start = -track.current.scrollWidth;
      gsap.set(track.current, { x: start });

      const update = () => {
        const x = gsap.getProperty(track.current, "x");
        belt.current.style.backgroundPositionX = `${x}px`;
        gsap.set(".roller", { rotate: (x / ROLLER) * 57.3 });
        const line = scanner.current.getBoundingClientRect();
        const center = line.left + line.width / 2;
        products.forEach((el, i) => {
          const r = el.getBoundingClientRect();
          const side = Math.sign(r.left + r.width / 2 - center) || -1;
          if (side !== sides[i]) {
            sides[i] = side;
            beep();
            setLines((prev) => [...prev, bought[i]]);
            gsap.fromTo(el.firstChild, { y: 0, rotate: 0 }, { y: "-3vh", rotate: gsap.utils.random(-6, 6), duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 });
            gsap.fromTo(scanner.current, { "--flash": 1 }, { "--flash": 0, duration: 0.5, ease: "power2.out" });
          }
        });
      };

      const distance = window.innerWidth - start;
      gsap.to(track.current, {
        x: window.innerWidth,
        duration: distance / (window.innerWidth * 0.32),
        ease: "none",
        onUpdate: update,
        onComplete: () => {
          chaChing();
          gsap.fromTo(drawer.current, { y: 0 }, { y: "4vh", duration: 0.25, ease: "back.out(3)" });
          setDone(true);
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const total = lines.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="checkout" ref={root}>
      <svg className="register" viewBox="0 0 100 80" aria-hidden="true" style={{ bottom: `${100 - BELT_TOP}vh` }}>
        <rect x="8" y="34" width="84" height="40" rx="3" fill="#000" stroke={LINE} strokeWidth="2" />
        <rect x="20" y="6" width="40" height="22" rx="2" fill="#000" stroke={LINE} strokeWidth="2" />
        <line x1="40" y1="28" x2="40" y2="34" stroke={LINE} strokeWidth="2" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={16 + c * 10} y={40 + r * 8} width="6" height="4" fill={LINE} />)
        )}
        <g ref={drawer}>
          <rect x="12" y="66" width="76" height="10" rx="2" fill="#000" stroke={LINE} strokeWidth="2" />
          <line x1="44" y1="71" x2="56" y2="71" stroke={LINE} strokeWidth="2" />
        </g>
      </svg>
      <div className="ticket" lang="es">
        <p className="ticket-title">Super Rosario</p>
        {lines.map((p, i) => (
          <p key={i} className="ticket-line">
            <span>{p.label ?? p.name}</span>
            <span>{money(p.price)}</span>
          </p>
        ))}
        {done && (
          <>
            <p className="ticket-line ticket-total">
              <span>total</span>
              <span>{money(total)}</span>
            </p>
            <p className="ticket-thanks">gracias por tu compra</p>
          </>
        )}
      </div>
      <div className="checkout-scanner" ref={scanner} style={{ top: `${BELT_TOP - 12}vh` }} aria-hidden="true">
        <span className="checkout-window" />
      </div>
      <div className="checkout-track" ref={track} style={{ bottom: `${100 - BELT_TOP}vh` }}>
        {bought.map(({ name, label, size }) => (
          <div key={name} className="product" style={{ height: `calc(${size / TALLEST} * var(--product))` }}>
            <img src={urls[`./color/${name}.webp`]} alt={label ?? name} />
          </div>
        ))}
      </div>
      <div className="checkout-belt" style={{ top: `${BELT_TOP}vh` }} aria-hidden="true">
        <span className="roller" />
        <div className="belt" ref={belt} />
        <span className="roller" />
      </div>
      {done && (
        <button className="store-finish checkout-again" type="button" onClick={onAgain}>
          volver a empezar
        </button>
      )}
    </div>
  );
};

const Color = () => {
  const view = useViewport();
  const [items, setItems] = useState(null);
  const [round, setRound] = useState(0);

  return (
    <section className="color" aria-label="un súper con mis dibujos en color">
      {items ? (
        <Checkout
          items={items}
          onAgain={() => {
            setItems(null);
            setRound((r) => r + 1);
          }}
        />
      ) : (
        <Store key={`${round}-${view.w}x${view.h}`} view={view} onCheckout={setItems} />
      )}
      <p className="color-note" lang="es">
        góndola, carrito y caja provisorios: esperan tus dibujos
      </p>
    </section>
  );
};

export default Color;
