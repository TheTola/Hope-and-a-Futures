
// script.js
console.log("🔧 script.js loaded");

document.addEventListener('DOMContentLoaded', () => {
  // ───────────────────────────────────────────────────────────
  // grab all elements
  const slides         = document.querySelectorAll('.slide');
  const prevBtn        = document.getElementById('prev');
  const nextBtn        = document.getElementById('next');
  const progress       = document.getElementById('progress');
  const closeText      = document.getElementById('close-text');
  const openText       = document.getElementById('open-text');
  const music          = document.getElementById('bg-music') || new Audio();
  const slider         = document.getElementById('volume-slider');
  const icon           = document.getElementById('volume-icon');
  const curtainOverlay = document.getElementById('curtain-overlay');
  const curtainLeft    = document.getElementById('curtain-left');
  const curtainRight   = document.getElementById('curtain-right');
  const beginButton    = document.getElementById('begin-button');

  console.log("🔧 begin-button element:", beginButton);
  if (beginButton) {
    beginButton.addEventListener('click', openCurtain);
    beginButton.addEventListener('pointerdown', openCurtain);
    beginButton.addEventListener('touchstart',  openCurtain);
    console.log("🔧 openCurtain() listener attached to begin-button");
  }

  if (curtainOverlay) {
    // allow clicking anywhere on the overlay to open
    curtainOverlay.addEventListener('click', openCurtain);
    curtainOverlay.addEventListener('pointerdown', openCurtain);
    curtainOverlay.addEventListener('touchstart',  openCurtain);
    console.log("🔧 openCurtain() listener attached to overlay");
  }

  let current = 0;
  const total = slides.length;
  let opened  = false;

  // ───────────────────────────────────────────────────────────
  function updateProgress() {
    progress.textContent = `Page ${current + 1} of ${total}`;
  }

  // ───────────────────────────────────────────────────────────
  function manageTextWallButton(idx) {
    const panel = document.querySelector('.text-wall');
    const hidden = !panel.style.display || panel.style.display === 'none';
    openText.style.display = (idx === 2 && hidden) ? 'block' : 'none';
  }

  // ───────────────────────────────────────────────────────────
  function showSlide(idx) {
    const nextIdx = ((idx % total) + total) % total;
    if (nextIdx === current) {
      slides[nextIdx].classList.add('active');
      updateProgress();
      manageTextWallButton(nextIdx);
      return;
    }
    const old = slides[current];
    const nw  = slides[nextIdx];
    old.classList.add('flip-out');
    old.addEventListener('animationend', function onOut() {
      old.removeEventListener('animationend', onOut);
      old.classList.remove('active', 'flip-out');
      nw.classList.add('active', 'flip-in');
      nw.addEventListener('animationend', function onIn() {
        nw.removeEventListener('animationend', onIn);
        nw.classList.remove('flip-in');
        current = nextIdx;
        updateProgress();
        manageTextWallButton(current);
      });
    });
  }

  // ───────────────────────────────────────────────────────────
  const flipSounds = Array.from({ length: 10 }, (_, i) =>
    new Audio(`gallery/sounds/flip${i + 1}.mp3`)
  );

  function playFlipSound() {
    const snd = flipSounds[Math.floor(Math.random() * flipSounds.length)];
    snd.load();
    snd.play().catch(err => console.warn("Flip sound blocked:", err));
  }

  // ───────────────────────────────────────────────────────────
  function openCurtain() {
    if (opened) return;
    opened = true;
    curtainLeft.style.animation  = 'slideLeft 2s forwards';
    curtainRight.style.animation = 'slideRight 2s forwards';
    curtainRight.addEventListener('animationend', () => {
      curtainOverlay.style.display = 'none';
    }, { once: true });

    curtainLeft.addEventListener('animationstart', () => {
      const gliss = new Audio('gallery/sounds/glissando.mp3');
      gliss.volume = 0.3;
      gliss.load();
      gliss.play().catch(err => console.warn("Autoplay blocked:", err));
      setTimeout(() => {
        let step = 0;
        const fadeOut = setInterval(() => {
          gliss.volume = Math.max(0, 0.8 * (1 - ++step / 20));
          if (step >= 20) {
            clearInterval(fadeOut);
            gliss.pause();
            gliss.currentTime = 0;


    // Force load + play music
    music.load();
    music.play();

            const startingVolume = loadVolumeFromStorage();
            fadeToVolume(startingVolume, 2000);
          }
        }, 2000 / 20);
      }, 4000);
    }, { once: true });
  }

  // ───────────────────────────────────────────────────────────
function loadVolumeFromStorage() {
  const v = localStorage.getItem('eletter_volume');
  return v !== null ? parseFloat(v) : INITIAL_VOLUME;
}
  function saveVolumeToStorage(vol) {
    localStorage.setItem('eletter_volume', vol);
  }
  function fadeToVolume(target, duration = 300) {
    const steps = 20;
    const delta = (target - music.volume) / steps;
    let i = 0;
    const iv = setInterval(() => {
      music.volume = Math.min(1, Math.max(0, music.volume + delta));
      if (++i >= steps) {
        clearInterval(iv);
        music.volume = target;
      }
    }, duration / steps);
  }
  function handleVolumeChange(val) {
    const vol = parseInt(val) / 100;
    music.volume = vol;
    saveVolumeToStorage(vol);
    icon.src = vol === 0 ? 'gallery/icons/voloff.png' : 'gallery/icons/volon.png';
  }

  // ───────────────────────────────────────────────────────────
  prevBtn .addEventListener('click', () => { playFlipSound(); showSlide(current - 1); });
  nextBtn .addEventListener('click', () => { playFlipSound(); showSlide(current + 1); });
  closeText.addEventListener('click',   () => {
    document.querySelector('.text-wall').style.display = 'none';
    closeText.style.display = 'none';
    if (current === 2) openText.style.display = 'block';
  });
  openText .addEventListener('click',   () => {
    document.querySelector('.text-wall').style.display = 'block';
    closeText.style.display = 'block';
    openText.style.display = 'none';
  });
  icon     .addEventListener('click',   () => {
    slider.style.display = slider.style.display === 'block' ? 'none' : 'block';
  });
  slider   .addEventListener('input', e => handleVolumeChange(e.target.value));
  document.addEventListener('keydown',  e => {
    if (e.key === 'ArrowLeft')        { playFlipSound(); showSlide(current - 1); }
    if (['ArrowRight', ' ', 'Enter'].includes(e.key)) {
      playFlipSound(); showSlide(current + 1);
    }
  });

  // ───────────────────────────────────────────────────────────
  const startingVolume = loadVolumeFromStorage();
  slider.value         = startingVolume * 100;
  music.volume         = startingVolume;
  icon.src             = startingVolume === 0 ? 'gallery/icons/voloff.png' : 'gallery/icons/volon.png';
  slider.style.display = 'none';

  showSlide(0);
});
