/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Crown Equipment cleanup.
 * Removes non-authorable content (header, footer, navigation, modals, cookie consent,
 * chat widget, breadcrumbs, and other global chrome) from the DOM.
 * All selectors validated against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie consent banner (OneTrust) - found at line 3119 of cleaned.html
    // Remove modals that block parsing - ecatalog modal (line 10), search modal (line 570), auth error modal (line 595)
    // Remove chat widget container (line 3343)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#ecatalog-viewer-modal',
      '#modal-search',
      '#authErrorModal',
      '#chat-widget-container',
      '.cookiepolicy',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove header - outer header element wrapping all navigation (line 6)
    // Remove footer element (line 2652)
    // Remove breadcrumb (line 565)
    // Remove hidden 404 indicator and language code input (lines 4, 8)
    // Remove iframes (silent auth frame line 151, chat widget iframe line 3346)
    // Remove link elements (CSS clientlib line 5)
    // Remove clearfix div before footer (line 2650)
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '.breadcrumb',
      '#isoLanguageCountryCode',
      '#is404',
      'iframe',
      'link',
      'noscript',
      '.clearfix:empty',
    ]);
  }
}
