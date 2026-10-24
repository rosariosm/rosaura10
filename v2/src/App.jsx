import { Suspense, useLayoutEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";

import BlowButton from "./BlowButton";
import Feet from "./Feet";
import Gallery from "./Gallery";

const V1 = "/rosaura10/v1/";

const App = () => {
  const hero = useRef();
  const zoom = useRef(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".hero-inner", {
        opacity: 0,
        ease: "power3.in",
        scrollTrigger: {
          trigger: hero.current,
          start: "top top",
          end: "+=130%",
          scrub: true,
          pin: true,
          refreshPriority: 1,
          onUpdate: (self) => {
            zoom.current = self.progress;
          },
        },
      });
    }, hero);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section className="hero" ref={hero}>
        <div className="hero-inner">
          <Canvas camera={{ position: [0, 0, 6] }}>
            <Suspense fallback={null}>
              <Feet zoom={zoom} />
            </Suspense>
          </Canvas>
          <div className="overlay">
            <h1>v2</h1>
            <p lang="es">mis pelos.</p>
          </div>
          <p className="hint" aria-hidden="true">
            ↓
          </p>
        </div>
      </section>
      <Gallery />
      <BlowButton />
      <div className="footer-fade" aria-hidden="true" />
      <a className="version-link" href={V1} lang="es">
        Lo viejo funciona Juan
      </a>
    </>
  );
};

export default App;
