import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;

    if (!glow) {
      return undefined;
    }

    let frameId = 0;
    let pointerX = 0;
    let pointerY = 0;

    function moveGlow() {
      glow.style.transform = `translate3d(${pointerX - 110}px, ${pointerY - 110}px, 0)`;
      frameId = 0;
    }

    function handlePointerMove(event) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      glow.classList.add('cursor-glow--visible');

      if (!frameId) {
        frameId = window.requestAnimationFrame(moveGlow);
      }
    }

    function handlePointerLeave() {
      glow.classList.remove('cursor-glow--visible');
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}
