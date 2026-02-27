import { ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, PanInfo, useDragControls } from 'framer-motion';

const EDGE_ACTIVATION_PX = 20;

interface SwipeBackWrapperProps {
  children: ReactNode;
}

export function SwipeBackWrapper({ children }: SwipeBackWrapperProps) {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const dragControls = useDragControls();

  const shadowOpacity = useTransform(x, [0, 100], [0, 0.3]);
  const childScale = useTransform(x, [0, 300], [1, 0.95]);

  const handleEdgePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.clientX < EDGE_ACTIVATION_PX) {
      dragControls.start(e.nativeEvent);
    }
  }, [dragControls]);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = window.innerWidth * 0.35;
    if (info.offset.x > threshold || (info.offset.x > 80 && info.velocity.x > 400)) {
      navigate(-1);
    }
  }, [navigate]);

  return (
    <div className="relative overflow-hidden">
      {/* Left-edge hit area: only touches starting here activate swipe-back */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[20px] z-20 cursor-grab active:cursor-grabbing"
        onPointerDown={handleEdgePointerDown}
        aria-hidden
      />
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent 20%)',
          opacity: shadowOpacity,
        }}
      />
      <motion.div
        drag="x"
        dragControls={dragControls}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.6 }}
        onDragEnd={handleDragEnd}
        style={{ x, scale: childScale }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
}
