import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import { Box } from "./shapes";
import { Text } from "./components";

// Deployed path of the other version. It also works in dev: the dev server
// redirects /rosaura10/<version>/ to whichever port that version runs on.
const V2 = "/rosaura10/v2/";

const App = () => (
  <>
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
    <a className="version-link" href={V2}>
      want to go back to the future?
    </a>
  </>
);

export default App;
