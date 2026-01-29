// ============================================================================
// Cover Image Generator - Pattern Drawing Utilities
// ============================================================================

type CanvasContext = CanvasRenderingContext2D;

/**
 * Draw dots pattern on canvas
 */
function drawDots(ctx: CanvasContext, width: number, height: number): void {
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  for (let x = 10; x < width; x += 20) {
    for (let y = 10; y < height; y += 20) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Draw grid pattern on canvas
 */
function drawGrid(ctx: CanvasContext, width: number, height: number): void {
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Draw diagonal lines pattern on canvas
 */
function drawDiagonal(ctx: CanvasContext, width: number, height: number): void {
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;

  for (let i = -height; i < width + height; i += 15) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }
}

/**
 * Draw a single hexagon
 */
function drawSingleHexagon(
  ctx: CanvasContext,
  x: number,
  y: number,
  size: number,
): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

/**
 * Draw hexagons pattern on canvas
 */
function drawHexagons(ctx: CanvasContext, width: number, height: number): void {
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  const size = 20;
  const h = size * Math.sqrt(3);

  for (let row = 0; row < height / h + 1; row++) {
    for (let col = 0; col < width / (size * 1.5) + 1; col++) {
      const x = col * size * 1.5;
      const y = row * h + (col % 2 === 1 ? h / 2 : 0);
      drawSingleHexagon(ctx, x, y, size * 0.8);
    }
  }
}

/**
 * Draw triangles pattern on canvas
 */
function drawTriangles(
  ctx: CanvasContext,
  width: number,
  height: number,
): void {
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  const size = 36;

  for (let y = 0; y < height; y += size * 2) {
    for (let x = 0; x < width; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, y + size);
      ctx.lineTo(x + size / 2, y);
      ctx.lineTo(x + size, y + size);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/**
 * Draw crosses pattern on canvas
 */
function drawCrosses(ctx: CanvasContext, width: number, height: number): void {
  ctx.fillStyle = "rgba(255,255,255,0.4)";

  for (let y = 20; y < height; y += 40) {
    for (let x = 20; x < width; x += 40) {
      ctx.fillRect(x - 1, y - 5, 2, 10);
      ctx.fillRect(x - 5, y - 1, 10, 2);
    }
  }
}

/**
 * Draw waves pattern on canvas
 */
function drawWaves(ctx: CanvasContext, width: number, height: number): void {
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2;

  for (let y = 50; y < height; y += 60) {
    ctx.beginPath();
    for (let x = 0; x < width; x += 5) {
      const waveY = y + Math.sin(x * 0.02) * 15;
      if (x === 0) ctx.moveTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.stroke();
  }
}

/**
 * Draw circuit board pattern on canvas
 */
function drawCircuit(ctx: CanvasContext, width: number, height: number): void {
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;

  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const length = 30 + Math.random() * 80;
    const isVertical = Math.random() > 0.5;

    ctx.beginPath();
    ctx.moveTo(x, y);
    if (isVertical) {
      ctx.lineTo(x, y + length);
    } else {
      ctx.lineTo(x + length, y);
    }
    ctx.stroke();

    // Draw endpoint circle
    ctx.beginPath();
    ctx.arc(
      isVertical ? x : x + length,
      isVertical ? y + length : y,
      3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

/**
 * Draw topography pattern on canvas
 */
function drawTopography(
  ctx: CanvasContext,
  width: number,
  height: number,
): void {
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;

  for (let i = 0; i < 8; i++) {
    const centerX = width / 2 + (Math.random() - 0.5) * width * 0.5;
    const centerY = height / 2 + (Math.random() - 0.5) * height * 0.5;

    for (let r = 30; r < 200; r += 25) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

/**
 * Draw noise/grain pattern on canvas
 */
function drawNoise(ctx: CanvasContext, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 30;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Draw confetti pattern on canvas
 */
function drawConfetti(ctx: CanvasContext, width: number, height: number): void {
  const colors = [
    "rgba(255,255,255,0.6)",
    "rgba(255,200,200,0.5)",
    "rgba(200,255,200,0.5)",
    "rgba(200,200,255,0.5)",
  ];

  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 3 + Math.random() * 8;
    const rotation = Math.random() * Math.PI;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillRect(-size / 2, -size / 4, size, size / 2);
    ctx.restore();
  }
}

// Pattern drawing function map for cleaner lookup
const PATTERN_DRAWERS: Record<
  string,
  (ctx: CanvasContext, width: number, height: number) => void
> = {
  dots: drawDots,
  grid: drawGrid,
  diagonal: drawDiagonal,
  hexagons: drawHexagons,
  triangles: drawTriangles,
  crosses: drawCrosses,
  waves: drawWaves,
  circuit: drawCircuit,
  topography: drawTopography,
  noise: drawNoise,
  confetti: drawConfetti,
};

/**
 * Draw pattern overlay on canvas with given opacity
 */
export function drawPattern(
  ctx: CanvasContext,
  patternId: string,
  width: number,
  height: number,
  opacity: number,
): void {
  if (patternId === "none" || !PATTERN_DRAWERS[patternId]) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  PATTERN_DRAWERS[patternId](ctx, width, height);
  ctx.restore();
}

/**
 * Get pattern CSS for preview (SVG-based)
 */
export function getPatternSVG(patternId: string, opacity: number): string {
  const o = opacity;

  const patterns: Record<string, string> = {
    dots: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='rgba(255,255,255,${o})' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
    grid: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(255,255,255,${o})' stroke-width='1'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
    diagonal: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10L10 0' stroke='rgba(255,255,255,${o})' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
    waves: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.353 0 16.36 1.347 25.96 4.937l1.768.661c.368.138.73.272 1.088.402-.357.13-.72.264-1.088.403l-1.768.66C66.36 24.653 60.353 26 50 26c-10.353 0-16.36-1.347-25.96-4.937l-1.768-.661c-.368-.138-.73-.272-1.088-.402zM0 1.988c.357-.13.72-.264 1.088-.402l1.768-.661C12.456.335 18.463-1.012 28.817-1.012c10.353 0 16.36 1.347 25.96 4.937l1.768.661c.368.138.73.272 1.088.402-.357.13-.72.264-1.088.403l-1.768.66C45.177 9.642 39.169 10.988 28.817 10.988c-10.353 0-16.36-1.347-25.96-4.937l-1.768-.661C.722 5.252.358 5.118 0 4.988V1.988z' fill='rgba(255,255,255,${o})' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    circuit: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='60' height='60'%3E%3Cpath fill='rgba(255,255,255,${o})' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0z'/%3E%3C/svg%3E")`,
    topography: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 600 600'%3E%3Cpath fill='none' stroke='rgba(255,255,255,${o})' stroke-width='2' d='M239.053 300c0-33.687-27.366-61.053-61.053-61.053S117 266.313 117 300s27.366 61.053 61.053 61.053c33.614-.07 60.983-27.44 61.053-61.053zm244.947 0c0-33.687-27.366-61.053-61.053-61.053-33.687 0-61.053 27.366-61.053 61.053s27.366 61.053 61.053 61.053c33.614-.07 60.983-27.44 61.053-61.053z'/%3E%3C/svg%3E")`,
    hexagons: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='rgba(255,255,255,${o})' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    triangles: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='72' viewBox='0 0 36 72'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='rgba(255,255,255,${o})'%3E%3Cpath d='M2 6h12L8 18 2 6zm18 36h12l-6 12-6-12z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    crosses: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='rgba(255,255,255,${o})' fill-rule='evenodd'%3E%3Cpath d='M20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/svg%3E")`,
    noise: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${o}'/%3E%3C/svg%3E")`,
    confetti: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='rgba(255,255,255,${o})'%3E%3Cpath d='M0 38.6l2.8-2.8 1.4 1.4L1.4 40H0v-1.4zm10-10l2.8-2.8 1.4 1.4L11.4 30H10v-1.4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  };

  return patterns[patternId] || "none";
}
