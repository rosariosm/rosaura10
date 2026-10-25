import { useId, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import arbol from "./juego/arbol.png";
import arbusto from "./juego/arbusto.png";
import borde from "./juego/borde.png";
import { DOOR, GUIDE, HEARTS, MAP, SMITH, SOLID, START, SWORD_SPOTS, TILE } from "./juego/world";

const LINE = "#e9e6e1";
const SPEED = 190;
const HERO_R = 15;
const TALK_R = 64;
const SWING = 0.22;
const SWING_COOLDOWN = 0.32;
const REACH = 36;
const CHARGE = 0.7;
const THROW_SPEED = 560;
const THROW_RANGE = 340;
const HAND_R = 60;
const HAND_HP = 8;
const INVULNERABLE = 1.1;
const START_HP = 3;

const COLS = MAP[0].length;
const ROWS = MAP.length;
const WORLD_W = COLS * TILE;
const WORLD_H = ROWS * TILE;

const center = ({ x, y }) => ({ x: (x + 0.5) * TILE, y: (y + 0.5) * TILE });
const solidAt = (px, py) => {
  const c = Math.floor(px / TILE);
  const r = Math.floor(py / TILE);
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
  return SOLID.has(MAP[r][c]);
};
const blocked = (x, y, r) =>
  solidAt(x - r, y - r) || solidAt(x + r, y - r) || solidAt(x - r, y + r) || solidAt(x + r, y + r);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = gsap.utils.clamp;

const BUSH_SCALE = 1.2;
const TREE_SCALE = 1.55;
const PATH_SCALE = 0.3;
const STONE_SCALE = 0.2;
const PATH_WIDEN = 9;
const PATHLIKE = new Set([":", "D"]);
const sortedUrls = (glob) =>
  Object.entries(glob)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, src]) => src);
const grassUrls = sortedUrls(import.meta.glob("./juego/pasto-*.png", { eager: true, import: "default", query: "?url" }));
const flowerUrls = sortedUrls(import.meta.glob("./juego/flor-*.png", { eager: true, import: "default", query: "?url" }));
const DECO_SCALE = 0.14;
const stoneUrls = sortedUrls(import.meta.glob("./juego/piedras-*.png", { eager: true, import: "default", query: "?url" }));

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const drawPath = (g, art, seed) => {
  const { edge, stones } = art;
  const w = edge.naturalWidth * PATH_SCALE;
  const o = PATH_WIDEN;
  const isPath = (c, r) => PATHLIKE.has(MAP[r]?.[c]);
  const sides = [
    [0, -1, Math.PI / 2],
    [1, 0, Math.PI],
    [0, 1, -Math.PI / 2],
    [-1, 0, 0],
  ];
  MAP.forEach((row, r) => {
    [...row].forEach((t, c) => {
      if (t !== ":") return;
      const s = seed(c, r);
      const cx = (c + 0.5) * TILE;
      const cy = (r + 0.5) * TILE;
      if (s % 3 === 0) {
        const stone = stones[(s >>> 5) % stones.length];
        const sw = stone.naturalWidth * STONE_SCALE;
        const sh = stone.naturalHeight * STONE_SCALE;
        g.drawImage(stone, cx - sw / 2 + ((s >>> 3) % 15) - 7, cy - sh / 2 + ((s >>> 7) % 15) - 7, sw, sh);
      }
      sides.forEach(([dx, dy, angle], k) => {
        if (MAP[r + dy]?.[c + dx] === undefined || isPath(c + dx, r + dy)) return;
        const tx = Math.round(-Math.sin(angle));
        const ty = Math.round(Math.cos(angle));
        const reach = (sign) => {
          const pc = c + tx * sign;
          const pr = r + ty * sign;
          if (!isPath(pc, pr)) return o;
          return isPath(pc + dx, pr + dy) ? -o : 0.5;
        };
        const before = reach(-1);
        const after = reach(1);
        const segH = TILE + before + after;
        const srcH = segH / PATH_SCALE;
        const sy = (s * 7 + k * 131) % Math.max(1, edge.naturalHeight - srcH);
        g.save();
        g.translate(cx, cy);
        g.rotate(angle);
        g.drawImage(edge, 0, sy, edge.naturalWidth, srcH, -TILE / 2 - o - w / 2, -TILE / 2 - before, w, segH);
        g.restore();
      });
    });
  });
};

