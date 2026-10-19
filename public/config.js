// Runtime configuration. Quote is the Invoice engine started in quote mode (docMode: 'quote').
window.INVOICE_CONFIG = {
  // Quote runs in browser mode only: everything is kept in this browser (localStorage).
  storage: 'browser',

  // 'quote' = new documents are quotations; "Accepted → invoice" turns a quote into an invoice draft.
  docMode: 'quote',

  // Where the invoice draft opens. null = in this app (it is a full invoice engine too).
  // On hmsk.life: '../invoice/', the Invoice app on the same site, which reads the same browser storage.
  invoiceUrl: null,

  // Optional links shown in a slim strip above the app, e.g. [{ href: '/', text: { en: '← Home', de: '← Startseite' } }]
  topLinks: [],

  // Optional small "Created with HMSK Invoice, free at hmsk.life" line at the bottom of every document. Off here.
  madeWith: { enabled: false, url: 'https://hmsk.life/tools/quote/' },
};
