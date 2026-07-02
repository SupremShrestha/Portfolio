# Portfolio

A personal portfolio site that had one job: don't look like every other template with a fade-in hero and a "Contact Me" button that goes nowhere. This one does more.

Live at: https://SupremeStha.github.io/Portfolio

---

## What's Actually In Here

This isn't a static page pretending to be interactive — it's a real React app with its own cursor effects, animation engine, and a contact form that actually sends email.

| Section | What it does |
|---|---|
| `Background` | Sets the visual stage before anything else loads |
| `ClickSpark` | Sparks fly from your cursor on every click, because why not |
| `HeroTitle` | The first impression |
| `AboutMe` | The human behind the code |
| `Education` | The paper trail |
| `Projects` | The actual proof |
| `Contact` | A real, working form — no "message sent to the void" here |
| `Footer` | The quiet exit |

## Built With

This site runs on a stack chosen for speed, not just for a good-looking `package.json`:

- **React 19** — component-driven, no spaghetti
- **Vite** — because waiting for a dev server to boot is a crime
- **Tailwind CSS 4** — utility classes over 900 lines of custom CSS nobody remembers writing
- **GSAP** — for animations that feel like motion, not just CSS transitions pretending
- **EmailJS** — a contact form with zero backend and zero excuses
- **Lucide React & React Icons** — because hand-drawn SVGs are a weekend nobody has

## Running It Yourself

```bash
git clone https://github.com/SupremeStha/Portfolio.git
cd Portfolio
npm install
npm run dev
```

Open the local URL Vite gives you, and you're in.

Other commands worth knowing:

```bash
npm run build      # production build
npm run preview    # preview that build locally
npm run lint        # keep the code honest
```

## Why It Looks Like This

Portfolios are supposed to prove you can build things — so this one avoids the trap of being a Word document with a nice font. Every section is a real component, every animation is intentional, and the click sparks exist purely because a portfolio site is the one place you're allowed to have a little fun with something that serves no functional purpose at all.

## A Note on the Contact Form

It's wired up with EmailJS, meaning a message sent through this site lands directly in an inbox — not a console log, not a black hole. If you're reading this on GitHub and thinking about reaching out, the form on the live site is the fastest way.
