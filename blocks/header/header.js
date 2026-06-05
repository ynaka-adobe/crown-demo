import {
  createOptimizedPicture,
  decorateIcons,
  fetchPlaceholders,
  getMetadata,
} from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const TOP_BAR_ICON_LINKS = {
  'My Crown': 'user',
  'Contact Us': 'message',
  'Sign In': 'user',
};

function decorateTopBarLinks(topBar) {
  topBar.querySelectorAll('a').forEach((link) => {
    const label = link.textContent.trim();
    const iconName = TOP_BAR_ICON_LINKS[label];
    if (iconName) {
      const icon = document.createElement('span');
      icon.className = `icon icon-${iconName}`;
      icon.setAttribute('aria-hidden', 'true');
      link.prepend(icon);
    }
    if (label === 'Sign In') {
      const chevron = document.createElement('span');
      chevron.className = 'icon icon-chevron nav-sign-in-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      link.append(chevron);
    }
  });
}

function buildMainNavTools() {
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  tools.innerHTML = `
    <a class="nav-dealer-cta" href="/en-us/forklift-dealers">
      <span class="icon icon-location" aria-hidden="true"></span>
      Find Your Dealer
    </a>
    <a class="nav-search" href="/search" aria-label="Search">
      <span class="icon icon-search" aria-hidden="true"></span>
    </a>
    <a class="nav-cart" href="https://shop.crown.com/crown/en/cart">
      <span class="icon icon-cart" aria-hidden="true"></span>
      <span class="nav-cart-count">(0)</span>
    </a>
  `;
  return tools;
}

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > a');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

const CROWN_IMAGE_HOST = 'https://www.crown.com';

const PRODUCTS_PROMO_BG = `${CROWN_IMAGE_HOST}/content/dam/crown/images/navigation-drawer/products-nav-background.jpg`;
const PRODUCTS_PROMO_HREF = '/en-us/forklift-product-selector.html';

const SOLUTIONS_PROMO_BG = `${CROWN_IMAGE_HOST}/content/dam/crown/images/navigation-drawer/solutions-drawer-background-v-force.jpg`;
const SOLUTIONS_PROMO = {
  title: 'What\u2019s Your Energy Solutions Strategy?',
  text: 'A forklift energy solutions strategy has several benefits, including increased productivity and efficiency. Learn more in our Energy Solutions e-Book.',
  cta: 'Read the e-Book',
  href: 'https://ebooks.crown.com/v-force-energy-solutions?pid=ODk8923134&v=1.1&p=1&source=qr',
};

const SUPPORT_PROMO_BG = `${CROWN_IMAGE_HOST}/content/dam/crown/images/navigation-drawer/support-drawer-background.jpg`;
const SUPPORT_LINKS = [
  { label: 'Service & Parts', href: '/en-us/service-parts' },
  { label: 'Safety & Training', href: '/en-us/safety-training' },
  { label: 'Dealer Network', href: '/en-us/forklift-dealers' },
  { label: 'View All Support', href: '/en-us/support' },
];
const SUPPORT_PROMO = {
  cta: 'Learn More',
  href: '/en-us/service-parts',
};

const WHY_CROWN_PROMO_BG = `${CROWN_IMAGE_HOST}/content/dam/crown/images/navigation-drawer/why-crown-drawer-background.jpg`;
const WHY_CROWN_LINKS = [
  { label: 'Customer Results', href: '/en-us/customer-results' },
  { label: 'Sustainability', href: '/en-us/sustainability' },
  { label: 'Industry Recognition', href: '/en-us/awards' },
  { label: 'Why Crown', href: '/en-us/why-crown' },
  { label: 'Crown Blog', href: 'https://blog.crown.com/' },
  { label: 'Crown News & Press', href: '/en-us/newsroom' },
];
const WHY_CROWN_PROMO = {
  title: 'Ready to start your new career?',
  text: 'Find an opportunity near you.',
  cta: 'View Current Openings',
  href: '/en-us/careers',
};

const FORKLIFT_SELECTOR_LABEL = 'Forklift Selector';
const FORKLIFT_SELECTOR_HREF = '/en-us/forklift-product-selector';

function isForkliftSelectorNavItem(li) {
  const p = li.querySelector(':scope > p');
  if (!p) return false;
  const text = p.querySelector('a')?.textContent.trim() || p.textContent.trim();
  return /forklift\s*sele[ct]tor/i.test(text);
}

