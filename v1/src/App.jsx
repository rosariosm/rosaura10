import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";

import { Box } from "./shapes";
import { Text } from "./components";

const V2 = "/rosaura10/v2/";

const pad = (n) => String(n).padStart(2, "0");

const stamp = (date) => [
  date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
  pad(date.getDate()),
  String(date.getFullYear()),
  pad(date.getHours() % 12 || 12),
  pad(date.getMinutes()),
];

const Destination = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="destination" lang="en" aria-label={stamp(now).join(" ")}>
      {stamp(now).map((part, i) => (
        <span key={i}>{part}</span>
      ))}
    </span>
  );
};

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
    <a className="version-link" href={V2} lang="es">
      <span>Marty, ¡tenemos que volver al futuro!</span>
      <Destination />
    </a>
  </>
);

export default App;
