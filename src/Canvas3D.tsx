import { useBoolean, useEventListener } from '@skusavvy/hooks';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import useResizeObserver from 'use-resize-observer';
import { isInputFocused } from '../utils';
import Animator from './Animator';
import Cuboid from './Cuboid';
import Perspective from './Perspective';

// inspired by:
// https://stackoverflow.com/a/44850035

// still havent cracked rotations, the axes are inextricably tied
// and updating one requires a proportional update of the other two or things get skewed
// using some trig function which I don't know enough about geometry/linear algebra to have
// an answer for

interface Canvas3DProps extends React.ComponentProps<'canvas'> {
  shapes: Cuboid[];
  axes?: boolean;
}

const Canvas3D: React.FC<Canvas3DProps> = ({ shapes, axes, ...props }) => {
  const prevRef = useRef<{ x: number; y: number }>();
  const [attachedRef, setAttachedRef] = useState(false);
  const ref = useRef<HTMLCanvasElement>();
  const [clicking, setClicking] = useBoolean();
  const [shift, setShift] = useBoolean();

  const { width = 0, height = 0 } = useResizeObserver({ ref: ref.current?.parentElement || null });

  const setRef = React.useCallback(
    (node: HTMLCanvasElement) => {
      ref.current = node;
      setAttachedRef(true);
    },
    [setAttachedRef]
  );

  const perspective = useMemo(() => {
    return ref.current && new Perspective(ref.current, 0, 0, '#f00');
  }, [attachedRef]);

  useEffect(() => {
    perspective?.setDimensions(width, height);
  }, [perspective, width, height]);

  useEffect(() => {
    if (!perspective) return;
    perspective.replaceShape(...shapes);
  }, [perspective, shapes]);

  const animate = useMemo(() => {
    return new Animator((action: 'rotateX' | 'panX' | 'panY' | 'zoom', delta = 1) => {
      if (!perspective) return;

      switch (action) {
        case 'rotateX': {
          perspective.rotate('x', delta);
          break;
        }
        case 'panY': {
          perspective.pan('y', delta);
          break;
        }
        case 'panX': {
          perspective.pan('x', delta);
          break;
        }
        case 'zoom': {
          perspective.setScale((size) => size * delta);
          break;
        }
      }
    });
  }, [perspective]);

  const handleMouseMove: React.MouseEventHandler = ({ nativeEvent: { offsetX, offsetY } }) => {
    if (!clicking) return;
    if (!perspective) return;

    if (prevRef.current) {
      const dx = offsetX - prevRef.current.x;
      const dy = offsetY - prevRef.current.y;

      if (dx) {
        if (shift) perspective.rotate('x', -dx / 5);
        else perspective.pan('x', dx);
      }
      if (dy) {
        if (shift) perspective.rotate('y', dy / 5);
        else perspective.pan('y', dy);
      }
    }

    prevRef.current = { x: offsetX, y: offsetY };
  };

  const handleMouseLeave: React.MouseEventHandler = ({ nativeEvent: { offsetX, offsetY } }) => {
    prevRef.current = { x: offsetX, y: offsetY };
    animate.cancel();
    setClicking();
  };

  useEventListener(window, 'keydown', (e) => {
    if (isInputFocused()) return;
    animate.cancel();

    switch (e.key) {
      case 'Shift': {
        setShift(true);
        break;
      }
      case 'ArrowUp': {
        shift ? animate.animate('panY', -2) : animate.animate('zoom', 1.01);
        break;
      }
      case 'ArrowDown': {
        shift ? animate.animate('panY', 2) : animate.animate('zoom', 0.99);
        break;
      }
      case 'ArrowLeft': {
        shift ? animate.animate('panX', 2) : animate.animate('rotateX', 1);
        break;
      }
      case 'ArrowRight': {
        shift ? animate.animate('panX', -2) : animate.animate('rotateX', -1);
        break;
      }
      default:
        return;
    }

    e.preventDefault();
  });

  useEventListener(window, 'keyup', ({ key }) => {
    if (key === 'Shift') setShift(false);
    else animate.cancel();
  });

  useLayoutEffect(() => {
    if (!ref.current) return;
    perspective?.render();
  }, [attachedRef]);

  useEffect(() => {
    if (!attachedRef) return;
    animate.animate('rotateX', -0.25);
  }, [animate, attachedRef]);

  const handleWheel = (e: WheelEvent) => {
    if (!perspective) return;
    e.preventDefault();
    perspective.setScale((size) => Math.min(Math.max(size * (1 - e.deltaY / 200), 1), 100));
  };

  useEventListener(ref.current, 'wheel', handleWheel);

  return (
    <canvas
      ref={setRef}
      onMouseLeave={() => setClicking(false)}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseLeave}
      onContextMenu={() => setClicking(false)}
      onMouseUp={setClicking}
      width={width}
      height={height}
      {...props}
    />
  );
};

export default Canvas3D;