function normalizeForkliftSelectorNavItem(li) {
  if (!isForkliftSelectorNavItem(li)) return;

  const p = li.querySelector(':scope > p');
  const existingLink = p.querySelector('a');
  const href = existingLink?.getAttribute('href') || FORKLIFT_SELECTOR_HREF;

  li.querySelector(':scope > ul')?.remove();
  li.classList.remove('nav-drop', 'nav-mega');
  li.removeAttribute('aria-expanded');
  li.classList.add('nav-link-only');

  p.textContent = '';
  const a = document.createElement('a');
  a.href = href;
  a.textContent = FORKLIFT_SELECTOR_LABEL;
  p.append(a);
}

function getNavItemTitle(li) {
  const p = li.querySelector(':scope > p');
  if (!p) return '';
  const link = p.querySelector('a');
  return (link || p).textContent.trim();
}

function getNavItemHref(li) {
  const link = li.querySelector(':scope > p > a, :scope > a');
  return link?.getAttribute('href') || null;
}

function setMegaCategoryActive(categoriesUl, subnavCol, index) {
  categoriesUl.querySelectorAll('li').forEach((item, i) => {
    item.classList.toggle('is-active', i === index);
  });
  subnavCol.querySelectorAll('ul').forEach((ul) => {
    ul.classList.toggle('is-active', ul.dataset.categoryIndex === String(index));
  });
}

function buildProductsMegaMenu(productsLi) {
  const submenu = productsLi.querySelector(':scope > ul');
  if (!submenu) return;

  const categories = [...submenu.querySelectorAll(':scope > li')];
  productsLi.classList.add('nav-mega');

  const panel = document.createElement('div');
  panel.className = 'nav-mega-panel nav-mega-panel-products';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Products menu');

  const categoriesCol = document.createElement('div');
  categoriesCol.className = 'nav-mega-categories';
  const categoriesUl = document.createElement('ul');

  const subnavCol = document.createElement('div');
  subnavCol.className = 'nav-mega-subnav';

  categories.forEach((catLi, index) => {
    const title = getNavItemTitle(catLi);
    const href = getNavItemHref(catLi);
    const subUl = catLi.querySelector(':scope > ul');

    const catItem = document.createElement('li');
    catItem.dataset.categoryIndex = String(index);
    if (index === 0) catItem.classList.add('is-active');

    if (subUl) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = title;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setMegaCategoryActive(categoriesUl, subnavCol, index);
      });
      catItem.append(btn);
    } else if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = title;
      catItem.append(a);
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = title;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setMegaCategoryActive(categoriesUl, subnavCol, index);
      });
      catItem.append(btn);
    }

    categoriesUl.append(catItem);

    const subList = document.createElement('ul');
    subList.dataset.categoryIndex = String(index);
    if (index === 0) subList.classList.add('is-active');

    if (subUl) {
      subUl.querySelectorAll(':scope > li').forEach((subLi) => {
        const link = subLi.querySelector('a');
        if (link) {
          const newLi = document.createElement('li');
          newLi.append(link.cloneNode(true));
          subList.append(newLi);
        }
      });
    } else if (href) {
      const newLi = document.createElement('li');
      const newA = document.createElement('a');
      newA.href = href;
      newA.textContent = title;
      newLi.append(newA);
      subList.append(newLi);
    }

    subnavCol.append(subList);
  });

  categoriesUl.querySelectorAll('li').forEach((item) => {
    const index = Number(item.dataset.categoryIndex);
    item.addEventListener('mouseenter', () => {
      if (isDesktop.matches) {
        setMegaCategoryActive(categoriesUl, subnavCol, index);
      }
    });
    item.addEventListener('focusin', () => {
      setMegaCategoryActive(categoriesUl, subnavCol, index);
    });
  });

  categoriesCol.append(categoriesUl);

  const promoCol = document.createElement('div');
  promoCol.className = 'nav-mega-promo';
  promoCol.style.setProperty('--nav-mega-promo-bg', `url(${PRODUCTS_PROMO_BG})`);
  promoCol.innerHTML = `
    <div class="nav-mega-promo-inner">
      <h3 class="nav-mega-promo-title">Forklift Product Selector</h3>
      <p class="nav-mega-promo-text">Search all Crown forklifts. Filter and compare results. Find the right choice for your application.</p>
      <a class="nav-mega-promo-cta" href="${PRODUCTS_PROMO_HREF}">Search Forklifts</a>
    </div>
  `;

  panel.append(categoriesCol, subnavCol, promoCol);
  submenu.replaceWith(panel);
}

