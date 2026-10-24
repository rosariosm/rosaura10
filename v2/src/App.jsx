import { useEffect, useLayoutEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Delfin from "./Delfin";
import Menu from "./Menu";
import Pelos from "./Pelos";

const V1 = "/rosaura10/v1/";

const PAGES = {
  pelos: Pelos,
  delfin: Delfin,
};

const fromHash = () => {
  const key = window.location.hash.slice(1);
  return key in PAGES ? key : "pelos";
};

const App = () => {
  const [page, setPage] = useState(fromHash);

  useEffect(() => {
    const onHash = () => setPage(fromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [page]);

  const Page = PAGES[page];

  return (
    <>
      <div className="header-fade" aria-hidden="true" />
      <Menu page={page} />
      <Page key={page} />
      <div className="footer-fade" aria-hidden="true" />
      <a className="version-link" href={V1} lang="es">
        Lo viejo funciona Juan
      </a>
    </>
  );
};

export default App;
