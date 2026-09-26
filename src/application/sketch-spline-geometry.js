export const SPLINE_RENDER_SEGMENTS = 64;

export function deCasteljau(points, t) {
  let level = points.map(point => ({ x: Number(point?.x), y: Number(point?.y) }));
  if (!level.length || level.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) return null;
  const parameter = Number(t);
  if (!Number.isFinite(parameter)) return null;
  while (level.length > 1) {
    const next = [];
    for (let index = 0; index < level.length - 1; index += 1) {
      next.push({
        x: level[index].x + (level[index + 1].x - level[index].x) * parameter,
        y: level[index].y + (level[index + 1].y - level[index].y) * parameter
      });
    }
    level = next;
  }
  return level[0] ?? null;
}

export function buildSplineRenderPoints(start, controls, end, segments = SPLINE_RENDER_SEGMENTS) {
  if (!start || !end || !Array.isArray(controls) || controls.length < 1) return [];
  const polygon = [start, ...controls, end];
  const count = Math.max(8, Math.floor(Number(segments) || SPLINE_RENDER_SEGMENTS));
  const result = [];
  for (let index = 0; index <= count; index += 1) {
    const point = deCasteljau(polygon, index / count);
    if (!point) return [];
    result.push(point);
  }
  return result;
}
