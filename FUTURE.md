# Future decisions

Choices to discuss if Word Path moves from a free test tool towards a product. None of these are needed now; this list keeps them from being forgotten. Not legal advice: for a product, check the legal items with someone qualified.

## Hosting

| Option | What it means | When it fits |
|---|---|---|
| **GitHub Pages** (today) | Free static hosting: files are sent to the browser, everything runs on the device. No server, no database | Free tool with no accounts or shared data |
| Other static hosts (Cloudflare Pages, Netlify, AWS S3 + CloudFront) | Same model, different provider; custom domain, more control | A custom domain, or traffic beyond GitHub Pages' intended use |
| A backend (Firebase, Supabase, or AWS) | A server and database | Only if accounts, syncing between devices, or teacher dashboards are needed |

**Open question:** does the product vision need accounts or shared data? If not, static hosting is enough even for a large audience.

## Becoming an app

1. **Installable web app (PWA)**: home-screen icon, works offline, full screen. Same code and hosting. Smallest step.
2. **App Store / Google Play**: wrap the same web code with a tool such as Capacitor. The game ships inside the app (no hosting needed for the game itself). Needs developer accounts (Apple about $99 a year; Google a one-time fee), app review, and compliance with each store's rules for children's apps (for example, Apple's Kids category limits third-party analytics and advertising).
3. **Orientation lock** becomes possible in an installed app (a website can't force landscape).

## Privacy and children's data

- **Today:** nothing leaves the device. Progress and settings are stored in the browser.
- **COPPA** (US, children under 13): collecting personal information, which can include persistent identifiers, needs verifiable parental consent and a privacy policy. Schools can sometimes consent on parents' behalf for educational use.
- **FERPA** (US schools): rules for student education records if schools share data with the service.
- **State student-privacy laws** (e.g. California's SOPIPA) and school district data agreements.
- **Options for usage data**, lightest first: on-device report and export → anonymous, cookie-free counts (e.g. GoatCounter, Plausible) with no identifiers → a real database with accounts (full compliance work).
- **Decision needed:** which questions usage data should answer, and who should see the results.

## Content and licensing

- **Teaching order:** currently modelled on the UK *Letters and Sounds* (2007) phases. A sequence of ideas is generally not protected by copyright, but credit sources.
- **UFLI and other programmes:** don't use their materials (word lists, passages, slides, lesson structure) or name without permission. If aligning to a school's programme is important for a product, ask the publisher.
- **Sight words:** Fry's list is widely reproduced, but its status is less clear-cut than the Dolch list (1930s–40s). Consider Dolch, or a list derived from public word-frequency data, for a product.
- **Research backbone:** the What Works Clearinghouse practice guide *Foundational Skills to Support Reading for Understanding in Kindergarten Through 3rd Grade* (2016) is a US government publication, generally in the public domain.
- **Assets:** Noto Emoji (Apache 2.0), Fredoka (SIL OFL 1.1), Lucide (ISC), Preact (MIT), htm (Apache 2.0). Keep licence files and an in-game credits page.
- **Voice recordings:** your recordings are in a public repo. A product might use a hired voice actor (with a written agreement) or a licensed AI voice (check the service's commercial terms, especially for cloned voices).

## Build step and TypeScript

- **Today:** Preact + htm with no build step (DECISIONS.md #3). Fast to work on, nothing to install.
- **Switching to** React or Preact with a build step (e.g. Vite) and TypeScript adds type checking, cleaner components, more testing tools and a path towards React Native. The cost is a toolchain to maintain.
- **Cheap middle step:** split `app.js` into modules (audio, screens, test mode), still with no build step.
- **Decide before:** the teacher report (#19), or any app-store step.

## Accessibility and school requirements

- Schools often require accessibility conformance (WCAG 2.1 AA; in the US, ADA and Section 508 for public institutions) and may ask for a VPAT.
- Districts may require a signed data privacy agreement before classroom use.

## Business model (if it gets there)

- Free with optional paid teacher features, district licences, or fully free/open source. Affects hosting, privacy obligations and app-store choices.
