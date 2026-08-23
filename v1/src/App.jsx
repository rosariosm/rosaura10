import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import { Box } from "./shapes";
import { Text } from "./components";

const V2 = "/rosaura10/v2/";

const App = () => (
  <>
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} decay={0} />
      <Suspense fallback={null}>
        <Text />
      </Suspense>
      <Box position={[-1.2, -2, 0]} />
      <Box position={[1.2, -2, 0]} />
    </Canvas>
    <a className="version-link" href={V2}>
      want to go back to the future?
    </a>
  </>
);

export default App;
