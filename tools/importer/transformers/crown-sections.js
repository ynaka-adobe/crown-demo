/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Crown Equipment sections.
 * Establishes section boundaries by inserting <hr> elements before each section
 * (except the first). No section-metadata blocks needed since all sections have style: null.
 * All selectors validated against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { template } = payload;
    if (!template || !template.sections || template.sections.length < 2) return;

    const document = element.ownerDocument;
    const sections = template.sections;

    // Process sections in reverse order to avoid offset issues when inserting elements
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const selector = Array.isArray(section.selector) ? section.selector[0] : section.selector;
      const sectionEl = element.querySelector(selector);

      if (!sectionEl) continue;

      // Insert section-metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.parentElement.insertBefore(sectionMetadata, sectionEl.nextSibling);
      }

      // Insert <hr> before each section except the first
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.parentElement.insertBefore(hr, sectionEl);
      }
    }
  }
}