function buildSolutionsMegaMenu(solutionsLi) {
  const submenu = solutionsLi.querySelector(':scope > ul');
  if (!submenu) return;

  const links = [...submenu.querySelectorAll(':scope > li')];
  solutionsLi.classList.add('nav-mega');

  const panel = document.createElement('div');
  panel.className = 'nav-mega-panel nav-mega-panel-solutions';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Solutions menu');

  const linksCol = document.createElement('div');
  linksCol.className = 'nav-mega-links';
  const linksUl = document.createElement('ul');

  links.forEach((linkLi) => {
    const anchor = linkLi.querySelector(':scope > a, :scope > p > a');
    if (!anchor) return;

    const item = document.createElement('li');
    const a = anchor.cloneNode(true);
    item.append(a);
    linksUl.append(item);
  });

  linksCol.append(linksUl);

  const featuredCol = document.createElement('div');
  featuredCol.className = 'nav-mega-featured';
  featuredCol.style.setProperty('--nav-mega-promo-bg', `url(${SOLUTIONS_PROMO_BG})`);
  featuredCol.innerHTML = `
    <div class="nav-mega-featured-inner">
      <h3 class="nav-mega-featured-title">${SOLUTIONS_PROMO.title}</h3>
      <p class="nav-mega-featured-text">${SOLUTIONS_PROMO.text}</p>
      <a class="nav-mega-featured-cta" href="${SOLUTIONS_PROMO.href}" target="_blank" rel="noopener noreferrer">${SOLUTIONS_PROMO.cta}</a>
    </div>
  `;

  panel.append(linksCol, featuredCol);
  submenu.replaceWith(panel);
}

function buildSupportMegaMenu(supportLi) {
  const submenu = supportLi.querySelector(':scope > ul');
  if (!submenu) return;

  supportLi.classList.add('nav-mega');

  const panel = document.createElement('div');
  panel.className = 'nav-mega-panel nav-mega-panel-support';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Support menu');

  const linksCol = document.createElement('div');
  linksCol.className = 'nav-mega-links';
  const linksUl = document.createElement('ul');

  SUPPORT_LINKS.forEach(({ label, href }) => {
    const item = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    item.append(a);
    linksUl.append(item);
  });

  linksCol.append(linksUl);

  const featureCol = document.createElement('div');
  featureCol.className = 'nav-mega-support-feature';
  featureCol.style.setProperty('--nav-mega-promo-bg', `url(${SUPPORT_PROMO_BG})`);
  featureCol.innerHTML = `
    <div class="nav-mega-support-visual" aria-hidden="true"></div>
    <div class="nav-mega-support-copy">
      <h3 class="nav-mega-support-title">Your Uptime ... <span class="nav-mega-support-highlight">Your Focus</span></h3>
      <p class="nav-mega-support-subtitle">Experience the Lowest Total Cost of Ownership.</p>
      <a class="nav-mega-support-cta" href="${SUPPORT_PROMO.href}">${SUPPORT_PROMO.cta}</a>
    </div>
  `;

  panel.append(linksCol, featureCol);
  submenu.replaceWith(panel);
}

