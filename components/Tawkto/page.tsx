"use client";

import { useEffect } from "react";

export default function TawkToWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.tawk.to/68ce91bfd9b855192574e8e1/1j5jein6a";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}