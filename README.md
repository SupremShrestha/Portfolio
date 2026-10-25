# Suprem Shrestha — Portfolio

A playful portfolio built with React 19, Vite, and Lucide icons. Black-and-white foundations with cobalt, lilac, and warm yellow accents. A notebook, a project drawer, and a small playground.

## Development

```sh
npm install
npm run dev
```

```sh
npm run build
npm run preview
npm test
```

## Features

- Sticky navigation with active section tracking, URL anchors, and a mobile menu.
- Movable hero stickers: drag with a pointer, nudge with arrow keys, or reset with Home.
- An original desk buddy that follows the pointer and responds to pokes.
- All 17 GitHub projects, with six selected builds first, full-dataset search, category filters, grid/list views, shuffle, and hover tilt.
- Shareable project details with next/previous browsing and copy-link feedback. Project URLs use `?project=<id>#projects` and support browser Back/Forward.
- File tabs for the About section, an interactive skill explorer linked to actual projects, and expandable education cards.
- A drawing pad with pen, eraser, undo, star stamps, and PNG export. Keyboard drawing uses arrows, Shift + arrows, and Enter.
- A 15-second bug-catching game with a locally saved personal best.
- Light/dark themes with coordinated color accents and an animation toggle. System reduced motion takes priority.
- A searchable jump menu for sections and all 17 projects, opened from the corner button or Ctrl/Command + K.
- Direct project entry points from the hero, and saved theme/motion preferences applied before the first paint.
- Contact validation, copy email/message actions, and clear feedback.
- Reduced motion support, visible keyboard focus, and a skip-to-content link.

Personal details live in the section components. Project information, curated ordering, and repository links are in `src/data/projects.js`. The selected builds are Ride Map, Robotic Arm Learning, BIPAD Risk Platform, Seoul Bike Pipeline, TableFlow, and Sonar Target Classifier. Selection reflects the documented technical scope; it is not a ranking by the most recent README update.

Project covers are clearly labeled placeholders in `public/projects/`. To add screenshots, follow [the image replacement guide](public/projects/README.md). No external image service is required.

Theme, motion preferences, and the game high score are saved in browser local storage when available. Drawings stay in memory until you clear them or reload; Save PNG downloads a copy. All interactions work without an external service.

## Contact form

With no configuration, submitting a valid message opens a prefilled draft in the visitor’s email application. The visitor must send the email there. The form keeps its contents and offers a copy-message alternative; it never claims an email was sent.

For direct delivery, copy `.env.example` to `.env.local` and provide all three EmailJS browser settings. Configure your EmailJS template recipient as `ssuprim26@gmail.com`, set Reply-To to `{{reply_to}}`, and use `{{from_name}}`, `{{from_email}}`, and `{{message}}` in the template. Enable your deployed domain in EmailJS. The recipient should be fixed in the EmailJS dashboard. Vite browser configuration is public; do not put private API keys in these variables.

Restart Vite after changing environment variables. Direct delivery displays success only after EmailJS accepts the request and preserves the message on failure. No real email is sent during automated tests.

## Deployment

The default build uses relative asset paths, so the generated `dist/` folder works at the domain root or under a path such as `/Portfolio/`. Deploy its contents with your preferred static host.
