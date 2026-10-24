import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { startWind, stopWind, wind } from "./wind";

const LABEL = {
  off: "soplá",
  asking: "permitime el micrófono…",
  on: "soplá fuerte",
  denied: "sin micrófono :(",
};

const supported = () => typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

const BlowButton = () => {
  const [state, setState] = useState("off");
  const meter = useRef();

  useEffect(() => {
    const draw = () => meter.current?.style.setProperty("--level", wind.value.toFixed(3));
    gsap.ticker.add(draw);
    window.addEventListener("pagehide", stopWind);
    return () => {
      gsap.ticker.remove(draw);
      window.removeEventListener("pagehide", stopWind);
      stopWind();
    };
  }, []);

  if (!supported()) return null;

  const toggle = async () => {
    if (state === "on") {
      stopWind();
      setState("off");
      return;
    }
    setState("asking");
    try {
      await startWind();
      setState("on");
    } catch {
      setState("denied");
    }
  };

  return (
    <div className="blow" data-state={state}>
      <button type="button" aria-pressed={state === "on"} onClick={toggle} disabled={state === "asking"}>
        <span className="blow-meter" ref={meter} aria-hidden="true" />
        {LABEL[state]}
      </button>
      <p className="blow-note">
        {state === "on" ? "el sonido no se graba ni sale de tu compu · tocá de nuevo para apagar" : "soplá y se vuelan los pelos"}
      </p>
    </div>
  );
};

export default BlowButton;
