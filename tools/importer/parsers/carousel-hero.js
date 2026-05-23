/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-hero
 * Base block: carousel
 * Source: https://www.crown.com/en-us.html
 * Selector: div.carousel > div.component-carousel
 * Generated: 2026-05-23
 *
 * Extracts a hero carousel with 6 slides. Each slide contains:
 * - Background image (CSS background-image on [id^="bgImage_"] div)
 * - Heading text (span.text-heading2xl inside h2 or p)
 * - Description paragraph
 * - 1-2 CTA buttons (primary a.btn-cta, secondary a.btn-plain-small)
 *
 * Slides are .slick-slide elements excluding .slick-cloned duplicates.
 * Each slide becomes one row: [image, content-with-CTAs]
 */
export default function parse(element, { document }) {
  // Get all real slides (exclude slick clones)
  const allSlides = element.querySelectorAll('.slick-slide');
  const slides = Array.from(allSlides).filter(
    (slide) => !slide.classList.contains('slick-cloned')
  );

  const cells = [];

  slides.forEach((slide) => {
    // Extract background image from CSS background-image on [id^="bgImage_"] div
    const bgDiv = slide.querySelector('[id^="bgImage_"]');
    let bgImage = null;
    if (bgDiv) {
      // Try to get background-image from inline style or computed style
      const inlineStyle = bgDiv.style.backgroundImage || '';
      const bgMatch = inlineStyle.match(/url\(["']?(.+?)["']?\)/);
      if (bgMatch && bgMatch[1]) {
        bgImage = document.createElement('img');
        bgImage.src = bgMatch[1];
      } else {
        // Check computed style
        const computedStyle = bgDiv.ownerDocument.defaultView
          ? bgDiv.ownerDocument.defaultView.getComputedStyle(bgDiv)
          : null;
        if (computedStyle) {
          const computedBg = computedStyle.backgroundImage;
          const computedMatch = computedBg ? computedBg.match(/url\(["']?(.+?)["']?\)/) : null;
          if (computedMatch && computedMatch[1]) {
            bgImage = document.createElement('img');
            bgImage.src = computedMatch[1];
          }
        }
      }
      // Fallback: check for an img element inside the bgDiv
      if (!bgImage) {
        const imgEl = bgDiv.querySelector('img');
        if (imgEl) {
          bgImage = imgEl;
        }
      }
    }

    // Find the rich text container for this slide
    const richTextDiv = slide.querySelector('.RichText.richtext');

    // Get the heading element - contains span.text-heading2xl inside h2 or p
    let headingEl = null;
    if (richTextDiv) {
      // First check for h2 containing the heading span
      headingEl = richTextDiv.querySelector('h2');
      if (!headingEl) {
        // Heading may be in a p > span.text-heading2xl
        const headingSpan = richTextDiv.querySelector('span.text-heading2xl');
        if (headingSpan) {
          headingEl = headingSpan.closest('p');
        }
      }
    }

    // Get description paragraph - a p that does not contain span.text-heading2xl and has real content
    let descriptionEl = null;
    if (richTextDiv) {
      const contentDiv = richTextDiv.querySelector('[id^="richtext_"], [class*="width-100"]');
      if (contentDiv) {
        const paragraphs = contentDiv.querySelectorAll('p');
        for (let i = 0; i < paragraphs.length; i++) {
          const p = paragraphs[i];
          if (!p.querySelector('span.text-heading2xl') && p.textContent.trim().length > 5) {
            descriptionEl = p;
            break;
          }
        }
      }
    }

    // Extract CTA buttons - primary (a.btn-cta) and secondary (a.btn-plain-small)
    const ctaButtons = Array.from(
      slide.querySelectorAll('a.btn-cta, a.btn-plain-small')
    );

    // Build the content cell: heading + description + CTAs
    const contentCell = [];

    if (headingEl) {
      contentCell.push(headingEl);
    }
    if (descriptionEl) {
      contentCell.push(descriptionEl);
    }
    if (ctaButtons.length > 0) {
      contentCell.push(...ctaButtons);
    }

    // Each row: [background image cell, content cell]
    // Only add slide if it has meaningful content
    if (contentCell.length > 0) {
      if (bgImage) {
        cells.push([bgImage, contentCell]);
      } else {
        cells.push([contentCell]);
      }
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
