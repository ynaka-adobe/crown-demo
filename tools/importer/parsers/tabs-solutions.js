/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-solutions
 * Base block: tabs
 * Source: https://www.crown.com/en-us.html
 * Generated: 2026-05-23
 *
 * Extracts a tabbed interface with solution categories.
 * Each tab has a label and a panel containing linked tiles with category titles.
 * Source uses .tabsList for tab navigation and .tabContent divs for panel content.
 */
export default function parse(element, { document }) {
  // Extract tab labels from the tabs list
  const tabLabels = Array.from(element.querySelectorAll('ol.tabsList li.tab h2.tabSubtitle a'));

  // Extract tab content panels
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

    // Extract linked items from the panel's image grid
    const items = Array.from(panel.querySelectorAll('a.imageItem'));
    const contentElements = [];

    items.forEach((item) => {
      const titleText = item.querySelector('p.titleText');
      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = titleText ? titleText.textContent.trim() : item.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(link);
      contentElements.push(p);
    });

    // Each row: first cell = tab label, second cell = panel content (list of links)
    cells.push([labelEl, contentElements]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-solutions', cells });
  element.replaceWith(block);
}
