import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';

const CARD_ICONS_BY_LABEL = {
  'Locate a Crown Dealer': 'map-marker',
  'Forklift Service': 'wrench',
  'Forklift Parts & Accessories': 'cogs',
  'Safety & Training': 'users',
};

const CARD_ICONS_BY_PATH = {
  '/en-us/forklift-dealers': 'map-marker',
  '/en-us/service-parts/integrity-service': 'wrench',
  '/en-us/service-parts/integrity-parts': 'cogs',
  '/en-us/safety-training': 'users',
};

function moveInstrumentation() {}

function normalizePath(href) {
  try {
    const { pathname } = new URL(href, window.location.origin);
    return pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  } catch {
    return href;
  }
}

function getIconName(li) {
  const link = li.querySelector('a');
  const label = link?.textContent.trim() || li.querySelector('h3')?.textContent.trim();
  if (label && CARD_ICONS_BY_LABEL[label]) return CARD_ICONS_BY_LABEL[label];
  if (link?.href) {
    const path = normalizePath(link.href);
    if (CARD_ICONS_BY_PATH[path]) return CARD_ICONS_BY_PATH[path];
  }
  return null;
}

function ensureCardIcon(li) {
  if (li.querySelector('.cards-icon-card-image picture, .cards-icon-card-image .icon')) return;

  const iconName = getIconName(li);
  if (!iconName) return;

  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-icon-card-image';
  imageDiv.innerHTML = `<span class="icon icon-${iconName}" aria-hidden="true"></span>`;
  li.prepend(imageDiv);
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-icon-card-image';
      else div.className = 'cards-icon-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  ul.querySelectorAll('li').forEach(ensureCardIcon);
  decorateIcons(block);
}
