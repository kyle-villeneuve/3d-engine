import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Animator from "./Animator";
import Perspective from "./Perspective";
import useEventListener from "./useEventListener";

// inspired by:
// https://stackoverflow.com/a/44850035

// still havent cracked rotations, the axes are inextricably tied
// and updating one requires a proportional update of the other two or things get skewed
// using some trig function which I don't know enough about geometry/linear algebra to have
// an answer for

let prev: { x: number; y: number };

function App() {
  const [attachedRef, setAttachedRef] = useState(false);
  const ref = useRef<HTMLCanvasElement>();

  const setRef = (node: HTMLCanvasElement) => {
    ref.current = node;
    setAttachedRef(true);
  };

  const perspective = useMemo(
    () => ref.current && new Perspective(ref.current),
    [attachedRef]
  );

  const Pan = useMemo(
    () =>
      new Animator((axis: "x" | "y", delta = 1) => {
        if (!perspective) return;
        perspective.pan(axis, delta);
        perspective.render();
      }),
    [perspective]
  );

  const handleKeyUp = () => {
    window.removeEventListener("mouseup", handleKeyUp);
    Pan.cancel();
  };

  const handleMouseMove = ({ offsetX, offsetY }: MouseEvent) => {
    if (!perspective) return;

    const dx = offsetX - prev.x;
    const dy = offsetY - prev.y;

    if (dx) {
      perspective.pan("x", dx / 5);
    }
    if (dy) {
      perspective.pan("y", dy / 5);
    }
    if (dx || dy) {
      perspective.render();
    }

    prev = { x: offsetX, y: offsetY };
  };

  useEventListener(window, "keydown", (e) => {
    Pan.cancel();

    switch (e.key) {
      case "ArrowUp": {
        Pan.animate("y");
        break;
      }
      case "ArrowDown": {
        Pan.animate("y", -1);
        break;
      }
      case "ArrowLeft": {
        Pan.animate("x", 1);
        break;
      }
      case "ArrowRight": {
        Pan.animate("x", -1);
        break;
      }
      default:
        return;
    }

    window.addEventListener("mouseup", handleKeyUp);
  });

  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.height = window.innerHeight;
    ref.current.width = window.innerWidth;
    perspective?.render();
  }, [attachedRef]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", ({ offsetX, offsetY }) => {
      prev = { x: offsetX, y: offsetY };
      Pan.cancel();

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", () => {
        canvas.removeEventListener("mousemove", handleMouseMove);
      });
    });

    canvas.addEventListener("wheel", (e) => {
      if (!perspective) return;
      e.preventDefault();
      perspective.size *= 1 - e.deltaY / 200;
      perspective.render();
    });
  }, [attachedRef]);

  return (
    <div className="App">
      <canvas ref={setRef} />
    </div>
  );
}

export default App;
