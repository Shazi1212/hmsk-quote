// Self-tests for every calculation the Quote tool shows: line totals, VAT groups, validity date,
// and the quote -> invoice conversion. Run: npm test (node --test tests/*.test.js)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { Intl, console };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['i18n', 'rules', 'render', 'demo', 'quote']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'public', f + '.js'), 'utf8'), ctx);
const { Render, Rules, Quote, DEMO } = ctx;
const plain = o => JSON.parse(JSON.stringify(o));
const P = id => DEMO.parties.find(p => p.id === 'demo-' + id);

const quote = (over = {}) => ({
  id: 'q1', status: 'issued', docType: 'quote', senderId: 'demo-muster', recipientId: 'demo-beispiel',
  lang: 'de', number: 'AN-2026-001', date: '2026-10-19', dueDays: 30, serviceMode: 'same', currency: 'EUR',
  supply: 'services', treatment: 'domestic', clientRef: 'PO-4711', intro: 'Vielen Dank für Ihre Anfrage.', notes: '', showLogo: true,
  lines: [
    { desc: 'Badsanierung, Arbeitszeit', qty: 12.5, unit: 'h', price: 85, vat: 19, disc: 0 },
    { desc: 'Fliesen und Material', qty: 1, unit: 'flat', price: 49, vat: 19, disc: 10 },
  ],
  ...over,
});

test('line totals and VAT at one rate (19 %)', () => {
  const c = Render.compute(quote());
  assert.deepEqual(c.lines.map(l => l.net), [1062.5, 44.1]); // 12.5 × 85; 49 − 10 %
  assert.equal(c.net, 1106.6);
  assert.equal(c.vat, 210.25);                                // 1106.60 × 19 % = 210.254 → 210.25
  assert.equal(c.total, 1316.85);
});

test('VAT is computed per rate group (19 % and 7 %)', () => {
  const c = Render.compute(quote({ lines: [{ desc: 'A', qty: 1, price: 100, vat: 19 }, { desc: 'B', qty: 2, price: 25, vat: 7 }] }));
  assert.equal(c.groups[19].vat, 19);
  assert.equal(c.groups[7].vat, 3.5);
  assert.equal(c.net, 150);
  assert.equal(c.total, 172.5);
});

test('small business (§ 19 UStG) quote has no VAT', () => {
  const q = quote({ senderId: 'demo-jane', treatment: 'small', lines: [{ desc: 'Logo', qty: 1, price: 900, vat: 0 }] });
  assert.deepEqual(plain(Rules.vatRatesFor(P('jane'), 'small')), [0]);
  const c = Render.compute(q);
  assert.equal(c.vat, 0);
  assert.equal(c.total, 900);
});

test('validity date: quote date + days, default 30', () => {
  assert.equal(Quote.validUntil(quote()), '2026-11-18');
  assert.equal(Quote.validUntil(quote({ dueDays: 14 })), '2026-11-02');
  assert.equal(Quote.validUntil(quote({ dueDays: 0 })), '2026-11-18');           // not set -> 30
  assert.equal(Quote.validUntil(quote({ date: '2028-02-15', dueDays: 14 })), '2028-02-29'); // leap year
  assert.equal(Quote.validUntil(quote({ date: '2026-12-20' })), '2027-01-19');   // year change
  for (const [d, n] of [['2026-10-19', 30], ['2026-03-20', 14], ['2028-02-15', 14], ['2026-10-20', 7]])
    assert.equal(Quote.validUntil({ date: d, dueDays: n }), Render.addDays(d, n), 'same date as printed on the quote');
});

test('expiry: the last valid day still counts', () => {
  assert.equal(Quote.isExpired(quote(), '2026-11-18'), false);
  assert.equal(Quote.isExpired(quote(), '2026-11-19'), true);
});

test('the printed quote shows validity, net-price note and no supply date', () => {
  const html = Render.render(quote(), P('muster'), P('beispiel'));
  assert.match(html, /Angebot/);
  assert.match(html, /Gültig bis/);
  assert.match(html, /18\.11\.2026/);
  assert.match(html, /freibleibend/);
  assert.doesNotMatch(html, /Leistungsdatum/);
});

test('accepted quote -> invoice draft keeps items, parties and totals', () => {
  const q = quote();
  const base = { id: null, status: 'draft', docType: 'invoice', date: '2026-11-03', dueDays: 14, serviceMode: 'same', number: '', notes: '', lines: [] };
  const inv = Quote.toInvoice(q, base, { id: 'inv1' });
  assert.equal(inv.docType, 'invoice');
  assert.equal(inv.status, 'draft');
  assert.equal(inv.id, 'inv1');
  assert.equal(inv.number, '');                 // gets its own invoice number when issued
  assert.equal(inv.date, '2026-11-03');         // invoice date, not the quote date
  assert.equal(inv.dueDays, 14);                // payment term, not the quote validity
  for (const k of ['senderId', 'recipientId', 'lang', 'currency', 'clientRef', 'treatment', 'intro']) assert.equal(inv[k], q[k], k);
  assert.deepEqual(plain(inv.lines), plain(q.lines));
  assert.notEqual(inv.lines, q.lines);          // a copy, editing the invoice leaves the quote alone
  assert.equal(Render.compute(inv).total, Render.compute(q).total);
  assert.deepEqual(plain(inv.fromQuote), { id: 'q1', number: 'AN-2026-001', date: '2026-10-19' });
  assert.equal(inv.notes, 'Gemäß unserem Angebot AN-2026-001 vom 19.10.2026.');
  const html = Render.render(inv, P('muster'), P('beispiel'));
  assert.match(html, /Rechnung/);
  assert.match(html, /Gemäß unserem Angebot AN-2026-001/);
  assert.doesNotMatch(html, /freibleibend/);
});

test('reference line follows the document language', () => {
  assert.equal(Quote.refLine(quote({ lang: 'en' })), 'As per our quotation AN-2026-001 of 19/10/2026.');
  assert.equal(Quote.refLine(quote({ lang: 'de-en' })), 'Gemäß unserem Angebot AN-2026-001 vom 19.10.2026. / As per our quotation AN-2026-001 of 19/10/2026.');
  const inv = Quote.toInvoice(quote({ notes: 'Zahlbar ohne Abzug.' }), { lines: [] });
  assert.equal(inv.notes, 'Gemäß unserem Angebot AN-2026-001 vom 19.10.2026.\nZahlbar ohne Abzug.');
});
