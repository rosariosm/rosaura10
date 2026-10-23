import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import Feet from "./Feet";

const V1 = "/rosaura10/v1/";

const App = () => (
  <>
    <Canvas camera={{ position: [0, 0, 6] }}>
      <Suspense fallback={null}>
        <Feet />
      </Suspense>
    </Canvas>
    <div className="overlay">
      <h1>v2</h1>
      <p lang="es">mis pelos.</p>
    </div>
    <a className="version-link" href={V1} lang="es">
      Lo viejo funciona Juan
    </a>
  </>
);

export default App;
