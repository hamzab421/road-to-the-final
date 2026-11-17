// The answer's position and visible depth number move together from the surface.
export function dropAnswer({token,score,depth,onFinish = () => {}},clock = {
  now:()=>performance.now(), request:callback=>requestAnimationFrame(callback), cancel:id=>cancelAnimationFrame(id),
}) {
  const target = Math.max(0,Math.min(100,Number(depth)||0));
  const start = clock.now() + 600;
  const duration = 2400;
  let frame;
  let finished = false;
  function show(value) {
    token.style.top = value.toFixed(3) + '%';
    score.textContent = String(Math.round(value));
  }
  function finish() {
    if (finished) return;
    finished = true;
    clock.cancel(frame);
    show(target);
    onFinish();
  }
  show(0);
  function tick(now) {
    if (!token.isConnected) { finish(); return; }
    const progress = Math.max(0,Math.min(1,(now-start)/duration));
    const eased = progress*progress*(3-2*progress);
    show(target*eased);
    if (progress < 1) frame = clock.request(tick);
    else finish();
  }
  frame = clock.request(tick);
  return finish;
}
