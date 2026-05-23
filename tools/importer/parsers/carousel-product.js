/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-product
 * Base block: carousel
 * Source selector: div.productslider
 * Description: Horizontal scrolling product items with images and titles
 * Generated: 2026-05-23
 */
export default function parse(element, { document }) {
  // Extract all product items from the products list
  const productItems = element.querySelectorAll('li.products-list-item');

  const cells = [];

  productItems.forEach((item) => {
    // Each product item contains: a.products-list-item-link > div.product > img.product-image + p.product-title
    const link = item.querySelector('a.products-list-item-link');
    const image = item.querySelector('img.product-image');
    const title = item.querySelector('p.product-title');

    if (image && title && link) {
      // Create a linked title element preserving the href
      const linkedTitle = document.createElement('a');
      linkedTitle.href = link.href;
      linkedTitle.textContent = title.textContent;

      // Each row: image in first cell, linked title in second cell
      cells.push([image, linkedTitle]);
    } else if (image && title) {
      // Fallback: no link wrapper
      cells.push([image, title]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-product', cells });
  element.replaceWith(block);
}
