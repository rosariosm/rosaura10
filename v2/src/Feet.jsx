import { useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { TextureLoader, Vector3 } from "three";

import pie1 from "./feet/pie1.json";
import pie2 from "./feet/pie2.json";

const urls = import.meta.glob("./feet/*.png", {
  eager: true,
  import: "default",
  query: "?url",
});

const url = (file) => urls[`./feet/${file}`];

const INK = "#e9e6e1";
const HEIGHT = 6;

const Hair = ({ hair, scale, texture, origin }) => {
  const pivot = useRef();
  const world = useMemo(() => new Vector3(), []);
  const pointer = useMemo(() => new Vector3(), []);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const speed = useMemo(() => 2 + Math.random() * 3, []);
  const excitement = useRef(0);

  const x = (origin.x + hair.x + hair.bx) * scale;
  const y = (origin.y - hair.y - hair.by) * scale;
  const w = hair.w * scale;
  const h = hair.h * scale;

  useFrame(({ clock, pointer: p, viewport, camera }, delta) => {
    pivot.current.getWorldPosition(world);
    const vp = viewport.getCurrentViewport(camera, world);
    pointer.set((p.x * vp.width) / 2, (p.y * vp.height) / 2, world.z);
    const near = Math.max(0, 1 - pointer.distanceTo(world) / 1.2);
    excitement.current += (near - excitement.current) * Math.min(1, delta * 6);

    const e = excitement.current;
    const t = clock.elapsedTime;
    pivot.current.rotation.z =
      Math.sin(t * speed + phase) * (0.25 + e * 0.9) +
      Math.sin(t * speed * 7.3 + phase) * e * 0.35;
    pivot.current.scale.set(1 + e * 0.4, 1 + e * 1.6, 1);
  });

  return (
    <group ref={pivot} position={[x, y, 0.01]}>
      <mesh position={[(hair.w / 2 - hair.bx) * scale, (hair.by - hair.h / 2) * scale, 0]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color={INK} alphaMap={texture} transparent depthWrite={false} />
      </mesh>
    </group>
  );
};

const Foot = ({ name, meta, position }) => {
  const files = [`${name}.png`, ...meta.hairs.map((hair) => hair.file)];
  const [base, ...hairTextures] = useLoader(TextureLoader, files.map(url));
  const scale = HEIGHT / meta.h;
  const origin = { x: -meta.w / 2, y: meta.h / 2 };

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[meta.w * scale, HEIGHT]} />
        <meshBasicMaterial color={INK} alphaMap={base} transparent depthWrite={false} />
      </mesh>
      {meta.hairs.map((hair, i) => (
        <Hair key={hair.file} hair={hair} scale={scale} texture={hairTextures[i]} origin={origin} />
      ))}
    </group>
  );
};

const Feet = () => {
  const { viewport } = useThree();
  const fit = Math.min(1, viewport.width / 10, viewport.height / 7.5);

  return (
    <group scale={fit} position={[0, 0.2, 0]}>
      <Foot name="pie1" meta={pie1} position={[-2.25, 0, 0]} />
      <Foot name="pie2" meta={pie2} position={[2.25, 0, 0]} />
    </group>
  );
};

export default Feet;
