import {
  createEl, getJSON, makeFriendy,
} from '../../scripts/scripts.js';

export default async function decorate(doc) {
  const mainEl = doc.querySelector('main');
  const sectionEl = mainEl.querySelector('.section')
  const sideRailEl = createEl('div', {
    id: 'side-rail',
  });
  
  sectionEl.querySelectorAll('h2').forEach((h2El) => {
    createEl('a', {
      href: `#${h2El.id}`,
    }, h2El.textContent, sideRailEl);
  });


  sectionEl.prepend(
      sideRailEl
  );
}