function buildWhyCrownMegaMenu(whyCrownLi) {
  const submenu = whyCrownLi.querySelector(':scope > ul');
  if (!submenu) return;

  whyCrownLi.classList.add('nav-mega');

  const panel = document.createElement('div');
  panel.className = 'nav-mega-panel nav-mega-panel-why-crown';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Why Crown menu');

  const linksCol = document.createElement('div');
  linksCol.className = 'nav-mega-links';
  const linksUl = document.createElement('ul');

  WHY_CROWN_LINKS.forEach(({ label, href }) => {
    const item = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    if (href.startsWith('http')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    item.append(a);
    linksUl.append(item);
  });

  linksCol.append(linksUl);

  const featureCol = document.createElement('div');
  featureCol.className = 'nav-mega-support-feature';
  featureCol.style.setProperty('--nav-mega-promo-bg', `url(${WHY_CROWN_PROMO_BG})`);
  featureCol.innerHTML = `
    <div class="nav-mega-support-visual" aria-hidden="true"></div>
    <div class="nav-mega-support-copy">
      <h3 class="nav-mega-support-title">${WHY_CROWN_PROMO.title}</h3>
      <p class="nav-mega-support-text">${WHY_CROWN_PROMO.text}</p>
      <a class="nav-mega-support-cta" href="${WHY_CROWN_PROMO.href}">${WHY_CROWN_PROMO.cta}</a>
    </div>
  `;

  panel.append(linksCol, featureCol);
  submenu.replaceWith(panel);
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const homeUrl = document.querySelector('.nav-brand a[href]').href;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
    } while (menuItem);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  const placeholders = await fetchPlaceholders();
  const homePlaceholder = placeholders.breadcrumbsHomeLabel || 'Home';

  crumbs.unshift({ title: homePlaceholder, url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1].url = null;
  }
  crumbs[crumbs.length - 1]['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  const navSectionDivs = [...nav.children].filter((child) => child.tagName === 'DIV');
  classes.forEach((c, i) => {
    const section = navSectionDivs[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand?.querySelector('.button') || navBrand?.querySelector('a');
  if (brandLink) {
    const brandLabel = /crown equipment/i.test(brandLink.textContent)
      ? 'Crown Equipment Corporation'
      : brandLink.textContent.trim() || 'Crown';
    const brandHref = brandLink.href;
    brandLink.className = 'nav-brand-link';
    const brandContainer = brandLink.closest('.button-container');
    if (brandContainer) brandContainer.className = '';
    brandLink.textContent = '';
    brandLink.href = brandHref;
    brandLink.setAttribute('aria-label', brandLabel);
    const logo = createOptimizedPicture(
      `${window.hlx.codeBasePath}/icons/crown-logo.png`,
      brandLabel,
      true,
      [{ width: '270' }],
    );
    logo.classList.add('nav-brand-logo');
    brandLink.append(logo);
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const topNavItems = navSections.querySelectorAll(':scope .default-content-wrapper > ul > li');
    topNavItems.forEach((navSection) => normalizeForkliftSelectorNavItem(navSection));

    topNavItems.forEach((navSection) => {
      if (navSection.querySelector('ul, .nav-mega-panel')) navSection.classList.add('nav-drop');
    });

    topNavItems.forEach((navSection) => {
      if (!navSection.classList.contains('nav-drop')) return;
      navSection.addEventListener('click', (e) => {
        if (isDesktop.matches) {
          const trigger = navSection.querySelector(':scope > p');
          if (navSection.classList.contains('nav-mega') && trigger && !trigger.contains(e.target)) {
            return;
          }
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });

    const productsLi = [...topNavItems].find((li) => {
      const label = li.querySelector(':scope > p');
      return label?.textContent.trim() === 'Products';
    });
    if (productsLi) buildProductsMegaMenu(productsLi);

    const solutionsLi = [...topNavItems].find((li) => {
      const label = li.querySelector(':scope > p');
      return label?.textContent.trim() === 'Solutions';
    });
    if (solutionsLi) buildSolutionsMegaMenu(solutionsLi);

    const supportLi = [...topNavItems].find((li) => {
      const label = li.querySelector(':scope > p');
      return label?.textContent.trim() === 'Support';
    });
    if (supportLi) buildSupportMegaMenu(supportLi);

    const whyCrownLi = [...topNavItems].find((li) => {
      const label = li.querySelector(':scope > p');
      return label?.textContent.trim() === 'Why Crown';
    });
    if (whyCrownLi) buildWhyCrownMegaMenu(whyCrownLi);
  }

  // Build top utility bar from nav-tools content
  const navTools = nav.querySelector('.nav-tools');
  const topBar = document.createElement('div');
  topBar.className = 'nav-top-bar';
  if (navTools) {
    navTools.querySelectorAll('.button').forEach((button) => {
      button.className = '';
      const buttonContainer = button.closest('.button-container');
      if (buttonContainer) {
        buttonContainer.className = '';
      }
    });
    const lists = navTools.querySelectorAll(':scope .default-content-wrapper > ul');
    const topBarInner = document.createElement('div');
    topBarInner.className = 'nav-top-bar-inner';
    if (lists.length >= 2) {
      const leftUl = lists[0];
      const rightUl = lists[1];
      leftUl.className = 'nav-top-bar-left';
      rightUl.className = 'nav-top-bar-right';
      topBarInner.append(leftUl, rightUl);
    } else if (lists.length === 1) {
      lists[0].className = 'nav-top-bar-right';
      topBarInner.append(lists[0]);
    }
    if (topBarInner.childElementCount) topBar.append(topBarInner);
    navTools.remove();
  }

  nav.append(buildMainNavTools());

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.prepend(topBar);
  navWrapper.append(nav);
  block.append(navWrapper);
  decorateTopBarLinks(topBar);
  decorateIcons(block);

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    navWrapper.append(await buildBreadcrumbs());
  }
}
