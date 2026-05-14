(function () {
  const hero = document.querySelector('#hero .hero-carousel');
  const slides = hero ? Array.from(hero.querySelectorAll('.hero-slide')) : [];
  let activeSlide = 0;

  const isLoaded = (img) => img.complete && img.naturalWidth > 0;

  const showSlide = (nextIndex) => {
    const nextSlide = slides[nextIndex];
    const currentSlide = slides[activeSlide];

    if (!nextSlide) return;

    if (!isLoaded(nextSlide)) {
      nextSlide.addEventListener(
        'load',
        () => {
          currentSlide.classList.remove('is-active');
          nextSlide.classList.add('is-active');
          activeSlide = nextIndex;
        },
        { once: true }
      );
      return;
    }

    currentSlide.classList.remove('is-active');
    nextSlide.classList.add('is-active');
    activeSlide = nextIndex;
  };

  if (slides.length > 1) {
    window.setInterval(() => {
      const nextIndex = (activeSlide + 1) % slides.length;
      showSlide(nextIndex);
    }, 4000);
  }

  const audio = document.getElementById('proof-audio');
  const toggle = document.querySelector('.audio-toggle');
  const progress = document.querySelector('.audio-progress');
  const currentTime = document.querySelector('.audio-current');
  const durationTime = document.querySelector('.audio-duration');

  if (!audio || !toggle || !progress || !currentTime || !durationTime) {
    return;
  }

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  const setPlayingState = (isPlaying) => {
    toggle.classList.toggle('is-playing', isPlaying);
    toggle.setAttribute('aria-label', isPlaying ? 'Pausar áudio' : 'Reproduzir áudio');
  };

  const updateProgress = () => {
    const duration = audio.duration;
    const current = audio.currentTime;

    currentTime.textContent = formatTime(current);
    durationTime.textContent = formatTime(duration);

    const percent = Number.isFinite(duration) && duration > 0 ? (current / duration) * 100 : 0;
    progress.value = String(percent);
    progress.style.setProperty('--progress-percent', `${percent}%`);
  };

  const resetAfterError = () => {
    audio.pause();
    setPlayingState(false);
    progress.value = '0';
    progress.style.setProperty('--progress-percent', '0%');
  };

  toggle.addEventListener('click', async () => {
    if (!audio.paused) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
    } catch (_error) {
      resetAfterError();
    }
  });

  progress.addEventListener('input', () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
      progress.value = '0';
      progress.style.setProperty('--progress-percent', '0%');
      return;
    }

    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
    updateProgress();
  });

  audio.addEventListener('play', () => setPlayingState(true));
  audio.addEventListener('pause', () => setPlayingState(false));
  audio.addEventListener('ended', () => {
    setPlayingState(false);
    updateProgress();
  });
  audio.addEventListener('loadedmetadata', updateProgress);
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('error', resetAfterError);

  const source = audio.querySelector('source');
  if (source) {
    source.addEventListener('error', resetAfterError);
  }

  updateProgress();
})();