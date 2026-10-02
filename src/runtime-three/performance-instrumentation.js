const DEFAULT_WINDOW = 60;

const finite = value => Number.isFinite(value) ? value : 0;

export function createPerformanceInstrumentation(runtime, options = {}) {
  const sampleWindow = Math.max(2, Number(options.sampleWindow) || DEFAULT_WINDOW);
  const frameTimes = [];
  let previousTime = null;
  let rafId = null;
  let disposed = false;

  const tick = now => {
    if (disposed) return;
    if (previousTime != null) {
      frameTimes.push(Math.max(0, now - previousTime));
      if (frameTimes.length > sampleWindow) frameTimes.splice(0, frameTimes.length - sampleWindow);
    }
    previousTime = now;
    rafId = requestAnimationFrame(tick);
  };

  const snapshot = () => {
    const averageFrameMs = frameTimes.length
      ? frameTimes.reduce((sum, value) => sum + value, 0) / frameTimes.length
      : 0;
    const render = runtime?.renderer?.info?.render ?? {};
    const memory = runtime?.renderer?.info?.memory ?? {};
    const sceneObjects = runtime?.store?.project?.scene?.objects ?? {};
    return Object.freeze({
      sampleCount: frameTimes.length,
      frameMs: finite(averageFrameMs),
      fps: averageFrameMs > 0 ? finite(1000 / averageFrameMs) : 0,
      objectCount: Object.keys(sceneObjects).length,
      runtimeNodeCount: runtime?.objectMap?.size ?? 0,
      pickableCount: runtime?.pickables?.length ?? 0,
      drawCalls: finite(render.calls),
      triangles: finite(render.triangles),
      lines: finite(render.lines),
      points: finite(render.points),
      geometries: finite(memory.geometries),
      textures: finite(memory.textures)
    });
  };

  if (typeof requestAnimationFrame === 'function') rafId = requestAnimationFrame(tick);

  return {
    snapshot,
    dispose() {
      disposed = true;
      if (rafId != null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}

export function installPerformanceInstrumentation(runtime, options = {}) {
  if (!runtime) return null;
  if (runtime.performanceInstrumentation) return runtime.performanceInstrumentation;
  const instrumentation = createPerformanceInstrumentation(runtime, options);
  runtime.performanceInstrumentation = instrumentation;
  runtime.getPerformanceSnapshot = instrumentation.snapshot;
  return instrumentation;
}
