/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    const allSlides = element.querySelectorAll(".slick-slide");
    const slides = Array.from(allSlides).filter(
      (slide) => !slide.classList.contains("slick-cloned")
    );
    const cells = [];
    slides.forEach((slide) => {
      const bgDiv = slide.querySelector('[id^="bgImage_"]');
      let bgImage = null;
      if (bgDiv) {
        const inlineStyle = bgDiv.style.backgroundImage || "";
        const bgMatch = inlineStyle.match(/url\(["']?(.+?)["']?\)/);
        if (bgMatch && bgMatch[1]) {
          bgImage = document.createElement("img");
          bgImage.src = bgMatch[1];
        } else {
          const computedStyle = bgDiv.ownerDocument.defaultView ? bgDiv.ownerDocument.defaultView.getComputedStyle(bgDiv) : null;
          if (computedStyle) {
            const computedBg = computedStyle.backgroundImage;
            const computedMatch = computedBg ? computedBg.match(/url\(["']?(.+?)["']?\)/) : null;
            if (computedMatch && computedMatch[1]) {
              bgImage = document.createElement("img");
              bgImage.src = computedMatch[1];
            }
          }
        }
        if (!bgImage) {
          const imgEl = bgDiv.querySelector("img");
          if (imgEl) {
            bgImage = imgEl;
          }
        }
      }
      const richTextDiv = slide.querySelector(".RichText.richtext");
      let headingEl = null;
      if (richTextDiv) {
        headingEl = richTextDiv.querySelector("h2");
        if (!headingEl) {
          const headingSpan = richTextDiv.querySelector("span.text-heading2xl");
          if (headingSpan) {
            headingEl = headingSpan.closest("p");
          }
        }
      }
      let descriptionEl = null;
      if (richTextDiv) {
        const contentDiv = richTextDiv.querySelector('[id^="richtext_"], [class*="width-100"]');
        if (contentDiv) {
          const paragraphs = contentDiv.querySelectorAll("p");
          for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i];
            if (!p.querySelector("span.text-heading2xl") && p.textContent.trim().length > 5) {
              descriptionEl = p;
              break;
            }
          }
        }
      }
      const ctaButtons = Array.from(
        slide.querySelectorAll("a.btn-cta, a.btn-plain-small")
      );
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
      if (contentCell.length > 0) {
        if (bgImage) {
          cells.push([bgImage, contentCell]);
        } else {
          cells.push([contentCell]);
        }
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-solutions.js
  function parse2(element, { document }) {
    const tabLabels = Array.from(element.querySelectorAll("ol.tabsList li.tab h2.tabSubtitle a"));
    const tabPanels = Array.from(element.querySelectorAll("div.tabContent"));
    const cells = [];
    tabLabels.forEach((labelLink, index) => {
      const tabLabel = labelLink.textContent.trim();
      const panel = tabPanels[index];
      if (!panel) return;
      const labelEl = document.createElement("p");
      labelEl.textContent = tabLabel;
      const items = Array.from(panel.querySelectorAll("a.imageItem"));
      const contentElements = [];
      items.forEach((item) => {
        const titleText = item.querySelector("p.titleText");
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = titleText ? titleText.textContent.trim() : item.textContent.trim();
        const p = document.createElement("p");
        p.appendChild(link);
        contentElements.push(p);
      });
      cells.push([labelEl, contentElements]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-solutions", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-product.js
  function parse3(element, { document }) {
    const productItems = element.querySelectorAll("li.products-list-item");
    const cells = [];
    productItems.forEach((item) => {
      const link = item.querySelector("a.products-list-item-link");
      const image = item.querySelector("img.product-image");
      const title = item.querySelector("p.product-title");
      if (image && title && link) {
        const linkedTitle = document.createElement("a");
        linkedTitle.href = link.href;
        linkedTitle.textContent = title.textContent;
        cells.push([image, linkedTitle]);
      } else if (image && title) {
        cells.push([image, title]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-banner.js
  function parse4(element, { document }) {
    let bgImage = element.querySelector('div[id^="bgImage_"] > img');
    if (!bgImage) {
      bgImage = element.querySelector(":scope > div > div > div > img");
    }
    if (!bgImage) {
      const bgDiv = element.querySelector('div[id^="bgImage_"]');
      if (bgDiv) {
        const style = bgDiv.getAttribute("style") || "";
        const bgMatch = style.match(/background-image\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/i);
        if (bgMatch) {
          bgImage = document.createElement("img");
          bgImage.src = bgMatch[1];
        }
      }
    }
    const heading = element.querySelector("div.RichText h2, div.richtext h2, h2, h1");
    const description = element.querySelector("div.RichText p, div.richtext p");
    const ctaLinks = Array.from(element.querySelectorAll("a.btn-cta, a.btn"));
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentWrapper = document.createElement("div");
    if (heading) contentWrapper.append(heading);
    if (description) contentWrapper.append(description);
    ctaLinks.forEach((cta) => contentWrapper.append(cta));
    cells.push([contentWrapper]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  function parse5(element, { document }) {
    const children = element.querySelectorAll(".parent > .child");
    const cells = [];
    children.forEach((child) => {
      const link = child.querySelector(".text-column > a, .textwithiconvertical a");
      if (!link) return;
      const icon = link.querySelector('i.fas, i[class*="fa-"]');
      const heading = link.querySelector("h3, h2, h4");
      const cardContent = [];
      if (icon) {
        const classes = icon.className.split(/\s+/);
        const iconClass = classes.find((cls) => cls.startsWith("fa-") && cls !== "fa-fw" && !cls.match(/^fa-\d/));
        if (iconClass) {
          const iconSpan = document.createElement("span");
          iconSpan.textContent = `:${iconClass}:`;
          cardContent.push(iconSpan);
        }
      }
      if (heading && link.getAttribute("href")) {
        const newLink = document.createElement("a");
        newLink.href = link.getAttribute("href");
        newLink.textContent = heading.textContent;
        const newHeading = document.createElement("h3");
        newHeading.appendChild(newLink);
        cardContent.push(newHeading);
      } else if (heading) {
        cardContent.push(heading);
      }
      if (cardContent.length > 0) {
        cells.push(cardContent);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-discover.js
  function parse6(element, { document }) {
    const tabLabels = Array.from(element.querySelectorAll("ol.tabsList li.tab h2.tabSubtitle a"));
    const tabPanels = Array.from(element.querySelectorAll("div.tabContent"));
    const cells = [];
    tabLabels.forEach((labelLink, index) => {
      const tabLabel = labelLink.textContent.trim();
      const panel = tabPanels[index];
      if (!panel) return;
      const labelEl = document.createElement("p");
      labelEl.textContent = tabLabel;
      const contentElements = [];
      const bgImage = panel.querySelector('div.tabColumnBgFullWidthRow > img, div[id^="bgImage_"] > img');
      if (bgImage) {
        const img = document.createElement("img");
        img.src = bgImage.src;
        if (bgImage.alt) img.alt = bgImage.alt;
        const imgP = document.createElement("p");
        imgP.appendChild(img);
        contentElements.push(imgP);
      }
      const heading = panel.querySelector("h4");
      if (heading) {
        const h2 = document.createElement("h2");
        const headingSpan = heading.querySelector("span.text-heading2xl");
        h2.textContent = headingSpan ? headingSpan.textContent.trim() : heading.textContent.trim();
        contentElements.push(h2);
      }
      const richTextDiv = panel.querySelector('div.RichText div[id^="richtext_"]');
      if (richTextDiv) {
        const descP = richTextDiv.querySelector("h4 ~ p");
        if (descP && descP.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = descP.textContent.trim();
          contentElements.push(p);
        }
      }
      const ctaLink = panel.querySelector("a.btn.btn-cta");
      if (ctaLink) {
        const a = document.createElement("a");
        a.href = ctaLink.href;
        const ctaText = ctaLink.querySelector("p");
        a.textContent = ctaText ? ctaText.textContent.trim() : ctaLink.textContent.trim();
        const ctaP = document.createElement("p");
        ctaP.appendChild(a);
        contentElements.push(ctaP);
      }
      cells.push([labelEl, contentElements]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-discover", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/crown-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#ecatalog-viewer-modal",
        "#modal-search",
        "#authErrorModal",
        "#chat-widget-container",
        ".cookiepolicy"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        ".breadcrumb",
        "#isoLanguageCountryCode",
        "#is404",
        "iframe",
        "link",
        "noscript",
        ".clearfix:empty"
      ]);
    }
  }

  // tools/importer/transformers/crown-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { template } = payload;
      if (!template || !template.sections || template.sections.length < 2) return;
      const document = element.ownerDocument;
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selector = Array.isArray(section.selector) ? section.selector[0] : section.selector;
        const sectionEl = element.querySelector(selector);
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.parentElement.insertBefore(sectionMetadata, sectionEl.nextSibling);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.parentElement.insertBefore(hr, sectionEl);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Crown Equipment homepage with hero, product categories, and company information",
    urls: [
      "https://www.crown.com/en-us.html"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: ["div.carousel > div.component-carousel"]
      },
      {
        name: "tabs-solutions",
        instances: ["div.tabcomponent:has(#tabNavWrapper_mainpar_tabcomponent)"]
      },
      {
        name: "carousel-product",
        instances: ["div.productslider"]
      },
      {
        name: "hero-banner",
        instances: ["div#height_b5a96252911a489dadcea8c78ea8c5b1"]
      },
      {
        name: "cards-icon",
        instances: ["div.quadlayout"]
      },
      {
        name: "tabs-discover",
        instances: ["div.tabcomponent:has(#tabNavWrapper_mainpar_tabcomponent_555109933)"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Carousel",
        selector: "div.carousel",
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Smart Material Handling Solutions",
        selector: ["div#height_b356c566b8bb410aac94667eba081824", "div.tabcomponent:has(#tabNavWrapper_mainpar_tabcomponent)"],
        style: null,
        blocks: ["tabs-solutions"],
        defaultContent: ["#richtext_mainpar_column_203409334_column1_richtext h1"]
      },
      {
        id: "section-3",
        name: "Product Slider",
        selector: "div.productslider",
        style: null,
        blocks: ["carousel-product"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Shop Online with Crown",
        selector: "div#height_b5a96252911a489dadcea8c78ea8c5b1",
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Crown Support",
        selector: ["div#height_841456c975cd46bd9f610256598d9d6e", "div.quadlayout"],
        style: null,
        blocks: ["cards-icon"],
        defaultContent: ["#richtext_mainpar_column_1394353123_column1_richtext h2"]
      },
      {
        id: "section-6",
        name: "Discover Crown",
        selector: ["div#height_2963baae6c1b48618804f5bcf24db2b1", "div.tabcomponent:has(#tabNavWrapper_mainpar_tabcomponent_555109933)"],
        style: null,
        blocks: ["tabs-discover"],
        defaultContent: ["#richtext_mainpar_column_926544579_cop_column1_richtext h2"]
      }
    ]
  };
  var parsers = {
    "carousel-hero": parse,
    "tabs-solutions": parse2,
    "carousel-product": parse3,
    "hero-banner": parse4,
    "cards-icon": parse5,
    "tabs-discover": parse6
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
              section: blockDef.section || null
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
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
