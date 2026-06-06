const AUTOPLAY_INTERVAL = 6500;
const PAUSE_AFTER_INTERACTION = 12000;

function normalizeKey(text) {
  return text.trim().toLowerCase().replace(/\s+/g, '-');
}

function parseSlides(block) {
  const rows = [...block.children];
  const slides = [];
  let current = null;

  rows.forEach((row) => {
    const cells = [...row.children];
    const keyCell = cells[0];
    const valueCell = cells[1];

    if (!keyCell) return;

    const key = normalizeKey(keyCell.textContent);
    const text = valueCell?.textContent.trim() || '';

    if (key === 'image') {
      current = {
        picture: valueCell?.querySelector('picture') || null,
        imagePosition: 'center',
        titleEl: null,
        titleColor: '',
        subtitleEl: null,
        subtitleColor: '',
        bodyEl: null,
        bodyColor: '',
        btn1Label: '',
        btn1Href: '',
        btn1Color: '',
        btn2Label: '',
        btn2Href: '',
        position: 'left',
      };
      slides.push(current);
    } else if (current) {
      if (key === 'image-position') {
        const allowed = ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'];
        current.imagePosition = allowed.includes(text.toLowerCase()) ? text.toLowerCase() : 'center';
      } else if (key === 'title') current.titleEl = valueCell?.firstElementChild || null;
      else if (key === 'title-color') current.titleColor = text;
      else if (key === 'subtitle') current.subtitleEl = valueCell?.firstElementChild || null;
      else if (key === 'subtitle-color') current.subtitleColor = text;
      else if (key === 'body') current.bodyEl = valueCell?.firstElementChild || null;
      else if (key === 'body-color') current.bodyColor = text;
      else if (key === 'button-1-label') current.btn1Label = text;
      else if (key === 'button-1-link') current.btn1Href = valueCell?.querySelector('a')?.href || text;
      else if (key === 'button-1-color') current.btn1Color = text;
      else if (key === 'button-2-label') current.btn2Label = text;
      else if (key === 'button-2-link') current.btn2Href = valueCell?.querySelector('a')?.href || text;
      else if (key === 'position') current.position = ['left', 'center', 'right'].includes(text.toLowerCase()) ? text.toLowerCase() : 'left';
    }
  });

  return slides;
}

function buildSlide(slide, index, totalDots, activeIndex) {
  const el = document.createElement('div');
  el.className = `carousel-slide position-${slide.position}`;
  if (index === activeIndex) el.classList.add('active');

  // Image
  const imageDiv = document.createElement('div');
  imageDiv.className = 'slide-image';
  if (slide.picture) {
    imageDiv.append(slide.picture);
    const img = imageDiv.querySelector('img');
    if (img) img.style.objectPosition = slide.imagePosition;
  }
  el.append(imageDiv);

  // Mobile dots (between image and overlay)
  const mobileDots = document.createElement('div');
  mobileDots.className = 'slide-dots';
  for (let i = 0; i < totalDots; i += 1) {
    const dot = document.createElement('button');
    dot.className = `carousel-dot${i === index ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.dataset.index = String(i);
    mobileDots.append(dot);
  }
  el.append(mobileDots);

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'slide-overlay';

  if (slide.titleEl) {
    slide.titleEl.className = 'slide-title';
    if (slide.titleColor) slide.titleEl.style.color = slide.titleColor;
    overlay.append(slide.titleEl);
  }

  if (slide.subtitleEl) {
    slide.subtitleEl.className = 'slide-subtitle';
    if (slide.subtitleColor) slide.subtitleEl.style.color = slide.subtitleColor;
    overlay.append(slide.subtitleEl);
  }

  if (slide.bodyEl) {
    slide.bodyEl.className = 'slide-body';
    if (slide.bodyColor) slide.bodyEl.style.color = slide.bodyColor;
    overlay.append(slide.bodyEl);
  }

  if (slide.btn1Label) {
    const btnsDiv = document.createElement('div');
    btnsDiv.className = 'slide-buttons';

    const btn1 = document.createElement('a');
    btn1.className = 'slide-btn-primary';
    btn1.textContent = slide.btn1Label;
    btn1.href = slide.btn1Href || '#';
    if (slide.btn1Color) btn1.style.setProperty('--slide-btn1-color', slide.btn1Color);
    btnsDiv.append(btn1);

    if (slide.btn2Label) {
      const btn2 = document.createElement('a');
      btn2.className = 'slide-btn-secondary';
      btn2.textContent = slide.btn2Label;
      btn2.href = slide.btn2Href || '#';
      btnsDiv.append(btn2);
    }

    overlay.append(btnsDiv);
  }

  el.append(overlay);
  return el;
}

export default function decorate(block) {
  const slides = parseSlides(block);
  if (!slides.length) return;

  const totalSlides = slides.length;
  let activeIndex = 0;
  let autoplayTimer = null;
  let pauseTimer = null;

  // Build DOM
  block.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'carousel-container';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  slides.forEach((slide, i) => {
    track.append(buildSlide(slide, i, totalSlides, activeIndex));
  });

  container.append(track);

  // Arrows (only if multiple slides)
  if (totalSlides > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-prev';
    prevBtn.setAttribute('aria-label', 'Previous slide');
    prevBtn.innerHTML = '&#8249;';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-next';
    nextBtn.setAttribute('aria-label', 'Next slide');
    nextBtn.innerHTML = '&#8250;';

    container.append(prevBtn, nextBtn);
  }

  block.append(container);

  // Desktop dots
  const desktopDots = document.createElement('div');
  desktopDots.className = 'carousel-dots';
  if (totalSlides > 1) {
    for (let i = 0; i < totalSlides; i += 1) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.dataset.index = String(i);
      desktopDots.append(dot);
    }
  }
  block.append(desktopDots);

  function goTo(index) {
    const slideEls = track.querySelectorAll('.carousel-slide');
    const allDots = block.querySelectorAll('.carousel-dot');

    slideEls[activeIndex]?.classList.remove('active');
    allDots.forEach((d) => { if (String(d.dataset.index) === String(activeIndex)) d.classList.remove('active'); });

    activeIndex = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;

    slideEls[activeIndex]?.classList.add('active');
    allDots.forEach((d) => { if (String(d.dataset.index) === String(activeIndex)) d.classList.add('active'); });
  }

  function startAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => goTo(activeIndex + 1), AUTOPLAY_INTERVAL);
  }

  function pauseAndResume() {
    clearInterval(autoplayTimer);
    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(startAutoplay, PAUSE_AFTER_INTERACTION);
  }

  if (totalSlides > 1) {
    block.querySelector('.carousel-prev')?.addEventListener('click', () => { goTo(activeIndex - 1); pauseAndResume(); });
    block.querySelector('.carousel-next')?.addEventListener('click', () => { goTo(activeIndex + 1); pauseAndResume(); });

    block.addEventListener('click', (e) => {
      const dot = e.target.closest('.carousel-dot');
      if (dot) { goTo(Number(dot.dataset.index)); pauseAndResume(); }
    });

    startAutoplay();
  }
}
