# Upstream

Engine files copied from `hmsk-invoice` at commit `3e75226` ("Optional "Created with HMSK Invoice" footer line"):
`index.html`, `app.css`, `app.js`, `i18n.js`, `rules.js`, `render.js`, `xrechnung.js`, `demo.js`, `assets/icon.svg`.

Changes against that commit:

- `app.js`: config keys `docMode` and `invoiceUrl`; quote mode (blank document is a quotation, validity instead of the
  sender's payment term, own draft key `quote-cur-*`, quote list with sent/expired/accepted, "Accepted → invoice").
  Every change is behind `QUOTE`, so `docMode: 'invoice'` behaves like Invoice. Candidate to merge back into Invoice,
  so both apps can be one build with two configs.
- `index.html`: title, description, loads `quote.js`.
- New: `quote.js`, `config.js` (quote defaults), `tests/quote.test.js`.

When Invoice changes `rules.js`, `render.js` or the storage format, copy those files here and run `npm test`.
The hosted copies on hmsk.life share browser storage, so both must read the same data format.
