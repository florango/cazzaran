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
  }
}
