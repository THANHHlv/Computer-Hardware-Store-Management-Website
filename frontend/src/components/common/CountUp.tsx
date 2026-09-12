import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (val: number) => string;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  duration = 1000,
  prefix = '',
  suffix = '',
  formatter,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(shouldReduceMotion ? end : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(end);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration, shouldReduceMotion]);

  const displayValue = formatter ? formatter(count) : count.toLocaleString('vi-VN');

  return (
    <span className="tabular-nums font-mono-numbers">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

export default CountUp;
