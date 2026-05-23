import { fetchPlaceholders } from '../../scripts/aem.js';

function scrollSlider(block, direction) {
  const slidesWrapper = block.querySelector('.carousel-product-slides');
  const slide = block.querySelector('.carousel-product-slide');
  if (!slidesWrapper || !slide) return;

  const slideWidth = slide.offsetWidth;
  const gap = parseInt(getComputedStyle(slidesWrapper).gap, 10) || 29;
  const scrollAmount = (slideWidth + gap) * 3; // scroll 3 items at a time

  slidesWrapper.scrollBy({
    left: direction === 'next' ? scrollAmount : -scrollAmount,
    behavior: 'smooth',
  });
}

function updateButtonStates(block) {
  const slidesWrapper = block.querySelector('.carousel-product-slides');
  const prevBtn = block.querySelector('.slide-prev');
  const nextBtn = block.querySelector('.slide-next');
  if (!slidesWrapper || !prevBtn || !nextBtn) return;

  const { scrollLeft, scrollWidth, clientWidth } = slidesWrapper;
  prevBtn.disabled = scrollLeft <= 1;
  nextBtn.disabled = scrollLeft + clientWidth >= scrollWidth - 1;
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-product-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-product-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-product-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-product-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Product Slider');

  const container = document.createElement('div');
  container.classList.add('carousel-product-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-product-slides');
  slidesWrapper.setAttribute('aria-label', placeholders.products || 'Products');

  // Create navigation buttons
  const slideNavButtons = document.createElement('div');
  slideNavButtons.classList.add('carousel-product-navigation-buttons');
  slideNavButtons.innerHTML = `
    <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
    <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
  `;
  container.append(slideNavButtons);

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  // Bind scroll events
  const prevBtn = block.querySelector('.slide-prev');
  const nextBtn = block.querySelector('.slide-next');

  prevBtn.addEventListener('click', () => scrollSlider(block, 'prev'));
  nextBtn.addEventListener('click', () => scrollSlider(block, 'next'));

  // Update button states on scroll
  slidesWrapper.addEventListener('scroll', () => updateButtonStates(block));

  // Initial button state
  updateButtonStates(block);
}
