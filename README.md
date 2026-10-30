# Bros Jay Laundry

A responsive laundry service website built for a business in Ife, Osun State, Nigeria. Customers can explore service rates, choose drop-off or pick-up, and submit a booking request. The owner confirmed booking delivery to Google Sheets and email during setup.

**[View live website](https://bros-jay-laundry-fresh.u-nn.chatgpt.site)**

![Bros Jay Laundry imagery](dist/assets/laundry.svg)

## Features

- Responsive Home, Services & Prices, Booking, FAQ and Privacy pages.
- Conditional booking fields for drop-off and pick-up.
- Nigerian phone-number validation and normalization.
- Africa/Lagos pick-up scheduling rules and privacy consent.
- Cloudflare Turnstile spam verification, prepared while the form is filled in.
- Submission progress feedback and duplicate-submit prevention.
- WhatsApp contact and booking fallback.
- Google Apps Script integration for private Google Sheets records and owner email alerts.

## Built with

HTML, CSS and vanilla JavaScript, with Google Apps Script and Cloudflare Turnstile. No frontend build step is required. Service imagery was generated for this project from the supplied visual brief.

## Project structure

```text
dist/
  index.html       Website entry point
  style.css        Responsive styles
  app.js           Routing, booking validation and interactions
  content.js       Business details, catalogue and public configuration
  assets/          Laundry and service photographs
integration/
  Bookings.gs      Reference Apps Script template
  SETUP.md         Integration setup notes
```

## Run locally

Serve `dist/` with a static server that falls back to `index.html` for routes such as `/book`, `/prices`, `/faq` and `/privacy`. For example, with Node.js installed:

```sh
npx serve -s dist
```

Open the local URL printed by the command. Turnstile and live booking delivery require a permitted hostname and configured Google deployment. Do not submit test bookings to the real business while exploring the code.

## Configuration and deployment

Editable business content and public integration configuration are in `dist/content.js`. Deploy `dist/` to a static host with SPA fallback routing. Moving to another hostname requires updating both the Turnstile hostname allowlist and the Apps Script server-side hostname validation.

This repository upload does not move hosting or activate GitHub Pages. The live website remains hosted at the link above. GitHub project Pages needs additional base-path and route configuration before this source can be hosted there unchanged.

The `integration/Bookings.gs` file is a reference template, not an exported copy of the owner’s current live Apps Script. Changes made in Google Apps Script are not synchronized automatically. Use `integration/SETUP.md` when creating a new integration.

## Content status

Service prices remain explicitly marked as sample rates until confirmed by the owner. Pick-up service areas and some policy text still need owner confirmation. Testimonials are hidden until genuine reviews are supplied.

## Privacy and secrets

The Turnstile Site Key is public. The Turnstile Secret Key belongs only in Google Apps Script properties. Never commit customer booking rows, private spreadsheets, secret keys or `.env` files. This repository includes website source and reference integration code, not customer records or private keys.
