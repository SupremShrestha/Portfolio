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
- A new profile section with expandable technical disciplines and a connected education timeline.
- A generative gravity experiment with attract/repel modes, pulse, pause, and reset. Pointer, touch, and keyboard interaction are supported. Canvas rendering pauses when offscreen or when the browser tab is hidden.
- A full-width closing invitation and a contact form in an accessible native dialog.
- A full-screen navigation index, visible keyboard focus, skip link, and persistent motion preference. Device reduced-motion settings take priority.

The older component files remain available as source reference; they are not imported into the current application. The active app entry is `src/App.jsx`, which renders `src/experience/Portfolio.jsx`. No external font, image, or 3D service is needed.

## Contact form

Without EmailJS settings, a valid submission opens a prefilled draft in the visitor’s email application. The visitor sends the email there. The form retains its contents and provides a copy-message option.

For direct delivery, copy `.env.example` to `.env.local` and provide all three EmailJS browser settings. Set the template recipient to `ssuprim26@gmail.com`, Reply-To to `{{reply_to}}`, and use `{{from_name}}`, `{{from_email}}`, and `{{message}}` in the template. Enable the deployed domain in EmailJS. Vite configuration is public: do not add private API keys to browser variables.

Restart Vite after changing environment variables. Direct delivery shows success only after EmailJS accepts the request and preserves the message on failure. Automated tests do not send email.

## Deployment

The build uses relative asset paths. The generated `dist/` folder works at the domain root or at a path such as `/Portfolio/`. Deploy its contents using your preferred static host.
