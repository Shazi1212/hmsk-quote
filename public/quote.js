// Quote helpers: validity date and "accepted quote -> invoice draft".
// Pure functions (no DOM, no storage), so they are tested in tests/quote.test.js.
(function () {
  // same date arithmetic as Render.addDays, kept here so this file works on its own
  function addDays(iso, days) {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + (+days || 0));
    return d.toISOString().slice(0, 10);
  }

  // The quote is valid for `dueDays` days from its date (30 if not set), as printed under "Valid until".
  const DEFAULT_VALID_DAYS = 30;
  function validDays(q) { return +q.dueDays || DEFAULT_VALID_DAYS; }
  function validUntil(q) { return addDays(q.date, validDays(q)); }
  // still open on `day` (ISO date)? The last valid day counts.
  function isExpired(q, day) { return !!q.date && day > validUntil(q); }

  function fmt(iso, lang) {
    const [y, m, d] = (iso || '').split('-');
    return lang === 'en' ? `${d}/${m}/${y}` : `${d}.${m}.${y}`;
  }
  // "as per quotation AN-2026-001 of 19.10.2026", in the document language (bilingual for de-en / pt-en)
  function refLine(q) {
    const parts = (q.lang || 'en').split('-');
    const t = {
      de: `Gemäß unserem Angebot ${q.number} vom ${fmt(q.date, 'de')}.`,
      en: `As per our quotation ${q.number} of ${fmt(q.date, 'en')}.`,
      pt: `Conforme o nosso orçamento ${q.number} de ${fmt(q.date, 'pt')}.`,
    };
    return parts.map(l => t[l] || t.en).join(' / ');
  }

  // Fields copied from the quote unchanged. Number, date, payment term and supply date are the invoice's own.
  const COPY = ['senderId', 'recipientId', 'lang', 'langManual', 'currency', 'supply', 'clientRef', 'treatment', 'treatmentManual', 'showDiscount', 'intro', 'showLogo'];
  const clone = o => JSON.parse(JSON.stringify(o));

  // Build an invoice draft from an accepted quote. `base` is a blank invoice from the engine
  // (today's date, sender's payment term), so the invoice gets its own number when it is issued.
  function toInvoice(q, base, opts = {}) {
    const n = clone(base);
    for (const k of COPY) if (k in q) n[k] = clone(q[k]);
    n.lines = clone(q.lines || []);
    n.id = opts.id || null;
    n.status = 'draft';
    n.docType = 'invoice';
    n.number = ''; n.numberManual = false;
    n.dueManual = false;
    n.serviceMode = 'same';
    n.fromQuote = { id: q.id || null, number: q.number || '', date: q.date || '' };
    const ref = q.number ? refLine(q) : '';
    n.notes = [ref, q.notes || ''].filter(Boolean).join('\n');
    // a quote's "prices are net" note is printed automatically on quotes only, never copied
    return n;
  }

  window.Quote = { DEFAULT_VALID_DAYS, addDays, validDays, validUntil, isExpired, refLine, toInvoice };
})();
