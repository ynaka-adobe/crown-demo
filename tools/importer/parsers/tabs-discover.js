/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-discover
 * Base block: tabs
 * Source: https://www.crown.com/en-us.html
 * Generated: 2026-05-23
 *
 * Extracts a tabbed "Discover Crown" interface with 5 tabs (Our Company, Innovation,
 * News, Customer Results, Blog). Each tab panel contains a full-width background image
 * with overlaid text content (heading, description, CTA button) positioned on the right.
 * Source uses ol.tabsList with id="tabsList_mainpar_tabcomponent_555109933" for tab
 * navigation and div.tabContent panels for content.
 */
export default function parse(element, { document }) {
  // Extract tab labels from the tabs list
  const tabLabels = Array.from(element.querySelectorAll('ol.tabsList li.tab h2.tabSubtitle a'));

  // Extract tab content panels (specific to this tab component instance)
  const tabPanels = Array.from(element.querySelectorAll('div.tabContent'));

  const cells = [];

  // Build one row per tab: [tab-label, tab-panel-content]
  tabLabels.forEach((labelLink, index) => {
    const tabLabel = labelLink.textContent.trim();
    const panel = tabPanels[index];

    if (!panel) return;

    // Create tab label element
    const labelEl = document.createElement('p');
    labelEl.textContent = tabLabel;

    // Extract panel content elements
    const contentElements = [];

    // Background image: inside div[id^="bgImage_"] with class tabColumnBgFullWidthRow
    const bgImage = panel.querySelector('div.tabColumnBgFullWidthRow > img, div[id^="bgImage_"] > img');
    if (bgImage) {
      const img = document.createElement('img');
      img.src = bgImage.src;
      if (bgImage.alt) img.alt = bgImage.alt;
      const imgP = document.createElement('p');
      imgP.appendChild(img);
      contentElements.push(imgP);
    }

    // Heading: h4 with span.text-heading2xl inside RichText
    const heading = panel.querySelector('h4');
    if (heading) {
      const h2 = document.createElement('h2');
      const headingSpan = heading.querySelector('span.text-heading2xl');
      h2.textContent = headingSpan ? headingSpan.textContent.trim() : heading.textContent.trim();
      contentElements.push(h2);
    }

    // Description: paragraph inside the RichText richtext div (sibling after h4)
    const richTextDiv = panel.querySelector('div.RichText div[id^="richtext_"]');
    if (richTextDiv) {
      const descP = richTextDiv.querySelector('h4 ~ p');
      if (descP && descP.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = descP.textContent.trim();
        contentElements.push(p);
      }
    }

    // CTA button: a.btn.btn-cta
    const ctaLink = panel.querySelector('a.btn.btn-cta');
    if (ctaLink) {
      const a = document.createElement('a');
      a.href = ctaLink.href;
      // CTA text may be inside a nested <p> element
      const ctaText = ctaLink.querySelector('p');
      a.textContent = ctaText ? ctaText.textContent.trim() : ctaLink.textContent.trim();
      const ctaP = document.createElement('p');
      ctaP.appendChild(a);
      contentElements.push(ctaP);
    }

    // Each row: first cell = tab label, second cell = panel content (image + heading + description + CTA)
    cells.push([labelEl, contentElements]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-discover', cells });
  element.replaceWith(block);
}
