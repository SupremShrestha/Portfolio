# Project artwork

These 17 local SVG covers are original illustrative artwork, not product screenshots. Each is 1200 × 750 pixels (8:5). The six featured projects have custom concepts: a shared ride map, a simulated robot arm, a spatial risk study, an ML pipeline, a restaurant interface, and a sonar signal. The remaining projects use a coordinated abstract series.

The editable generator is `scripts/generate-project-covers.mjs`. Run `node scripts/generate-project-covers.mjs` to regenerate SVG covers. Projects whose image field points to a PNG, JPG, or WebP are skipped. No external assets or font services are used.

| File slug | Project |
| --- | --- |
| `group-ride-sharing` | Group Ride Sharing |
| `robotic-arm-rl` | Robotic Arm RL |
| `sonar-classifier` | Sonar Classifier |
| `risk-evaluation` | Risk Evaluation Platform |
| `car-dealership` | Car Dealership |
| `portfolio` | Portfolio |
| `fuel-efficiency` | Fuel Efficiency Modeling |
| `code-crunch` | Code Crunch |
| `seoul-bike-pipeline` | Seoul Bike Pipeline |
| `restaurant-saas` | TableFlow |
| `n8n-automation` | n8n Automation |
| `flight-booking` | Flight Booking System |
| `expense-tracker` | Personal Expense Tracker |
| `airline-satisfaction` | Airline Satisfaction ML |
| `cvisionary` | CVisionary |
| `water-conservation` | Smart Water Conservation |
| `hospital-management` | Hospital Management System |

## Replace a cover with your project image

1. Add your PNG, JPG, or WebP image to `public/projects/`. A 1200 × 750 image or another 8:5 image fits these covers best.
2. Find the matching project in `src/data/projects.js` and change its `image` field from `projects/<slug>.svg` to your new filename, for example:

   ```js
   image: 'projects/group-ride-sharing.png',
   ```

3. Run `npm run build` after replacing images, then publish the rebuilt site.

The portfolio resolves these paths relative to `import.meta.env.BASE_URL`, so they also work under the repository subpath on GitHub Pages. Keep the data value relative (`projects/filename.png`), without a leading slash or an extra `public/` prefix.

If you keep a `.svg` filename, its contents must remain real SVG markup. Do not rename a PNG or JPG to `.svg`; use the correct extension and update the data field instead. Add useful alt text in the matching project entry if the image content changes.