const drawMap = (canvas, art = {}) => {
  const { bush, tree, grass, flowers } = art;
  const deco = (img, x, y) => {
    const w = img.naturalWidth * DECO_SCALE;
    const h = img.naturalHeight * DECO_SCALE;
    g.drawImage(img, x - w / 2, y - h, w, h);
  };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = WORLD_W * dpr;
  canvas.height = WORLD_H * dpr;
  const g = canvas.getContext("2d");
  g.scale(dpr, dpr);
  g.fillStyle = "#000";
  g.fillRect(0, 0, WORLD_W, WORLD_H);
  g.strokeStyle = LINE;
  g.fillStyle = LINE;
  g.lineCap = "round";
  g.lineJoin = "round";
  const seed = (c, r) => ((c * 73856093) ^ (r * 19349663)) >>> 0;
  if (art.edge) drawPath(g, art, seed);
  MAP.forEach((row, r) => {
    [...row].forEach((t, c) => {
      const x = c * TILE;
      const y = r * TILE;
      const s = seed(c, r);
      if (t === "." && flowers && (s >>> 9) % 41 === 0) {
        deco(flowers[(s >>> 13) % flowers.length], x + TILE / 2 + ((s >>> 3) % 11) - 5, y + TILE * 0.8);
      } else if (t === "." && grass && s % 9 === 0) {
        deco(grass[(s >>> 6) % grass.length], x + TILE / 2 + ((s >>> 3) % 11) - 5, y + TILE * 0.75);
      } else if (t === "." && !grass && s % 5 === 0) {
        g.lineWidth = 1.5;
        g.globalAlpha = 0.35;
        g.beginPath();
        g.moveTo(x + 14 + (s % 13), y + 28);
        g.lineTo(x + 17 + (s % 13), y + 20);
        g.moveTo(x + 20 + (s % 13), y + 28);
        g.lineTo(x + 21 + (s % 13), y + 21);
        g.stroke();
        g.globalAlpha = 1;
      }
      if (t === ":" && !art.edge) {
        g.globalAlpha = 0.22;
        g.fillRect(x, y, TILE, TILE);
        g.globalAlpha = 0.5;
        g.fillRect(x + 8 + (s % 20), y + 10 + (s % 17), 3, 3);
        g.globalAlpha = 1;
      }
      if (t === "#" && tree) {
        const w = TILE * TREE_SCALE;
        const h = (w * tree.naturalHeight) / tree.naturalWidth;
        g.save();
        g.translate(x + TILE / 2, y + TILE);
        if (s % 2) g.scale(-1, 1);
        g.drawImage(tree, -w / 2, -h + 4, w, h);
        g.restore();
      } else if (t === "b" && bush) {
        const w = TILE * BUSH_SCALE;
        const h = (w * bush.naturalHeight) / bush.naturalWidth;
        g.save();
        g.translate(x + TILE / 2, y + TILE / 2);
        if (s % 2) g.scale(-1, 1);
        g.drawImage(bush, -w / 2, -h / 2 - 2, w, h);
        g.restore();
      } else if (t === "#" || t === "b") {
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(x + 22, y + 18, 15, 0, Math.PI * 2);
        g.stroke();
        g.beginPath();
        g.moveTo(x + 22, y + 33);
        g.lineTo(x + 22, y + 42);
        g.stroke();
      }
    });
  });
  const house = MAP.reduce(
    (box, row, r) => {
      [...row].forEach((t, c) => {
        if (t !== "H" && t !== "D") return;
        box.c0 = Math.min(box.c0, c);
        box.c1 = Math.max(box.c1, c);
        box.r0 = Math.min(box.r0, r);
        box.r1 = Math.max(box.r1, r);
      });
      return box;
    },
    { c0: COLS, c1: 0, r0: ROWS, r1: 0 }
  );
  const hx = house.c0 * TILE;
  const hy = house.r0 * TILE;
  const hw = (house.c1 - house.c0 + 1) * TILE;
  const hh = (house.r1 - house.r0 + 1) * TILE;
  g.lineWidth = 3;
  g.strokeRect(hx + 4, hy + hh * 0.35, hw - 8, hh * 0.65 - 2);
  g.beginPath();
  g.moveTo(hx - 6, hy + hh * 0.38);
  g.lineTo(hx + hw / 2, hy + 4);
  g.lineTo(hx + hw + 6, hy + hh * 0.38);
  g.stroke();
  g.fillStyle = "#000";
  g.fillRect(DOOR.x * TILE + 8, DOOR.y * TILE + 6, TILE - 16, TILE - 6);
  g.strokeRect(DOOR.x * TILE + 8, DOOR.y * TILE + 6, TILE - 16, TILE - 6);
};

