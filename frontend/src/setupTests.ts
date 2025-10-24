// Provide a noop implementation for requestAnimationFrame in the test environment
if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 0)
}
