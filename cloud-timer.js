/* Head in the Clouds — layered PNG cloud timer.
   Uses the original 360x240 art; no SVG tracing needed.
   window.updateCloudTimer(ratio) accepts a number from 0 to 1.
*/
(() => {
  const mount = document.getElementById('cloud-timer-mount');
  if (!mount || mount.dataset.ready === 'true') return;
  mount.dataset.ready = 'true';

  const wrapper = document.createElement('div');
  wrapper.className = 'cloud-timer-widget';
  wrapper.innerHTML = `
    <div class="cloud-timer-art" role="img" aria-label="Cloud timer with progress border and animated face">
      <img class="cloud-timer-layer cloud-timer-progress" src="Images/ProgressColor.png" alt="" draggable="false">
      <img class="cloud-timer-layer cloud-timer-body" src="Images/CloudBase.png" alt="" draggable="false">
      <div class="cloud-timer-face">
        <img class="cloud-timer-layer cloud-timer-eyes" src="Images/Eyes.png" alt="" draggable="false">
        <img class="cloud-timer-layer cloud-timer-mouth" src="Images/Mouth.png" alt="" draggable="false">
      </div>
    </div>`;
  mount.appendChild(wrapper);

  const progressLayer = wrapper.querySelector('.cloud-timer-progress');
  const face = wrapper.querySelector('.cloud-timer-face');
  const eyes = wrapper.querySelector('.cloud-timer-eyes');
  let alive = true;
  let blinkTimer;
  let lookTimer;
  let blinkDoneTimer;

  window.updateCloudTimer = (ratio) => {
    const value = Math.max(0, Math.min(1, Number(ratio) || 0));
    progressLayer.style.clipPath = `inset(0 ${(100 - value * 100).toFixed(3)}% 0 0)`;
    const label = document.getElementById('cloud-timer-percent');
    if (label) label.textContent = `${Math.round(value * 100)}% complete`;
  };
  window.updateCloudTimer(0);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scheduleBlink = () => {
    if (!alive || reduceMotion.matches) return;
    blinkTimer = setTimeout(() => {
      eyes.classList.remove('is-blinking');
      void eyes.offsetWidth; // restart one blink, if needed
      eyes.classList.add('is-blinking');
      blinkDoneTimer = setTimeout(() => {
        eyes.classList.remove('is-blinking');
        scheduleBlink();
      }, 420);
    }, 3000 + Math.random() * 2000); // one blink every 3–5s
  };

  // Coordinates in 360x240 artwork pixels; minimal face travel.
  const poses = [[0, 0], [-3, -2], [4, 0], [0, 0]];
  const scheduleLook = () => {
    if (!alive || reduceMotion.matches) return;
    lookTimer = setTimeout(() => {
      const [x, y] = poses[Math.floor(Math.random() * poses.length)];
      // % transforms scale with image size, preserving relative motion.
      face.style.transform = `translate(${(x / 360 * 100).toFixed(3)}%, ${(y / 240 * 100).toFixed(3)}%)`;
      scheduleLook();
    }, 2800 + Math.random() * 2300);
  };
  scheduleBlink();
  scheduleLook();

  // Optional teardown for a dynamically removed widget.
  window.destroyCloudTimer = () => {
    alive = false;
    clearTimeout(blinkTimer);
    clearTimeout(blinkDoneTimer);
    clearTimeout(lookTimer);
    delete window.updateCloudTimer;
    delete window.destroyCloudTimer;
    mount.dataset.ready = 'false';
    wrapper.remove();
  };
})();
