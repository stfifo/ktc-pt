(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const bar = document.getElementById('bar');
  const counter = document.getElementById('counter');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const notesPanel = document.getElementById('notesPanel');
  const notesText = document.getElementById('notesText');
  const videoBox = document.getElementById('videoBox');
  const video = document.getElementById('demoVideo');
  const secnav = document.getElementById('secnav');
  const secItems = Array.from(secnav.querySelectorAll('[data-sec]'));
  let current = 0;

  const fromHash = () => {
    const n = parseInt(location.hash.slice(1), 10);
    return Number.isInteger(n) ? Math.min(Math.max(n - 1, 0), slides.length - 1) : 0;
  };

  const updateNotes = () => {
    const note = slides[current].querySelector('.notes');
    notesText.textContent = note ? note.textContent.trim() : '';
  };

  const render = () => {
    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === current);
      s.classList.toggle('is-past', i < current);
      s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    });
    bar.style.width = `${((current + 1) / slides.length) * 100}%`;
    counter.textContent = `${current + 1} / ${slides.length}`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === slides.length - 1;
    document.body.classList.toggle('on-dark', slides[current].classList.contains('slide--dark'));
    const sec = slides[current].dataset.sec;
    secnav.hidden = !sec;
    secItems.forEach((el) => el.classList.toggle('is-current', el.dataset.sec === sec));
    if (video && !slides[current].contains(video)) video.pause();
    updateNotes();
  };

  const go = (index) => {
    current = Math.min(Math.max(index, 0), slides.length - 1);
    history.replaceState(null, '', `#${current + 1}`);
    render();
  };

  const toggleNotes = () => {
    notesPanel.hidden = !notesPanel.hidden;
    document.body.classList.toggle('notes-open', !notesPanel.hidden);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  prevBtn.addEventListener('click', () => go(current - 1));
  nextBtn.addEventListener('click', () => go(current + 1));

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        go(current + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        go(current - 1);
        break;
      case 'Home': go(0); break;
      case 'End': go(slides.length - 1); break;
      case 'n':
      case 'N': toggleNotes(); break;
      case 'f':
      case 'F': toggleFullscreen(); break;
      case 'p':
      case 'P':
        if (video && slides[current].contains(video) && videoBox.classList.contains('has-video')) {
          video.paused ? video.play() : video.pause();
        }
        break;
    }
  });

  // 터치 스와이프
  let startX = null;
  document.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
    startX = null;
  });

  // 영상 파일이 있을 때만 플레이어를 보여준다
  if (video) {
    video.addEventListener('loadedmetadata', () => videoBox.classList.add('has-video'));
    video.addEventListener('error', () => videoBox.classList.remove('has-video'));
    // 영상 컨트롤을 눌렀을 때 슬라이드 키 이벤트와 겹치지 않게 포커스를 풀어 준다
    video.addEventListener('click', () => video.blur());
  }

  // 05~07 섹션(10~19번) 슬라이드의 h2를 12번(수집) 슬라이드 h2의 위치로 옮긴다.
  // transform 은 레이아웃에 영향을 주지 않으므로 본문은 원래 자리에 그대로 있다.
  const pinTitles = () => {
    const pinned = slides.filter((s) => ['5', '6', '7'].includes(s.dataset.sec));
    const ref = slides.find((s) => s.classList.contains('slide--wf'));
    if (!ref || !pinned.length) return;
    const place = (s) => {
      const h = s.querySelector('h2');
      if (!h) return null;
      h.style.transform = 'none';
      const sr = s.getBoundingClientRect();
      const hr = h.getBoundingClientRect();
      return { h, x: hr.left - sr.left, y: hr.top - sr.top };
    };
    const target = place(ref);
    if (!target) return;
    pinned.forEach((s) => {
      const p = place(s);
      if (p) p.h.style.transform = `translate(${target.x - p.x}px, ${target.y - p.y}px)`;
    });
  };
  window.addEventListener('resize', pinTitles);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pinTitles);
  pinTitles();

  window.addEventListener('hashchange', () => { current = fromHash(); render(); });

  current = fromHash();
  render();
})();
