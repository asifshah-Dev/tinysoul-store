// components/CustomCursor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const blobRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Mouse position (target)
  const mouse = useRef({ x: 0, y: 0 });
  // Blob position (smoothed)
  const blob = useRef({ x: 0, y: 0 });
  // Last mouse position for velocity calc
  const lastMouse = useRef({ x: 0, y: 0 });
  // Velocity (used to stretch the blob)
  const velocity = useRef({ x: 0, y: 0 });
  // Smoothed velocity for stretch
  const smoothVel = useRef({ x: 0, y: 0 });
  // Track hover state
  const hoverState = useRef(false);
  const clickState = useRef(false);
  const hasMoved = useRef(false);

  useEffect(() => {
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (hasFinePointer && !prefersReducedMotion) {
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const blobEl = blobRef.current;
    const innerEl = innerRef.current;
    if (!blobEl || !innerEl) return;

    document.documentElement.style.cursor = 'none';

    // ── Mouse move ──
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (!hasMoved.current) {
        hasMoved.current = true;
        blob.current.x = e.clientX;
        blob.current.y = e.clientY;
        lastMouse.current.x = e.clientX;
        lastMouse.current.y = e.clientY;
        blobEl.style.opacity = '1';
        innerEl.style.opacity = '1';
      }

      // Hover detection
      const target = e.target as HTMLElement;
      const interactive = !!target.closest(
        'a, button, input, textarea, select, [role="button"], [data-cursor-hover]'
      );
      if (interactive !== hoverState.current) {
        hoverState.current = interactive;
        blobEl.dataset.hovering = interactive ? 'true' : 'false';
        innerEl.dataset.hovering = interactive ? 'true' : 'false';
      }
    };

    const onLeave = () => {
      blobEl.style.opacity = '0';
      innerEl.style.opacity = '0';
      hasMoved.current = false;
    };

    const onEnter = () => {
      if (hasMoved.current) {
        blobEl.style.opacity = '1';
        innerEl.style.opacity = '1';
      }
    };

    // ── Click ──
    const onDown = () => {
      clickState.current = true;
      blobEl.dataset.clicking = 'true';
      innerEl.dataset.clicking = 'true';
    };

    const onUp = () => {
      clickState.current = false;
      blobEl.dataset.clicking = 'false';
      innerEl.dataset.clicking = 'false';
    };

    // ── Animation loop ──
    let raf = 0;
    let running = true;
    let lastTime = performance.now();

    const loop = (now: number) => {
      if (!running) return;

      const dt = Math.min(32, now - lastTime) / 16.67; // normalize to 60fps
      lastTime = now;

      // Blob follows with soft lerp
      const lerpBlob = 0.14;
      blob.current.x += (mouse.current.x - blob.current.x) * lerpBlob * dt;
      blob.current.y += (mouse.current.y - blob.current.y) * lerpBlob * dt;

      // Compute velocity from mouse movement
      const dx = mouse.current.x - lastMouse.current.x;
      const dy = mouse.current.y - lastMouse.current.y;
      lastMouse.current.x = mouse.current.x;
      lastMouse.current.y = mouse.current.y;

      // Smooth velocity
      smoothVel.current.x += (dx - smoothVel.current.x) * 0.2;
      smoothVel.current.y += (dy - smoothVel.current.y) * 0.2;

      // Speed → stretch factor (capped)
      const speed = Math.min(40, Math.hypot(smoothVel.current.x, smoothVel.current.y));
      const stretch = 1 + (speed / 40) * 0.6;   // up to 1.6x
      const squish = 1 - (speed / 40) * 0.25;    // down to 0.75x

      // Angle of motion (for stretching direction)
      const angle = Math.atan2(smoothVel.current.y, smoothVel.current.x) * (180 / Math.PI);

      // Apply transform: translate → rotate → scaleX (stretch) → scaleY (squish)
      // Base size of the blob is 40px wide × 40px tall; scale multipliers extend it.
      const scaleX = speed > 0.5 ? stretch : 1;
      const scaleY = speed > 0.5 ? squish : 1;

      blobEl.style.transform =
        `translate3d(${blob.current.x}px, ${blob.current.y}px, 0) ` +
        `translate(-50%, -50%) ` +
        `rotate(${angle}deg) ` +
        `scale(${scaleX}, ${scaleY})`;

      innerEl.style.transform =
        `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0) ` +
        `translate(-50%, -50%)`;

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    // ── Visibility pause ──
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        lastTime = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('visibilitychange', onVisibility);
      document.documentElement.style.cursor = '';
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Blob — the organic following shape */}
      <div
        ref={blobRef}
        aria-hidden
        data-hovering="false"
        data-clicking="false"
        className="
          pointer-events-none fixed top-0 left-0 z-[9998] rounded-full opacity-0
          w-12 h-12
          transition-[width,height,background-color,border-color] duration-300 ease-out
          bg-[#F4713A]/25 backdrop-blur-[2px]
          border-2 border-[#F4713A]/40
          data-[hovering=true]:w-20
          data-[hovering=true]:h-20
          data-[hovering=true]:bg-[#FF6B9D]/30
          data-[hovering=true]:border-[#FF6B9D]/60
          data-[clicking=true]:w-10
          data-[clicking=true]:h-10
          data-[clicking=true]:bg-[#FF6B9D]/50
        "
        style={{ willChange: 'transform, width, height' }}
      />

      {/* Inner dot — snaps to the mouse 1:1 */}
      <div
        ref={innerRef}
        aria-hidden
        data-hovering="false"
        data-clicking="false"
        className="
          pointer-events-none fixed top-0 left-0 z-[9999] rounded-full opacity-0
          w-2.5 h-2.5 bg-[#F4713A]
          transition-[width,height,background-color] duration-200 ease-out
          data-[hovering=true]:w-3
          data-[hovering=true]:h-3
          data-[hovering=true]:bg-[#FF6B9D]
          data-[clicking=true]:w-4
          data-[clicking=true]:h-4
        "
        style={{ willChange: 'transform' }}
      />
    </>
  );
}