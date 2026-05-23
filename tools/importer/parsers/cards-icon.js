/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-icon
 * Base block: cards
 * Source: https://www.crown.com/en-us.html
 * Selector: div.quadlayout
 * Generated: 2026-05-23
 *
 * Extracts a grid of icon cards from a quad layout. Each card has a Font Awesome
 * icon (i.fas) and an h3 heading, both wrapped in a link. Produces one row per card
 * with the icon identifier and linked heading in a single cell.
 */
export default function parse(element, { document }) {
  // Each card is a .child div inside .parent
  const children = element.querySelectorAll('.parent > .child');

  const cells = [];

  children.forEach((child) => {
    // Each child has a .textwithiconvertical containing a link with icon + heading
    const link = child.querySelector('.text-column > a, .textwithiconvertical a');
    if (!link) return;

    const icon = link.querySelector('i.fas, i[class*="fa-"]');
    const heading = link.querySelector('h3, h2, h4');

    const cardContent = [];

    // Extract icon class name to create a text representation
    // Font Awesome icons are CSS-only, so we create a span with the icon name
    if (icon) {
      const classes = icon.className.split(/\s+/);
      // Find the descriptive icon class (fa-map-marker-alt, fa-wrench, etc.)
      const iconClass = classes.find((cls) => cls.startsWith('fa-') && cls !== 'fa-fw' && !cls.match(/^fa-\d/));
      if (iconClass) {
        const iconSpan = document.createElement('span');
        iconSpan.textContent = `:${iconClass}:`;
        cardContent.push(iconSpan);
      }
    }

    // Create a linked heading to preserve both the heading text and the href
    if (heading && link.getAttribute('href')) {
      const newLink = document.createElement('a');
      newLink.href = link.getAttribute('href');
      newLink.textContent = heading.textContent;
      const newHeading = document.createElement('h3');
      newHeading.appendChild(newLink);
      cardContent.push(newHeading);
    } else if (heading) {
      cardContent.push(heading);
    }

    if (cardContent.length > 0) {
      cells.push(cardContent);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon', cells });
  element.replaceWith(block);
}
