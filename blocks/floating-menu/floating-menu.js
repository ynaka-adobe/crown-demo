import { decorateIcons } from '../../scripts/aem.js';

const MENU_ITEMS = [
  {
    label: 'Find Your Dealer',
    href: '/en-us/forklift-dealers',
    icon: 'location',
  },
  {
    label: 'Request More Information',
    href: '/',
    icon: 'message',
  },
  {
    label: 'Share Through Email',
    icon: 'envelope',
    getHref: () => {
      const subject = encodeURIComponent(document.title);
      const body = encodeURIComponent(
        `Hi, I saw this on crown.com and thought you might be interested. Click the following link: <${window.location.href}>`,
      );
      return `mailto:?subject=${subject}&body=${body}`;
    },
  },
];

/**
 * loads and decorates the floating side menu
 * @param {Element} block The floating-menu block element
 */
export default function decorate(block) {
  block.textContent = '';
  block.setAttribute('role', 'navigation');
  block.setAttribute('aria-label', 'Quick actions');

  const nav = document.createElement('nav');
  nav.className = 'floating-menu-nav';

  MENU_ITEMS.forEach((item) => {
    const link = document.createElement('a');
    link.href = item.getHref ? item.getHref() : item.href;
    link.title = item.label;
    link.setAttribute('aria-label', item.label);
    link.innerHTML = `<span class="icon icon-${item.icon}" aria-hidden="true"></span>`;
    nav.append(link);
  });

  block.append(nav);
  decorateIcons(block);
}
