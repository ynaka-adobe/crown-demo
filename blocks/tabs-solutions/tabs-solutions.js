// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

const CROWN_IMAGE_HOST = 'https://www.crown.com';

const TILE_BACKGROUNDS = {
  '/en-us/warehouse-solutions': '/content/dam/crown/images/home-page/2022/smart-solutions/all-solutions-warehouse.jpg',
  '/en-us/connected-solutions': '/content/dam/crown/images/home-page/2022/smart-solutions/connected-solutions.jpg',
  '/en-us/automation': '/content/dam/crown/images/home-page/2022/smart-solutions/all-solutions-automation.jpg',
  '/en-us/v-force-energy-solutions': '/content/dam/crown/images/home-page/2022/smart-solutions/all-solutions-energy.jpg',
  '/en-us/warehouse-solutions/warehouse-design': '/content/dam/crown/images/home-page/2022/smart-solutions/warehouse-solutions-design.jpg',
  '/en-us/warehouse-solutions/racking-and-storage': '/content/dam/crown/images/home-page/2022/smart-solutions/warehouse-solutions-racking.jpg',
  '/en-us/warehouse-solutions/warehouse-products': '/content/dam/crown/images/home-page/2022/smart-solutions/warehouse-products.jpg',
  '/en-us/fleet-management/infolink': '/content/dam/crown/images/home-page/2022/smart-solutions/operator-fleet-management.jpg',
  '/en-us/fleet-management/fleetstats': '/content/dam/crown/images/home-page/2022/smart-solutions/fleet-maintenance-management.jpg',
  '/en-us/automation/dualmode': '/content/dam/crown/images/home-page/2022/smart-solutions/dualmode-automated-forklifts.jpg',
  '/en-us/forklifts/quickpick-order-picker': '/content/dam/crown/images/home-page/2022/smart-solutions/semi-automated-order-picking.jpg',
  '/en-us/forklifts/man-up-order-pickers/tsp-turret-stockpicker': '/content/dam/crown/images/home-page/2022/smart-solutions/automation-solutions-automation.jpg',
  '/en-us/batteries-and-chargers/lithium-ion-battery': '/content/dam/crown/images/home-page/2022/smart-solutions/lithium-ion-energy-systems.jpg',
  '/en-us/batteries-and-chargers': '/content/dam/crown/images/home-page/2022/smart-solutions/batteries-chargers-accessories.jpg',
  '/en-us/service-parts/battery-charger-service': '/content/dam/crown/images/home-page/2022/smart-solutions/energy-solutions-charger-maintenance.jpg',
  'energy-solutions|/en-us/v-force-energy-solutions': '/content/dam/crown/images/home-page/2022/smart-solutions/energy-solutions-energy-management.jpg',
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

function resolveTileBackground(link, panel) {
  const dataImage = link.dataset.bgImage;
  if (dataImage) {
    return dataImage.startsWith('http') ? dataImage : `${CROWN_IMAGE_HOST}${dataImage}`;
  }
  const path = normalizePath(link.href);
  const tabId = panel?.id?.replace('tabpanel-', '');
  const mapped = TILE_BACKGROUNDS[`${tabId}|${path}`] || TILE_BACKGROUNDS[path];
  if (mapped) return `${CROWN_IMAGE_HOST}${mapped}`;
  return null;
}

function decorateTiles(block) {
  block.querySelectorAll('.tabs-solutions-panel').forEach((panel) => {
    panel.querySelectorAll('a').forEach((link) => {
      link.classList.add('tabs-solutions-tile');
      const background = resolveTileBackground(link, panel);
      if (background) {
        link.style.backgroundImage = `url('${background}')`;
      }
    });
  });
}

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-solutions-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-solutions-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-solutions-tab';
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
  decorateTiles(block);
}
