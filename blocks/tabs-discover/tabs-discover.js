// eslint-disable-next-line import/no-unresolved
import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

const CROWN_IMAGE_HOST = 'https://www.crown.com';

const TAB_BACKGROUNDS = {
  'our-company': '/content/dam/crown/images/home-page/2022/discover-crown/discover-crown-our-company.jpg',
  innovation: '/content/dam/crown/images/home-page/2022/discover-crown/discover-crown-innovation.jpg',
  news: '/content/dam/crown/images/home-page/2022/discover-crown/discover-crown-news.jpg',
  'customer-results': '/content/dam/crown/images/home-page/2022/discover-crown/reduce-cost-houston-powder-coaters-desktop.jpg',
  blog: '/content/dam/crown/images/home-page/2022/discover-crown/discover-crown-blog.jpg',
};

function moveInstrumentation() {}

function decoratePanels(block) {
  block.querySelectorAll('.tabs-discover-panel').forEach((panel) => {
    const content = document.createElement('div');
    content.className = 'tabs-discover-panel-content';

    const wrapper = panel.querySelector(':scope > div');
    if (wrapper) {
      while (wrapper.firstChild) content.append(wrapper.firstChild);
    }

    const bg = document.createElement('div');
    bg.className = 'tabs-discover-panel-bg';

    const picture = content.querySelector('picture');
    const img = content.querySelector('img');
    if (picture) {
      bg.append(picture);
    } else if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '2000' }]);
      bg.append(optimizedPic);
      img.closest('p')?.remove();
    } else {
      const tabId = panel.id.replace('tabpanel-', '');
      if (TAB_BACKGROUNDS[tabId]) {
        bg.style.backgroundImage = `url('${CROWN_IMAGE_HOST}${TAB_BACKGROUNDS[tabId]}')`;
      }
    }

    panel.textContent = '';
    panel.append(bg, content);
  });
}

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-discover-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-discover-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-discover-tab';
    button.id = `tab-${id}`;

    moveInstrumentation(tab.parentElement, tabpanel.lastElementChild);
    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
    moveInstrumentation(button.querySelector('p'), null);
  });

  block.prepend(tablist);
  decoratePanels(block);
}
