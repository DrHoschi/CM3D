export const ARC_RENDER_SEGMENTS = 64;

const TAU = Math.PI * 2;
const positiveAngle = value => ((value % TAU) + TAU) % TAU;

export function buildArcRenderPoints(start, end, control, segments = ARC_RENDER_SEGMENTS) {
  const ax = Number(start?.x), ay = Number(start?.y);
  const bx = Number(end?.x), by = Number(end?.y);
  const cx = Number(control?.x), cy = Number(control?.y);
  if (![ax, ay, bx, by, cx, cy].every(Number.isFinite)) return [];

  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (d === 0) return [];
  const a2 = ax * ax + ay * ay, b2 = bx * bx + by * by, c2 = cx * cx + cy * cy;
  const ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d;
  const uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
  const radius = Math.hypot(ax - ux, ay - uy);
  if (!(radius > 0)) return [];

  const startAngle = Math.atan2(ay - uy, ax - ux);
  const endAngle = Math.atan2(by - uy, bx - ux);
  const controlAngle = Math.atan2(cy - uy, cx - ux);
  const ccwSweep = positiveAngle(endAngle - startAngle);
  const controlFromStart = positiveAngle(controlAngle - startAngle);
  const sweep = controlFromStart <= ccwSweep ? ccwSweep : ccwSweep - TAU;
  if (sweep === 0) return [];

  const count = Math.max(8, Math.floor(Number(segments) || ARC_RENDER_SEGMENTS));
  const points = [];
  for (let index = 0; index <= count; index += 1) {
    const angle = startAngle + sweep * (index / count);
    points.push({ x: ux + Math.cos(angle) * radius, y: uy + Math.sin(angle) * radius });
  }
  return points;
}
