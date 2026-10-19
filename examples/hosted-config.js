// Config for the hosted copy on https://hmsk.life/apps/quote/.
// Build with:  tools/build-static.sh /path/to/site/apps/quote examples/hosted-config.js
window.INVOICE_CONFIG = {
  storage: 'browser',
  docMode: 'quote',
  // the Invoice app next to it shares this browser's storage (same origin), so the accepted quote opens there
  invoiceUrl: '../invoice/',
  topLinks: [
    { href: '/tools/quote/', text: '← hmsk.life' },
    { href: '/impressum/', text: 'Impressum' },
    { href: '/datenschutz/', text: { en: 'Privacy', de: 'Datenschutz' } },
  ],
  madeWith: { enabled: true, url: 'https://hmsk.life/tools/quote/?utm_source=quote&utm_medium=footer&utm_campaign=quote-made-with' },
};
