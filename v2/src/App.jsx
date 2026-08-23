import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

// Deployed path of the other version. It also works in dev: the dev server
// redirects /rosaura10/<version>/ to whichever port that version runs on.
const V1 = "/rosaura10/v1/";

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
    <a className="version-link" href={V1} lang="es">
      Lo viejo funciona Juan
    </a>
  </>
);

export default App;
