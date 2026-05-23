/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import tabsSolutionsParser from './parsers/tabs-solutions.js';
import carouselProductParser from './parsers/carousel-product.js';
import heroBannerParser from './parsers/hero-banner.js';
import cardsIconParser from './parsers/cards-icon.js';
import tabsDiscoverParser from './parsers/tabs-discover.js';

// TRANSFORMER IMPORTS
import crownCleanupTransformer from './transformers/crown-cleanup.js';
import crownSectionsTransformer from './transformers/crown-sections.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Crown Equipment homepage with hero, product categories, and company information',
  urls: [
    'https://www.crown.com/en-us.html'
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: ['div.carousel > div.component-carousel']
    },
    {
      name: 'tabs-solutions',
      instances: ['div.tabcomponent:has(#tabNavWrapper_mainpar_tabcomponent)']
    },
    {
      name: 'carousel-product',
      instances: ['div.productslider']
    },
    {
      name: 'hero-banner',
      instances: ['div#height_b5a96252911a489dadcea8c78ea8c5b1']
    },
    {
      name: 'cards-icon',
      instances: ['div.quadlayout']
    },
    {
      name: 'tabs-discover',
      instances: ['div.tabcomponent:has(#tabNavWrapper_mainpar_tabcomponent_555109933)']
    }
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Carousel',
      selector: 'div.carousel',
      style: null,
      blocks: ['carousel-hero'],
      defaultContent: []
    },
    {
      id: 'section-2',
      name: 'Smart Material Handling Solutions',
      selector: ['div#height_b356c566b8bb410aac94667eba081824', 'div.tabcomponent:has(#tabNavWrapper_mainpar_tabcomponent)'],
      style: null,
      blocks: ['tabs-solutions'],
      defaultContent: ['#richtext_mainpar_column_203409334_column1_richtext h1']
    },
    {
      id: 'section-3',
      name: 'Product Slider',
      selector: 'div.productslider',
      style: null,
      blocks: ['carousel-product'],
      defaultContent: []
    },
    {
      id: 'section-4',
      name: 'Shop Online with Crown',
      selector: 'div#height_b5a96252911a489dadcea8c78ea8c5b1',
      style: null,
      blocks: ['hero-banner'],
      defaultContent: []
    },
    {
      id: 'section-5',
      name: 'Crown Support',
      selector: ['div#height_841456c975cd46bd9f610256598d9d6e', 'div.quadlayout'],
      style: null,
      blocks: ['cards-icon'],
      defaultContent: ['#richtext_mainpar_column_1394353123_column1_richtext h2']
    },
    {
      id: 'section-6',
      name: 'Discover Crown',
      selector: ['div#height_2963baae6c1b48618804f5bcf24db2b1', 'div.tabcomponent:has(#tabNavWrapper_mainpar_tabcomponent_555109933)'],
      style: null,
      blocks: ['tabs-discover'],
      defaultContent: ['#richtext_mainpar_column_926544579_cop_column1_richtext h2']
    }
  ]
};

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'tabs-solutions': tabsSolutionsParser,
  'carousel-product': carouselProductParser,
  'hero-banner': heroBannerParser,
  'cards-icon': cardsIconParser,
  'tabs-discover': tabsDiscoverParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  crownCleanupTransformer,
  crownSectionsTransformer,
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null,
          });
        });
      } catch (e) {
        console.warn(`Block "${blockDef.name}" selector error: ${selector}`, e);
      }
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
