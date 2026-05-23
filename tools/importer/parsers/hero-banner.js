/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-banner
 * Base block: hero
 * Source selector: div#height_b5a96252911a489dadcea8c78ea8c5b1
 * Source: https://www.crown.com/en-us.html
 * Generated: 2026-05-23
 *
 * Extracts: background image, H2 heading, description paragraph, CTA button
 * Target structure: Row 1 = background image (if found), Row 2 = heading + description + CTA
 */
export default function parse(element, { document }) {
  // Extract background image - try multiple approaches:
  // 1. Direct img tag in the bgImage container
  // 2. Any img that is not inside the richtext/content area
  // 3. Background-image from inline style on the bgImage div
  let bgImage = element.querySelector('div[id^="bgImage_"] > img');
  if (!bgImage) {
    bgImage = element.querySelector(':scope > div > div > div > img');
  }
  if (!bgImage) {
    // Check for background-image in style attribute on the bgImage div
    const bgDiv = element.querySelector('div[id^="bgImage_"]');
    if (bgDiv) {
      const style = bgDiv.getAttribute('style') || '';
      const bgMatch = style.match(/background-image\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/i);
      if (bgMatch) {
        bgImage = document.createElement('img');
        bgImage.src = bgMatch[1];
      }
    }
  }

  // Extract heading (h2 with text-headingxl span, or fallback to any h1/h2/h3)
  const heading = element.querySelector('div.RichText h2, div.richtext h2, h2, h1');

  // Extract description paragraph (within the RichText container, after heading)
  const description = element.querySelector('div.RichText p, div.richtext p');

  // Extract CTA link(s) - btn-cta class on the anchor
  const ctaLinks = Array.from(element.querySelectorAll('a.btn-cta, a.btn'));

  // Build cells array matching hero block structure
  const cells = [];

  // Row 1: Background image (optional - only add if present)
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: Content cell - heading, description, and CTAs in one cell
  const contentWrapper = document.createElement('div');
  if (heading) contentWrapper.append(heading);
  if (description) contentWrapper.append(description);
  ctaLinks.forEach((cta) => contentWrapper.append(cta));
  cells.push([contentWrapper]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
