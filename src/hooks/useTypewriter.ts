import { useEffect, useRef, useState } from "react";

/** Animated placeholder: type out, pause, delete, next. `staticText` overrides and stops it.
 *  Pass a stable `examples` array per mode, so switching modes resets the animation. */
export function useTypewriter(examples: string[], staticText?: string): string {
  const [placeholder, setPlaceholder] = useState("");
  const cursor = useRef({ wordIndex: 0, charCount: 0, deleting: false });

  useEffect(() => {
    cursor.current = { wordIndex: 0, charCount: 0, deleting: false };
    if (staticText) {
      setPlaceholder(staticText);
      return;
    }

    let timer: number;
    const tick = () => {
      const c = cursor.current;
      const word = examples[c.wordIndex % examples.length] ?? "";
      setPlaceholder(word.slice(0, c.charCount) + (c.deleting ? "" : "▏"));

      let delay = c.deleting ? 26 : 58;
      if (!c.deleting && c.charCount < word.length) {
        c.charCount++;
      } else if (!c.deleting && c.charCount === word.length) {
        c.deleting = true;
        delay = 1500; // hold the full word before deleting
      } else if (c.deleting && c.charCount > 0) {
        c.charCount = Math.max(0, c.charCount - 2);
      } else {
        c.deleting = false;
        c.wordIndex++;
      }
      timer = window.setTimeout(tick, delay);
    };

    tick();
    return () => window.clearTimeout(timer);
  }, [examples, staticText]);

  return staticText ?? placeholder;
}
