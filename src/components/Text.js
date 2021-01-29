import React, { useRef } from "react";
import { useFrame } from "react-three-fiber";
import * as THREE from "three";
import Kumar from "../fonts/kumar.json";
import texture from "../textures/clouds.jpg";

const Text = (props) => {
  const mesh = useRef();

  useFrame(() => {
    mesh.current.rotation.x += 0.01;
    mesh.current.rotation.y += 0.01;
    mesh.current.rotation.z += 0.01;
    mesh.current.geometry.center();
  });

  // parse JSON file with Three
  const font = new THREE.FontLoader().parse(Kumar);

  // configure font geometry
  const textOptions = {
    font,
    size: 1,
    height: 1,
  };

  const three_texture = new THREE.TextureLoader().load(texture);
  three_texture.wrapS = THREE.RepeatWrapping;
  three_texture.wrapT = THREE.RepeatWrapping;
  three_texture.repeat.set(0.1, 0.1);

  return (
    <mesh position={[0, 5, -10]} ref={mesh}>
      <textGeometry
        attach="geometry"
        args={["Pa que te voy a decir que no si si", textOptions]}
      />
      <meshStandardMaterial attach="material" args={{ map: three_texture }} />
    </mesh>
  );
};

export default Text;
