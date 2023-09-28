import { createEl, isMobile } from "../../scripts/scripts.js";

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // fetch nav content
  const resp = await fetch(`/nav.plain.html`);

  if (resp.ok) {
    const html = await resp.text();

    block.innerHTML = html;

    const headerEl = document.querySelector('header');

    const menuEl = headerEl.querySelector('.header');

    const linksEls = document.querySelector('ul');

    headerEl.querySelector('img')?.addEventListener('click', () => {
      window.location.href = '/';
    });

    if (isMobile) {
      const menuButtonEl = createEl('div', {
        id: 'menu-button',
      }, '☰', menuEl);

      menuButtonEl.addEventListener('click', () => {
        const visible = linksEls.style.display;
        linksEls.style.display = (visible === 'none') ? 'unset' : 'none';
      });
    }
  }
}
