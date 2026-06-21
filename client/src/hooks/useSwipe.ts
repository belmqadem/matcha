import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSwipeOptions {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  threshold?: number;
  enabled?: boolean;
}

interface UseSwipeReturn {
  dragX: number;
  dragY: number;
  isDragging: boolean;
  handlers: {
    onMouseDown: (_e: React.MouseEvent) => void;
    onTouchStart: (_e: React.TouchEvent) => void;
  };
}

export function useSwipe({
  onSwipeRight,
  onSwipeLeft,
  threshold = 100,
  enabled = true,
}: UseSwipeOptions): UseSwipeReturn {
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const dragXRef = useRef(0);
  const isFlying = useRef(false);

  // Keep latest callbacks in refs so onEnd doesn't need them as deps
  const onSwipeRightRef = useRef(onSwipeRight);
  const onSwipeLeftRef = useRef(onSwipeLeft);
  useEffect(() => {
    onSwipeRightRef.current = onSwipeRight;
  }, [onSwipeRight]);
  useEffect(() => {
    onSwipeLeftRef.current = onSwipeLeft;
  }, [onSwipeLeft]);

  const onMove = useCallback(
    (clientX: number) => {
      if (!isDragging || isFlying.current) return;
      const dx = clientX - startX.current;
      dragXRef.current = dx;
      setDragX(dx);
      setDragY(Math.max(-20, Math.min(20, dx * 0.05)));
    },
    [isDragging],
  );

  const onEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const dx = dragXRef.current;
    if (Math.abs(dx) >= threshold && !isFlying.current) {
      isFlying.current = true;
      const dir = dx > 0 ? 1 : -1;
      // Fling off-screen; CSS transition handles the animation
      setDragX(dir * (window.innerWidth + 300));
      setTimeout(() => {
        if (dir > 0) onSwipeRightRef.current();
        else onSwipeLeftRef.current();
        setDragX(0);
        setDragY(0);
        isFlying.current = false;
      }, 350);
    } else {
      setDragX(0);
      setDragY(0);
    }
  }, [isDragging, threshold]);

  useEffect(() => {
    if (!isDragging) return;
    const mm = (e: MouseEvent) => onMove(e.clientX);
    const mu = () => onEnd();
    const tm = (e: TouchEvent) => onMove(e.touches[0].clientX);
    const te = () => onEnd();
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    window.addEventListener('touchmove', tm, { passive: true });
    window.addEventListener('touchend', te);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
      window.removeEventListener('touchmove', tm);
      window.removeEventListener('touchend', te);
    };
  }, [isDragging, onMove, onEnd]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled || isFlying.current) return;
      e.preventDefault();
      startX.current = e.clientX;
      dragXRef.current = 0;
      setIsDragging(true);
    },
    [enabled],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || isFlying.current) return;
      startX.current = e.touches[0].clientX;
      dragXRef.current = 0;
      setIsDragging(true);
    },
    [enabled],
  );

  return { dragX, dragY, isDragging, handlers: { onMouseDown, onTouchStart } };
}
