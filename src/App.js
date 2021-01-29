import ReactDOM from "react-dom";
import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "react-three-fiber";

import { Box } from "./shapes";
import { Text } from "./components";

const App = (props) => (
  <Canvas>
    <ambientLight />
    <pointLight position={[10, 10, 10]} />
    <Text />
    <Box position={[-1.2, -2, 0]} />
    <Box position={[1.2, -2, 0]} />
  </Canvas>
);

export default App;
