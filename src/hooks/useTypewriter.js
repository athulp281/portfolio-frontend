import { useEffect, useState } from "react";

export function useTypewriter(words, { speed = 70, pause = 1400 } = {}) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[i % words.length];
    let timeout;

    if (!deleting && text === word) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === "") {
      setDeleting(false);
      setI((v) => (v + 1) % words.length);
    } else {
      timeout = setTimeout(
        () => {
          setText((curr) =>
            deleting ? word.slice(0, curr.length - 1) : word.slice(0, curr.length + 1),
          );
        },
        deleting ? speed / 2 : speed,
      );
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, i, words, speed, pause]);

  return text;
}