const Person = ({ label, hat }) => (
  <svg viewBox="0 0 40 52" className="game-person" aria-label={label}>
    {hat && <path d="M8 14 L20 2 L32 14 Z" fill="#000" stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />}
    <circle cx="20" cy="18" r="9" fill="#000" stroke={LINE} strokeWidth="2.5" />
    <path d="M8 50 Q8 30 20 30 Q32 30 32 50 Z" fill="#000" stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const SwordIcon = ({ better }) => (
  <svg viewBox="0 0 40 40" className="game-sword-icon" aria-hidden="true">
    <path d="M8 32 L28 12" stroke={better ? "hotpink" : LINE} strokeWidth="4" strokeLinecap="round" />
    <path d="M28 12 L33 7" stroke={better ? "hotpink" : LINE} strokeWidth="2" strokeLinecap="round" />
    <path d="M6 24 L16 34" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const HEART_PIXELS = [
  ".XXX...XXX.",
  "XoooX.XoooX",
  "XoooooooooX",
  "XoooooooooX",
  ".XoooooooX.",
  "..XoooooX..",
  "...XoooX...",
  "....XoX....",
  ".....X.....",
];
const HEART_W = HEART_PIXELS[0].length;
const HEART_H = HEART_PIXELS.length;
const heartCells = (kind) =>
  HEART_PIXELS.flatMap((row, y) => [...row].map((p, x) => (p === kind ? { x, y } : null))).filter(Boolean);
const HEART_LINE = heartCells("X");
const HEART_FILL = heartCells("o");

const Heart = ({ full = 1, color = "hotpink", className = "game-heart" }) => {
  const clip = useId();
  return (
    <svg viewBox={`0 0 ${HEART_W} ${HEART_H}`} className={className} shapeRendering="crispEdges" aria-hidden="true">
      <clipPath id={clip}>
        <rect x="0" y="0" width={Math.round(HEART_W * full)} height={HEART_H} />
      </clipPath>
      <g fill={color} clipPath={`url(#${clip})`}>
        {HEART_FILL.map(({ x, y }) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
        ))}
      </g>
      <g fill={LINE}>
        {HEART_LINE.map(({ x, y }) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
        ))}
      </g>
    </svg>
  );
};

const HP_PER_HEART = 2;
const ENEMY = "#8db600";

const BossBar = ({ hp }) => (
  <div className="game-boss" aria-label={`manos: ${hp.map((h) => `${h} de ${HAND_HP}`).join(" y ")}`}>
    {hp.map((h, i) => (
      <div key={i} className={`game-boss-hand${h <= 0 ? " dead" : ""}`}>
        <span className="game-boss-icon" style={{ transform: i ? "scaleX(-1)" : undefined }}>
          <Hand />
        </span>
        {Array.from({ length: HAND_HP / HP_PER_HEART }, (_, k) => (
          <Heart key={k} className="game-heart game-heart-small" color={ENEMY} full={clamp(0, 1, (h - k * HP_PER_HEART) / HP_PER_HEART)} />
        ))}
      </div>
    ))}
  </div>
);

const Hand = () => (
  <svg viewBox="0 0 100 90" className="game-hand-shape" aria-hidden="true">
    <path
      d="M30 8 Q50 0 62 10 L64 36 Q80 34 88 46 Q94 56 90 62 Q84 64 80 56 Q76 50 70 52 L74 64 Q78 74 72 78 Q66 78 62 70 L58 60 L54 74 Q52 82 46 80 Q40 78 42 68 L44 58 L36 70 Q32 76 26 72 Q22 66 28 58 L32 50 Q18 56 14 48 Q12 40 24 36 Z"
      fill="#000"
      stroke={LINE}
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </svg>
);

const intro = [
  "¡Hola! Qué bueno verte por acá.",
  "En la casa de arriba a la izquierda vive el malo: dos manos gigantes que te persiguen y te quieren encerrar.",
  "Antes de entrar, recorré el camino: buscá una espada mejor, aprendé a usarla y juntá corazones.",
  "Cuando estés lista o listo, entrá a la casa y peleá. ¡Suerte!",
];

