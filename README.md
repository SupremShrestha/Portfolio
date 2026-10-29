# Suprem Shrestha — Portfolio

A cinematic portfolio built with React, Vite, GSAP, and locally rendered SVG and Canvas artwork. The current experience is implemented from scratch in `src/experience/`, with project content and navigation utilities shared from `src/data/` and `src/lib/`.

## Development

```sh
npm install
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

## The experience

- A full-screen typographic opening over a perspective particle field, with staggered entrance motion and a scroll-driven exit.
- Three complete palettes: **Void** (black and violet), **Ion** (deep green and acid lime), and **Pearl** (pale gray and electric blue). The header selector persists the choice, applied before first paint.
- A full-width statement with a scroll-driven text reveal and expanding section mask.
- A pinned horizontal showcase on sufficiently large screens, with three original animated project illustrations, direct navigation controls, and keyboard focus handling. Smaller screens and reduced-motion mode show the projects in a normal vertical flow.
- A searchable, filterable index of all 17 projects. Details open in a side sheet, with next/previous browsing, GitHub links, and clipboard fallback. Deep links use `?project=<id>#projects` and preserve deployment subpaths and browser Back/Forward behavior.
- **More than the code:** a personal profile, animated skill accordions linked to real projects, and a short introduction to the working approach. **Still becoming:** a keyboard-accessible chapter timeline showing education, focus areas, and learning in practice.
- **Other Orbits:** four keyboard-accessible interests, with an illustrative flight-route explorer, a camera framing/exposure study that exports SVGs, an eight-step Web Audio sequencer with pattern presets, and a clickable constellation atlas. Experiment settings stay when switching interests. Hero shortcuts open the corresponding interest. Audio starts only on request and stops when its panel, section, or browser tab is hidden.
- Additional scroll progress and reveal animations for the interests section, with the existing motion controls and reduced-motion preference respected.
- A generative gravity experiment with attract/repel modes, pulse, pause, and reset. Pointer, touch, and keyboard interaction are supported. Canvas rendering pauses when offscreen or when the browser tab is hidden.
- A closing invitation with three conversation starters and an animated contact dialog. Optional prompts preserve edited messages; completion indicators, per-tab draft recovery, validation, loading/error/success states, and email/copy alternatives help visitors finish their message.
- A full-screen navigation index, visible keyboard focus, skip link, and persistent motion preference. Device reduced-motion settings take priority.

The older component files remain available as source reference; they are not imported into the current application. The active app entry is `src/App.jsx`, which renders `src/experience/Portfolio.jsx`. No external font, image, or 3D service is needed.

## Contact form

Direct sending uses `api/contact.js`, a Vercel Node function backed by Resend. Email credentials stay on the server. Every send requires server-verified Cloudflare Turnstile, an allowed origin, validated fields, and bounded request size. The recipient is fixed to `ssuprim26@gmail.com`. Retries use an idempotency key to avoid duplicate provider sends within the provider's idempotency window.

**Direct delivery is not activated until the environment settings are supplied.** Follow [CONTACT_SETUP.md](CONTACT_SETUP.md) for Resend, Turnstile, and Vercel setup. Without a configured server, a valid form opens an email draft and explicitly asks the visitor to send it in their email app. It never claims that the form sent the draft.

The Vite development/preview server serves the same API handler locally. Copy `.env.example` to `.env.local`, fill the values, and restart Vite. Never prefix secrets with `VITE_`. Automated provider tests use mocks and do not send email. A successful API response confirms provider acceptance, not inbox delivery.

## Deployment

The build uses relative asset paths. The generated `dist/` folder works at the domain root or at a path such as `/Portfolio/`. Static hosts retain the email-draft fallback. For direct sending, deploy the full repository to Vercel using the included `vercel.json`; uploading only `dist/` does not deploy the server function.

## Next content improvements

- Add your selected photography and featured-project demos using the ready-made [media folders and instructions](public/media/README.md). Existing screenshots are connected through `src/data/media.js`; featured projects retain their concept artwork until media is added.
- Expand the three featured case studies with measured outcomes and project-specific evidence when available.
- Add an up-to-date downloadable résumé when the document is available.


## Motion and media

- The hero particles briefly form an SS constellation, then disperse. The sequence does not replay when changing themes.
- Featured artwork travels into and out of the project sheet on large screens. Smaller screens use a short slide/fade. Menu opening and closing, filtering, and interest changes have coordinated transitions.
- Desktop project artwork has restrained pointer tilt and light. Archive rows reveal previews on mouse hover and keyboard focus; touch visitors open the same details directly.
- Theme changes use a circular View Transition where supported, with immediate theme updates as the compatibility fallback. The motion toggle and system reduced-motion preference disable decorative movement.
- Montserrat display fonts are served locally under the bundled [SIL Open Font License](public/fonts/Montserrat-OFL.txt).
- Project screenshots already in `public/` now appear in their matching project details. Future screenshots, videos, and a photography gallery are configured in `src/data/media.js`; see [the media guide](public/media/README.md).
