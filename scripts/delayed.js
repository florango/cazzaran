// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
import { createEl } from './scripts.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
createEl('script', {
    src: 'https://www.googletagmanager.com/gtag/js?id=G-M0997FK1N2',
    async: true,
}, '', document.head);

createEl('script', {
}, `
    window.dataLayer = window.dataLayer || [];
    function gtag(){
        dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'G-M0997FK1N2');
`, document.head);