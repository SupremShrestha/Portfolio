# Add your own media

These folders are ready for project screenshots, demo clips, and photographs. No placeholder file is requested by the website.

## Project screenshots and video

Put files in the matching folder under `projects/`, for example:

- `projects/group-ride-sharing/screenshot.webp`
- `projects/group-ride-sharing/demo.mp4`
- `projects/robotic-arm-rl/screenshot.webp`
- `projects/risk-evaluation/screenshot.webp`

Register a file in `src/data/media.js`, inside `PROJECT_MEDIA`:

```js
'group-ride-sharing': {
  screenshot: 'media/projects/group-ride-sharing/screenshot.webp',
  video: 'media/projects/group-ride-sharing/demo.mp4', // optional
  alt: 'Describe what your screenshot actually shows.',
  caption: 'A short description of the recorded workflow.',
},
```

Add either file or both. Screenshots appear in the showcase, archive preview, and project details. Videos appear with playback controls in project details; they never autoplay. Omit `video` until the clip exists. Paths are relative to `public/`, with no leading slash.

Use WebP, PNG, or JPG for screenshots; ideally around 1600 pixels wide and below 500 KB. Use a short MP4 or WebM for a demo. Include useful image descriptions and captions.

## Photography

Put your photos in `photography/`, then add entries to `PHOTOGRAPHS` in `src/data/media.js`:

```js
export const PHOTOGRAPHS = [
  {
    src: 'media/photography/kathmandu.webp',
    alt: 'A description of the photograph.',
    caption: 'A moment worth keeping.',
    location: 'Kathmandu, Nepal',
  },
];
```

Your gallery appears above the photography framing experiment when this list has entries. The illustrated study remains available.

Run `npm run build` and deploy the rebuilt site after adding media. During `npm run dev`, changes update locally.
