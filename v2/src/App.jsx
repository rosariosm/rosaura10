import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

// Placeholder scene. Enough to prove the stack works end to end, and small
// enough to delete without regret once v2 is actually about something.
const Cube = () => {
  const mesh = useRef();

  useFrame((_, delta) => {
    mesh.current.rotation.x += delta * 0.4;
    mesh.current.rotation.y += delta * 0.6;
  });

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="hotpink" wireframe />
    </mesh>
  );
};

const App = () => (
  <>
    <Canvas camera={{ position: [0, 0, 6] }}>
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} decay={0} />
      <Cube />
    </Canvas>
    <div className="overlay">
      <h1>v2</h1>
      <p>hello world.</p>
    </div>
  </>
);

export default App;
