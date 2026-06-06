export default function decorate(block) {
  const [imageRow, contentRow, positionRow, colorRow] = [...block.children];

  // Read optional position row (left / center / right), default to left
  const rawPosition = positionRow?.textContent.trim().toLowerCase() || 'left';
  const position = ['left', 'center', 'right'].includes(rawPosition) ? rawPosition : 'left';

  const picture = imageRow?.querySelector('picture');
  const contentCell = contentRow?.querySelector(':scope > div');

  block.innerHTML = '';
  block.classList.add(`position-${position}`);

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'banner-image';
  if (picture) imageWrapper.append(picture);

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'banner-content';

  if (contentCell) {
    let titleSet = false;
    [...contentCell.children].forEach((el) => {
      // Detect button containers (EDS-decorated or plain link-only paragraph)
      const isButtonContainer = el.classList.contains('button-container')
        || (el.tagName === 'P' && el.querySelector('a')
          && el.textContent.trim() === (el.querySelector('a')?.textContent.trim() ?? ''));

      if (!isButtonContainer) {
        if (!titleSet) {
          el.classList.add('banner-title');
          titleSet = true;
        } else {
          el.classList.add('banner-body');
        }
      }
      contentWrapper.append(el);
    });
  }

  const cta = contentWrapper.querySelector('a');
  if (cta) {
    cta.classList.add('banner-cta');
    const btnColor = colorRow?.textContent.trim();
    if (btnColor) cta.style.setProperty('--banner-btn-color', btnColor);
  }

  block.append(imageWrapper, contentWrapper);
}
