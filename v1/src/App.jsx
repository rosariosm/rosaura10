import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import { Box } from "./shapes";
import { Text } from "./components";

const App = () => (
  <Canvas>
    <ambientLight />
    {/* decay={0} keeps the pre-r155 falloff: three switched to physically
        correct light units, which would leave this scene almost black. */}
    <pointLight position={[10, 10, 10]} decay={0} />
    <Suspense fallback={null}>
      <Text />
    </Suspense>
    <Box position={[-1.2, -2, 0]} />
    <Box position={[1.2, -2, 0]} />
  </Canvas>
);

export default App;