const Juego = () => {
  const root = useRef();
  const world = useRef();
  const map = useRef();
  const hero = useRef();
  const blade = useRef();
  const thrown = useRef();
  const swordItem = useRef();
  const heartItems = useRef([]);
  const hands = useRef([]);
  const room = useRef();
  const keys = useRef({ x: 0, y: 0, action: false });
  const [hud, setHud] = useState({ hp: START_HP, max: START_HP, sword: "común", canThrow: false });
  const [dialog, setDialog] = useState(null);
  const [scene, setScene] = useState("world");
  const [end, setEnd] = useState(null);
  const [bossHp, setBossHp] = useState([HAND_HP, HAND_HP]);
  const [touch] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const game = useRef(null);
  const spot = useRef(SWORD_SPOTS[Math.floor(Math.random() * SWORD_SPOTS.length)]);

  useLayoutEffect(() => {
    drawMap(map.current);
    const all = (urls) => Promise.all(urls.map(loadImage));
    Promise.all([loadImage(arbusto), loadImage(arbol), loadImage(borde), all(stoneUrls), all(grassUrls), all(flowerUrls)])
      .then(
        ([bush, tree, edge, stones, grass, flowers]) =>
          map.current && drawMap(map.current, { bush, tree, edge, stones, grass, flowers })
      )
      .catch((error) => console.error(error));
  }, []);

  useLayoutEffect(() => {
    const s = {
      scene: "world",
      hero: { ...center(START), fx: 0, fy: -1, hp: START_HP, max: START_HP, hurt: 0, knock: { x: 0, y: 0 } },
      swing: 0,
      cooldown: 0,
      charge: 0,
      holding: false,
      throwing: null,
      better: false,
      canThrow: false,
      swordTaken: false,
      metGuide: false,
      hearts: HEARTS.map(() => false),
      hands: [],
      dialog: null,
      ended: false,
    };
    game.current = s;

    const sync = () =>
      setHud({ hp: s.hero.hp, max: s.hero.max, sword: s.better ? "mejor" : "común", canThrow: s.canThrow });

    const say = (lines, then) => {
      s.dialog = { lines, i: 0, then };
      setDialog(lines[0]);
    };
    const advance = () => {
      const d = s.dialog;
      d.i += 1;
      if (d.i < d.lines.length) return setDialog(d.lines[d.i]);
      s.dialog = null;
      setDialog(null);
      d.then?.();
    };

    const guideLines = () => {
      if (!s.metGuide) {
        s.metGuide = true;
        return intro;
      }
      const missing = [];
      if (!s.better) missing.push("encontrar una espada mejor");
      else if (!s.canThrow) missing.push("buscar al espadero para aprender a usarla");
      const left = s.hearts.filter((h) => !h).length;
      if (left) missing.push(`juntar ${left === 1 ? "el corazón que falta" : `los ${left} corazones que faltan`}`);
      if (!missing.length) return ["¡Estás lista o listo! Andá a la casa del malo."];
      return [`Todavía podés ${missing.join(", ")}.`, "Igual, si querés, ya podés ir a la casa del malo."];
    };
    const smithLines = () => {
      if (s.canThrow) return ["Ya sabés lanzarla. ¡Andá a pelear con el malo!"];
      if (!s.better) return ["¡Oh, no! ¡Mi espada! ¿Me ayudás a encontrarla?", `Debe estar ${spot.current.hint}...`];
      return [
        "¡Encontraste mi espada! Te la regalo, y te enseño a usarla.",
        "Mantené apretada la tecla de la espada hasta que se cargue, y soltala para lanzarla lejos.",
        "Después vuelve sola a tu mano.",
      ];
    };

    const npcs = [
      { pos: center(GUIDE), lines: guideLines },
      {
        pos: center(SMITH),
        lines: smithLines,
        after: () => {
          if (s.better && !s.canThrow) {
            s.canThrow = true;
            sync();
          }
        },
      },
    ];

    const pressAction = () => {
      if (s.ended) return;
      if (s.dialog) return advance();
      if (s.scene === "world") {
        const npc = npcs.find((n) => dist(n.pos, s.hero) < TALK_R);
        if (npc) {
          const lines = npc.lines();
          return say(lines, npc.after);
        }
      }
      s.holding = true;
      s.charge = 0;
      if (s.cooldown <= 0 && !s.throwing) {
        s.swing = SWING;
        s.swingId = (s.swingId ?? 0) + 1;
        s.cooldown = SWING_COOLDOWN;
      }
    };
    const releaseAction = () => {
      if (!s.holding) return;
      s.holding = false;
      if (s.canThrow && s.charge >= CHARGE && !s.throwing) {
        s.throwing = { x: s.hero.x, y: s.hero.y, vx: s.hero.fx, vy: s.hero.fy, out: 0, back: false, hit: new Set() };
      }
      s.charge = 0;
    };
    keys.current.press = pressAction;
    keys.current.release = releaseAction;

    const setupBoss = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const r = { x0: Math.max(24, w * 0.06), y0: Math.max(110, h * 0.16), x1: w - Math.max(24, w * 0.06), y1: h - Math.max(40, h * 0.08) };
      s.room = r;
      s.hero.x = (r.x0 + r.x1) / 2;
      s.hero.y = r.y1 - 50;
      s.hero.fx = 0;
      s.hero.fy = -1;
      setBossHp([HAND_HP, HAND_HP]);
      s.hands = [-1, 1].map((side) => ({
        x: (r.x0 + r.x1) / 2 + side * (r.x1 - r.x0) * 0.25,
        y: r.y0 + 60,
        side,
        hp: HAND_HP,
        state: "stalk",
        t: 0,
        ring: 240,
        vx: 0,
        vy: 0,
        flash: 0,
        dead: false,
      }));
    };

    const enterBoss = () => {
      s.scene = "boss";
      setScene("boss");
      setupBoss();
      hands.current.forEach((el) => el && (el.style.opacity = 1));
    };

    const hurtHero = (from) => {
      if (s.hero.hurt > 0 || s.ended) return;
      s.hero.hp -= 1;
      s.hero.hurt = INVULNERABLE;
      const d = Math.hypot(s.hero.x - from.x, s.hero.y - from.y) || 1;
      s.hero.knock = { x: ((s.hero.x - from.x) / d) * 420, y: ((s.hero.y - from.y) / d) * 420 };
      sync();
      if (s.hero.hp <= 0) {
        s.ended = true;
        setEnd("lose");
      }
    };

    const hitHand = (hand, damage, from) => {
      if (hand.dead) return;
      hand.hp = Math.max(0, hand.hp - damage);
      setBossHp(s.hands.map((h) => h.hp));
      hand.flash = 0.25;
      const d = Math.hypot(hand.x - from.x, hand.y - from.y) || 1;
      hand.x += ((hand.x - from.x) / d) * 30;
      hand.y += ((hand.y - from.y) / d) * 30;
      if (hand.state === "lunge" || hand.state === "windup") {
        hand.state = "rest";
        hand.t = 0;
      }
      if (hand.hp <= 0) {
        hand.dead = true;
        const el = hands.current[s.hands.indexOf(hand)];
        gsap.to(el, { opacity: 0, scale: 1.6, duration: 0.4 });
        if (s.hands.every((h) => h.dead)) {
          s.ended = true;
          setTimeout(() => setEnd("win"), 600);
        }
      }
    };

    const moveHero = (dt) => {
      const h = s.hero;
      let { x: ix, y: iy } = keys.current;
      const len = Math.hypot(ix, iy);
      if (len > 1) {
        ix /= len;
        iy /= len;
      }
      if (s.dialog || s.ended) ix = iy = 0;
      if (len > 0.2 && !s.dialog) {
        const l = Math.hypot(ix, iy);
        h.fx = ix / l;
        h.fy = iy / l;
      }
      const slow = s.holding && s.canThrow ? 0.55 : 1;
      const dx = ix * SPEED * slow * dt + h.knock.x * dt;
      const dy = iy * SPEED * slow * dt + h.knock.y * dt;
      h.knock.x *= Math.pow(0.002, dt);
      h.knock.y *= Math.pow(0.002, dt);
      if (s.scene === "world") {
        if (!blocked(h.x + dx, h.y, HERO_R)) h.x += dx;
        if (!blocked(h.x, h.y + dy, HERO_R)) h.y += dy;
        npcs.forEach((n) => {
          const d = dist(n.pos, h);
          if (d < 30 && d > 0) {
            h.x = n.pos.x + ((h.x - n.pos.x) / d) * 30;
            h.y = n.pos.y + ((h.y - n.pos.y) / d) * 30;
          }
        });
      } else {
        const r = s.room;
        h.x = clamp(r.x0 + HERO_R, r.x1 - HERO_R, h.x + dx);
        h.y = clamp(r.y0 + HERO_R, r.y1 - HERO_R, h.y + dy);
      }
    };

    const pickups = () => {
      const h = s.hero;
      if (!s.swordTaken && dist(h, center(spot.current)) < 30) {
        s.swordTaken = true;
        s.better = true;
        gsap.to(swordItem.current, { opacity: 0, y: -30, duration: 0.4 });
        sync();
        say(["¡Encontraste una espada mejor!", "Para aprender a usarla, tenés que buscar al espadero, que te va a enseñar."]);
      }
      HEARTS.forEach((p, i) => {
        if (s.hearts[i] || dist(h, center(p)) >= 28) return;
        s.hearts[i] = true;
        s.hero.max += 1;
        s.hero.hp = s.hero.max;
        gsap.to(heartItems.current[i], { opacity: 0, y: -30, duration: 0.4 });
        sync();
        say(["¡Un corazón más!"]);
      });
      const door = center(DOOR);
      if (Math.abs(h.x - door.x) < 18 && h.y - door.y < TILE * 0.7 && h.y > door.y) enterBoss();
    };

    const swingHits = () => {
      if (s.swing <= 0 || s.scene !== "boss") return;
      const tip = { x: s.hero.x + s.hero.fx * REACH, y: s.hero.y + s.hero.fy * REACH };
      s.hands.forEach((hand) => {
        if (hand.hitBy === s.swingId) return;
        if (dist(tip, hand) < HAND_R + 22) {
          hand.hitBy = s.swingId;
          hitHand(hand, s.better ? 2 : 1, s.hero);
        }
      });
    };

    const updateThrow = (dt) => {
      const t = s.throwing;
      if (!t) return;
      if (!t.back) {
        t.x += t.vx * THROW_SPEED * dt;
        t.y += t.vy * THROW_SPEED * dt;
        t.out += THROW_SPEED * dt;
        const wall = s.scene === "world" ? blocked(t.x, t.y, 6) : t.x < s.room.x0 || t.x > s.room.x1 || t.y < s.room.y0 || t.y > s.room.y1;
        if (t.out > THROW_RANGE || wall) t.back = true;
      } else {
        const d = dist(t, s.hero);
        if (d < 24) {
          s.throwing = null;
          return;
        }
        t.x += ((s.hero.x - t.x) / d) * THROW_SPEED * 1.1 * dt;
        t.y += ((s.hero.y - t.y) / d) * THROW_SPEED * 1.1 * dt;
      }
      if (s.scene === "boss") {
        s.hands.forEach((hand) => {
          if (t.hit.has(hand) || dist(t, hand) > HAND_R + 14) return;
          t.hit.add(hand);
          hitHand(hand, 2, t);
        });
      }
    };

    const updateHands = (dt) => {
      const h = s.hero;
      s.hands.forEach((hand) => {
        if (hand.dead) return;
        hand.t += dt;
        hand.flash = Math.max(0, hand.flash - dt);
        if (hand.state === "stalk") {
          hand.ring = Math.max(80, hand.ring - 55 * dt);
          const dx = h.x - hand.x;
          const dy = h.y - hand.y;
          const d = Math.hypot(dx, dy) || 1;
          const px = (-dy / d) * hand.side;
          const py = (dx / d) * hand.side;
          const tx = h.x - (dx / d) * hand.ring * 0.6 + px * hand.ring;
          const ty = h.y - (dy / d) * hand.ring * 0.6 + py * hand.ring;
          const td = Math.hypot(tx - hand.x, ty - hand.y) || 1;
          const sp = Math.min(150, td * 3);
          hand.x += ((tx - hand.x) / td) * sp * dt;
          hand.y += ((ty - hand.y) / td) * sp * dt;
          if (hand.t > 2.6 + (hand.side > 0 ? 0.4 : 0)) {
            hand.state = "windup";
            hand.t = 0;
          }
        } else if (hand.state === "windup") {
          if (hand.t > 0.5) {
            const d = dist(h, hand) || 1;
            hand.vx = ((h.x - hand.x) / d) * 560;
            hand.vy = ((h.y - hand.y) / d) * 560;
            hand.state = "lunge";
            hand.t = 0;
          }
        } else if (hand.state === "lunge") {
          hand.x += hand.vx * dt;
          hand.y += hand.vy * dt;
          if (hand.t > 0.38) {
            hand.state = "rest";
            hand.t = 0;
          }
        } else if (hand.state === "rest" && hand.t > 1.1) {
          hand.state = "stalk";
          hand.t = 0;
          hand.ring = 240;
        }
        const r = s.room;
        hand.x = clamp(r.x0 + HAND_R, r.x1 - HAND_R, hand.x);
        hand.y = clamp(r.y0 + HAND_R, r.y1 - HAND_R, hand.y);
        if (dist(hand, h) < HAND_R + HERO_R - 6) hurtHero(hand);
      });
    };

    const render = (time) => {
      const h = s.hero;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let ox = 0;
      let oy = 0;
      if (s.scene === "world") {
        ox = WORLD_W > vw ? clamp(0, WORLD_W - vw, h.x - vw / 2) : (WORLD_W - vw) / 2;
        oy = WORLD_H > vh ? clamp(0, WORLD_H - vh, h.y - vh / 2) : (WORLD_H - vh) / 2;
        world.current.style.transform = `translate(${-ox}px, ${-oy}px)`;
      }
      const angle = Math.atan2(h.fy, h.fx);
      const blink = h.hurt > 0 && Math.floor(time * 16) % 2 === 0;
      const heroEl = hero.current;
      heroEl.style.transform = `translate(${h.x - ox}px, ${h.y - oy}px)`;
      heroEl.style.opacity = blink ? 0.25 : 1;
      heroEl.style.setProperty("--face", `${angle}rad`);
      heroEl.classList.toggle("charged", s.canThrow && s.charge >= CHARGE);
      heroEl.classList.toggle("charging", s.canThrow && s.holding && s.charge > 0.12);
      const swingT = s.swing > 0 ? 1 - s.swing / SWING : -1;
      blade.current.style.opacity = s.throwing ? 0 : swingT >= 0 || s.holding ? 1 : 0;
      const sweep = swingT >= 0 ? -1.2 + swingT * 2.4 : 0;
      blade.current.style.transform = `rotate(${angle + sweep}rad)`;
      blade.current.classList.toggle("better", s.better);
      const t = s.throwing;
      thrown.current.style.opacity = t ? 1 : 0;
      if (t) thrown.current.style.transform = `translate(${t.x - ox}px, ${t.y - oy}px) rotate(${time * 22}rad)`;
      s.hands.forEach((hand, i) => {
        const el = hands.current[i];
        if (!el || hand.dead) return;
        const shake = hand.state === "windup" ? Math.sin(time * 70) * 4 : 0;
        const tilt = hand.side * 10 + (hand.state === "lunge" ? hand.side * -20 : 0);
        el.style.transform = `translate(${hand.x + shake}px, ${hand.y}px) scaleX(${hand.side}) rotate(${tilt}deg)`;
        el.classList.toggle("flash", hand.flash > 0);
        el.classList.toggle("tired", hand.state === "rest");
      });
    };

    const tick = (time, deltaMs) => {
      const dt = Math.min(deltaMs, 50) / 1000;
      s.hero.hurt = Math.max(0, s.hero.hurt - dt);
      s.cooldown -= dt;
      s.swing = Math.max(0, s.swing - dt);
      if (s.holding && s.canThrow && !s.throwing) s.charge += dt;
      moveHero(dt);
      if (!s.dialog && !s.ended) {
        if (s.scene === "world") pickups();
        else updateHands(dt);
        swingHits();
      }
      updateThrow(dt);
      render(time);
    };
    gsap.ticker.add(tick);

    const KEYS = {
      ArrowLeft: ["x", -1],
      ArrowRight: ["x", 1],
      ArrowUp: ["y", -1],
      ArrowDown: ["y", 1],
      a: ["x", -1],
      d: ["x", 1],
      w: ["y", -1],
      s: ["y", 1],
    };
    const ACTION = new Set([" ", "j", "z", "Enter"]);
    const held = new Set();
    const axes = () => {
      keys.current.x = (held.has("x1") ? 1 : 0) - (held.has("x-1") ? 1 : 0);
      keys.current.y = (held.has("y1") ? 1 : 0) - (held.has("y-1") ? 1 : 0);
    };
    const down = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (KEYS[k]) {
        e.preventDefault();
        held.add(KEYS[k].join(""));
        axes();
      } else if (ACTION.has(k)) {
        e.preventDefault();
        if (!e.repeat) pressAction();
      }
    };
    const up = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (KEYS[k]) {
        held.delete(KEYS[k].join(""));
        axes();
      } else if (ACTION.has(k)) releaseAction();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    sync();
    say(
      touch
        ? ["Usá el círculo de la izquierda para caminar.", "El botón A es la espada y también sirve para hablar.", "Andá a hablar con quien está en el camino."]
        : ["Flechas o WASD para caminar.", "Espacio para la espada y para hablar.", "Andá a hablar con quien está en el camino."]
    );

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const retry = () => {
    const s = game.current;
    s.ended = false;
    setEnd(null);
    if (s.scene === "boss") {
      s.scene = "world";
      setScene("world");
      const door = center(DOOR);
      s.hero.x = door.x;
      s.hero.y = door.y + TILE * 1.2;
      s.hero.hp = s.hero.max;
      s.hero.hurt = 0;
      s.throwing = null;
      setHud((h) => ({ ...h, hp: s.hero.max }));
    }
  };

  const stick = useRef();
  const onStick = (e) => {
    const r = stick.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const len = Math.hypot(dx, dy);
    keys.current.x = len > 0.25 ? dx / Math.max(1, len) : 0;
    keys.current.y = len > 0.25 ? dy / Math.max(1, len) : 0;
    stick.current.style.setProperty("--kx", `${keys.current.x * 30}px`);
    stick.current.style.setProperty("--ky", `${keys.current.y * 30}px`);
  };
  const stopStick = () => {
    keys.current.x = keys.current.y = 0;
    stick.current.style.setProperty("--kx", "0px");
    stick.current.style.setProperty("--ky", "0px");
  };

  return (
    <section className="game" ref={root} aria-label="un mundo chiquito con una espada y dos manos malas">
      <div className="game-world" ref={world} style={{ width: WORLD_W, height: WORLD_H, visibility: scene === "world" ? "visible" : "hidden" }}>
        <canvas ref={map} className="game-map" style={{ width: WORLD_W, height: WORLD_H }} />
        {[
          { pos: GUIDE, label: "guía", hat: false },
          { pos: SMITH, label: "espadero", hat: true },
        ].map(({ pos, label, hat }) => {
          const c = center(pos);
          return (
            <div key={label} className="game-npc" style={{ transform: `translate(${c.x}px, ${c.y}px)` }}>
              <Person label={label} hat={hat} />
            </div>
          );
        })}
        <div className="game-item" ref={swordItem} style={{ left: center(spot.current).x, top: center(spot.current).y }}>
          <SwordIcon better />
        </div>
        {HEARTS.map((p, i) => (
          <div key={i} className="game-item" ref={(el) => (heartItems.current[i] = el)} style={{ left: center(p).x, top: center(p).y }}>
            <Heart />
          </div>
        ))}
      </div>
      <div className="game-room" ref={room} style={{ visibility: scene === "boss" ? "visible" : "hidden" }}>
        {scene === "boss" && <div className="game-room-floor" style={roomStyle(game.current?.room)} />}
        {scene === "boss" && <BossBar hp={bossHp} />}
        {[0, 1].map((i) => (
          <div key={i} className="game-hand" ref={(el) => (hands.current[i] = el)}>
            <Hand />
          </div>
        ))}
      </div>
      <div className="game-hero" ref={hero}>
        <span className="game-blade" ref={blade} />
        <span className="game-body" />
      </div>
      <span className="game-thrown" ref={thrown} />
      <div className="game-hud" aria-live="polite">
        <div className="game-hearts" aria-label={`${hud.hp} de ${hud.max} corazones`}>
          {Array.from({ length: hud.max }, (_, i) => (
            <Heart key={i} full={i < hud.hp ? 1 : 0} />
          ))}
        </div>
        <p className="game-status">
          espada {hud.sword}
          {hud.canThrow ? " · se puede lanzar" : ""}
        </p>
      </div>
      {dialog && (
        <div className="game-dialog" role="dialog" aria-live="polite" onPointerDown={() => keys.current.press?.()}>
          <p>{dialog}</p>
          <span className="game-dialog-next">{touch ? "tocá" : "espacio"} ▸</span>
        </div>
      )}
      {end && (
        <div className="game-end">
          <p>{end === "win" ? "¡Ganaste! Las manos se fueron." : "Las manos te atraparon."}</p>
          <button type="button" className="game-retry" onClick={retry}>
            {end === "win" ? "seguir paseando" : "otra vez"}
          </button>
        </div>
      )}
      {touch && (
        <div className="game-pad">
          <div
            className="game-stick"
            ref={stick}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              onStick(e);
            }}
            onPointerMove={(e) => e.buttons && onStick(e)}
            onPointerUp={stopStick}
            onPointerCancel={stopStick}
          >
            <span />
          </div>
          <button
            type="button"
            className="game-button"
            aria-label="espada"
            onPointerDown={(e) => {
              e.preventDefault();
              keys.current.press?.();
            }}
            onPointerUp={() => keys.current.release?.()}
            onPointerCancel={() => keys.current.release?.()}
          >
            A
          </button>
        </div>
      )}
      <p className="game-note" lang="es">
        mapa, personajes y manos provisorios: esperan tus dibujos
      </p>
    </section>
  );
};

const roomStyle = (r) => (r ? { left: r.x0, top: r.y0, width: r.x1 - r.x0, height: r.y1 - r.y0 } : undefined);

export default Juego;
