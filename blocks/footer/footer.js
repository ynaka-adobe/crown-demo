import { decorateIcons, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_COLUMNS = [
  {
    title: 'Forklifts',
    links: [
      { label: 'Rental Forklifts', href: '/en-us/forklift-rentals' },
      { label: 'New Forklifts', href: '/en-us/forklifts' },
      { label: 'Reconditioned Forklifts', href: '/en-us/remanufactured-forklifts' },
      { label: 'Used / Pre-Owned Forklifts', href: '/en-us/pre-owned-forklifts' },
      { label: 'V-Force Batteries & Chargers', href: '/en-us/batteries-and-chargers' },
    ],
  },
  {
    title: 'More From Crown',
    links: [
      { label: 'Service', href: '/en-us/service-parts/integrity-service' },
      { label: 'Solutions', href: '/en-us/solutions' },
      { label: 'Support', href: '/en-us/support' },
      { label: 'Shop', href: 'https://shop.crown.com/' },
      { label: 'Crown Branded Merchandise', href: 'https://crownstore.crown.com/' },
    ],
  },
  {
    title: 'About Crown',
    links: [
      { label: 'Our Company', href: '/en-us/about-us' },
      { label: 'Code of Conduct', href: 'https://www.crown.com/content/dam/crown/pdfs/en-us/brochures/non-products/code-of-conduct.pdf' },
      { label: 'Supplier Code of Conduct', href: 'https://www.crown.com/content/dam/crown/pdfs/en-us/legal/Supplier-Code-of-Conduct.pdf' },
      { label: 'Locations', href: '/en-us/about-us#whereweare' },
      { label: 'Careers', href: 'https://us-careers.crown.com/' },
      { label: 'Crown Blog', href: 'https://blog.crown.com/' },
      { label: 'Crown News & Press', href: '/en-us/newsroom' },
    ],
  },
  {
    title: 'Utilities',
    links: [
      { label: 'Service Manuals', href: '/en-us/manuals-safety-labels' },
      { label: 'Operator Manuals', href: '/en-us/operator-manuals' },
      { label: 'FAQ', href: 'https://shop.crown.com/crown/en/faq' },
    ],
  },
];

const FOOTER_CONNECT = [
  { label: 'Find a Dealer', href: '/en-us/forklift-dealers', icon: 'map-marker' },
  { label: 'Contact Us', href: '/en-us/contact-us', icon: 'comment' },
  { label: '419-629-2311', href: 'tel:4196292311', icon: 'phone' },
];

const FOOTER_SOCIAL = [
  { label: 'Facebook', href: 'https://www.facebook.com/CrownEquipmentCorporation', icon: 'facebook' },
  { label: 'YouTube', href: 'https://www.youtube.com/user/CrownEquipment', icon: 'youtube' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/crownequipment', icon: 'linkedin' },
];

const FOOTER_LEGAL = [
  { label: 'Legal Information', href: '/en-us/legal' },
  { label: 'Data Security Incident', href: '/securityincident' },
  { label: 'Terms and Conditions', href: '/en-us/terms-and-conditions' },
];

function isBoilerplateFooter(fragment) {
  const text = fragment.textContent || '';
  return text.includes('Adobe') || fragment.querySelectorAll(':scope > div').length <= 1;
}

function buildFooterTop() {
  const top = document.createElement('div');
  top.className = 'footer-top';

  const search = document.createElement('form');
  search.className = 'footer-search';
  search.setAttribute('role', 'search');
  search.setAttribute('aria-label', 'Search Crown');
  search.action = '/search';
  search.method = 'get';
  search.innerHTML = `
    <label class="footer-search-label">
      <span class="icon icon-search" aria-hidden="true"></span>
      <span class="sr-only">Search Crown</span>
      <input type="search" name="q" placeholder="Search Crown" maxlength="2048" autocomplete="on" />
    </label>
  `;

  const connect = document.createElement('div');
  connect.className = 'footer-connect';
  connect.innerHTML = FOOTER_CONNECT.map((item) => `
    <a href="${item.href}">
      <span class="icon icon-${item.icon}" aria-hidden="true"></span>
      <span>${item.label}</span>
    </a>
  `).join('');

  top.append(search, connect);
  return top;
}

function buildFooterColumns() {
  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  columns.innerHTML = FOOTER_COLUMNS.map((column) => `
    <div class="footer-column">
      <h3>${column.title}</h3>
      <ul>
        ${column.links.map((link) => `<li><a href="${link.href}">${link.label}</a></li>`).join('')}
      </ul>
    </div>
  `).join('');
  return columns;
}

function buildFooterBottom() {
  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';

  const locale = document.createElement('div');
  locale.className = 'footer-locale';
  locale.innerHTML = '<a href="#">United States - English</a>';

  const brand = document.createElement('div');
  brand.className = 'footer-brand';
  brand.innerHTML = `
    <a class="footer-logo" href="/en-us" aria-label="Crown Equipment Corporation">
      <img src="${window.hlx.codeBasePath}/icons/crown-logo.png" alt="Crown" width="135" height="31" loading="lazy" />
    </a>
    <ul class="footer-social">
      ${FOOTER_SOCIAL.map((item) => `
        <li>
          <a href="${item.href}" aria-label="${item.label}" target="_blank" rel="noopener noreferrer">
            <span class="icon icon-${item.icon}" aria-hidden="true"></span>
          </a>
        </li>
      `).join('')}
    </ul>
  `;

  const legal = document.createElement('div');
  legal.className = 'footer-legal';
  const year = new Date().getFullYear();
  legal.innerHTML = `
    <p class="footer-copyright">© 2002-${year} Crown Equipment Corporation</p>
    <p class="footer-legal-links">
      ${FOOTER_LEGAL.map((link, i) => `${i ? ' | ' : ''}<a href="${link.href}">${link.label}</a>`).join('')}
      | <a href="#">Cookie Settings</a>
    </p>
  `;

  bottom.append(locale, brand, legal);
  return bottom;
}

function buildCrownFooter() {
  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  inner.append(
    buildFooterTop(),
    buildFooterColumns(),
    buildFooterBottom(),
  );
  return inner;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');

  if (fragment && !isBoilerplateFooter(fragment)) {
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  } else {
    footer.append(buildCrownFooter());
  }

  block.append(footer);
  decorateIcons(block);
}
