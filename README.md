# Quote

Free quotes (Angebote) for freelancers, tradespeople and small businesses. When the client accepts, one click turns the quote into the invoice, so nothing is typed twice.

**Use it online:** [hmsk.life/tools/quote](https://hmsk.life/tools/quote/) (runs in your browser, nothing is uploaded).

## Features

- Quotes with their own number series (`AN-{YYYY}-{NNN}`), a "valid until" date (30 days by default) and the net-price note ("Angebot freibleibend").
- **Accepted → invoice**: creates an invoice draft with the client, items, prices, VAT treatment, language and a reference line ("As per our quotation AN-2026-001 of 19/10/2026"). The invoice gets its own number, date and payment term when you issue it.
- Quote list with status: draft, sent, expired, accepted.
- Senders, clients and catalogue items saved once; VAT treatment picked from both countries (domestic, § 19 UStG small business, EU reverse charge, export) with the matching note; German, English, Portuguese or bilingual.
- PDF through the browser's print dialog (exact A4). Backup as one JSON file.

## How it relates to Invoice

Quote is the [HMSK Invoice](https://hmsk.life/tools/invoice/) engine started with `docMode: 'quote'` (see `public/config.js`). All quote-specific code is `public/quote.js` plus a block marked `quote mode` in `public/app.js`; with the default `docMode: 'invoice'` the engine behaves exactly like Invoice. See [UPSTREAM.md](UPSTREAM.md) for the Invoice version it is based on.

Where the invoice opens is set by `invoiceUrl`:

- `null` (default): in this app. It is a full invoice engine, so you can issue the invoice, print it and export XRechnung here.
- `'../invoice/'` (hmsk.life): the Invoice app on the same site. Both apps read the same browser storage (`invoice-db`), so the quote app saves the invoice draft and opens Invoice with it. A draft already open in Invoice is saved first, never overwritten.

## Quick start

```sh
python3 -m http.server 8080 --directory public   # open http://127.0.0.1:8080
```

Static copy for any web space or sub-path:

```sh
tools/build-static.sh dist                         # optional 2nd argument: your own config.js (see examples/)
```

All data stays in the browser's `localStorage`. Clearing the browser data deletes it: download a backup under *Backup*.

## Tests

```sh
npm test    # node --test, Node.js 20+
```

`tests/quote.test.js` checks every number the tool shows: line totals, discounts, VAT per rate group, the small-business case, the valid-until date (default, leap year, year change, same date as printed), expiry, the printed quote, and the quote → invoice conversion (same totals, own number/date/term, reference line in each language).

## Legal notes (as of 19 October 2026)

Not legal or tax advice.

- German VAT 19 % / 7 %: § 12 UStG. Small business, no VAT: § 19 UStG.
- A quote binds the sender unless it excludes this (§ 145 BGB); the German quote text says "freibleibend". The "valid until" date sets the acceptance period (§ 148 BGB).
- Tradespeople: show labour and materials as separate lines. Private clients can deduct 20 % of the labour cost, at most €1,200 a year (§ 35a Abs. 3 EStG).
- UK VAT rates and US sales tax are not built in.

## License

MIT, see [LICENSE](LICENSE).
