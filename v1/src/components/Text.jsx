import { useMemo, useRef } from "react";
import { extend, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

import Kumar from "../fonts/kumar.json";
import cloudsUrl from "../textures/clouds.jpg";

extend({ TextGeometry });

const Text = () => {
  const mesh = useRef();

  useFrame(() => {
    mesh.current.rotation.x += 0.01;
    mesh.current.rotation.y += 0.01;
    mesh.current.rotation.z += 0.01;
    mesh.current.geometry.center();
  });

  const textOptions = useMemo(
    () => ({ font: new FontLoader().parse(Kumar), size: 1, depth: 1 }),
    []
  );

  const texture = useLoader(THREE.TextureLoader, cloudsUrl);
  useMemo(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.1, 0.1);
  }, [texture]);

  return (
    <mesh position={[0, 5, -10]} ref={mesh}>
      <textGeometry
        args={["Pa que te voy a decir que no si si", textOptions]}
      />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

export default Text;
