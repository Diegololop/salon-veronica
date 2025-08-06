import { useState, useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  index: number;
}

interface PatternLockProps {
  value: string;
  onChange: (pattern: string) => void;
  size?: number;
}

export function PatternLock({ value, onChange, size = 240 }: PatternLockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pattern, setPattern] = useState<number[]>([]);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  const points: Point[] = [];
  const pointRadius = size / 20;
  const padding = size / 10;

  // Generate grid points
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    points.push({
      x: padding + col * ((size - 2 * padding) / 2),
      y: padding + row * ((size - 2 * padding) / 2),
      index: i + 1,
    });
  }

  useEffect(() => {
    if (value) {
      const numbers = value.split('-').map(Number);
      setPattern(numbers);
      drawPattern(numbers);
    }
  }, [value]);

  const drawPattern = (currentPattern: number[], animatedPoint?: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw points
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
      ctx.fillStyle = currentPattern.includes(point.index) ? '#2563eb' : '#e5e7eb';
      ctx.fill();
      ctx.strokeStyle = '#d1d5db';
      ctx.stroke();
    });

    // Draw lines connecting points
    if (currentPattern.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;

      const firstPoint = points.find((p) => p.index === currentPattern[0]);
      if (firstPoint) {
        ctx.moveTo(firstPoint.x, firstPoint.y);

        currentPattern.slice(1).forEach((index) => {
          const point = points.find((p) => p.index === index);
          if (point) {
            ctx.lineTo(point.x, point.y);
          }
        });

        if (animatedPoint) {
          ctx.lineTo(animatedPoint.x, animatedPoint.y);
        }

        ctx.stroke();
      }
    }
  };

  const animatePattern = (pattern: number[]) => {
    setIsAnimating(true);
    const patternPoints = pattern.map((index) => points.find((p) => p.index === index)!);
    let currentIndex = 0;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const duration = 300; // Duración entre puntos (en milisegundos)

      if (currentIndex < patternPoints.length - 1) {
        const startPoint = patternPoints[currentIndex];
        const endPoint = patternPoints[currentIndex + 1];
        const t = Math.min(progress / duration, 1);

        // Interpolación lineal entre los puntos
        const animatedPoint = {
          x: startPoint.x + (endPoint.x - startPoint.x) * t,
          y: startPoint.y + (endPoint.y - startPoint.y) * t,
        };

        // Dibujar el patrón hasta el punto actual
        const partialPattern = pattern.slice(0, currentIndex + 1);
        drawPattern(partialPattern, animatedPoint);

        if (t === 1) {
          currentIndex++;
          startTime = timestamp;
        }

        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        drawPattern(pattern); // Dibujar el patrón completo al finalizar
      }
    };

    // Limpiar el canvas antes de iniciar la animación
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, size, size);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  const getPointAtPosition = (x: number, y: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const canvasX = x - rect.left;
    const canvasY = y - rect.top;

    return points.find((point) => {
      const distance = Math.sqrt(
        Math.pow(point.x - canvasX, 2) + Math.pow(point.y - canvasY, 2)
      );
      return distance < pointRadius * 1.5;
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isAnimating) return;

    const point = getPointAtPosition(e.clientX, e.clientY);
    if (point && !pattern.includes(point.index)) {
      setIsDrawing(true);
      setPattern([point.index]);
      drawPattern([point.index]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isAnimating) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPoint({ x, y });

    const point = getPointAtPosition(e.clientX, e.clientY);
    if (point && !pattern.includes(point.index)) {
      const newPattern = [...pattern, point.index];
      setPattern(newPattern);
      drawPattern(newPattern);
    } else {
      drawPattern(pattern);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && !isAnimating) {
      setIsDrawing(false);
      setCurrentPoint(null);
      if (pattern.length > 0) {
        onChange(pattern.join('-'));
      }
      drawPattern(pattern);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isAnimating) return;

    e.preventDefault();
    const touch = e.touches[0];
    const point = getPointAtPosition(touch.clientX, touch.clientY);
    if (point && !pattern.includes(point.index)) {
      setIsDrawing(true);
      setPattern([point.index]);
      drawPattern([point.index]);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isAnimating) return;

    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setCurrentPoint({ x, y });

    const point = getPointAtPosition(touch.clientX, touch.clientY);
    if (point && !pattern.includes(point.index)) {
      const newPattern = [...pattern, point.index];
      setPattern(newPattern);
      drawPattern(newPattern);
    } else {
      drawPattern(pattern);
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const handleReset = () => {
    setPattern([]);
    setCurrentPoint(null);
    onChange('');
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, size, size);
        drawPattern([]);
      }
    }
  };

  const handleReplay = () => {
    if (pattern.length > 0) {
      animatePattern(pattern);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="touch-none bg-white rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          title="Reiniciar patrón"
        >
          <RotateCcw className="h-5 w-5 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={handleReplay}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          title="Reproducir patrón"
        >
          ▶️
        </button>
      </div>
    </div>
  );
}