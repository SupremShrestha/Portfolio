import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { runInThisContext } from 'node:vm';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PROJECTS } from '../src/data/projects.js';

test('the complete portfolio renders with working anchor targets and local assets', async () => {
  const result = await build({
    entryPoints: ['src/App.jsx'],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
    jsx: 'automatic',
    loader: { '.css': 'empty' },
    external: ['react', 'react-dom', '@emailjs/browser'],
    define: { 'import.meta.env': JSON.stringify({ BASE_URL: './' }) },
  });
  const require = createRequire(resolve('package.json'));
  const compiled = { exports: {} };
  runInThisContext('(function(require, module, exports) {' + result.outputFiles[0].text + '\n})')(require, compiled, compiled.exports);
  const html = renderToStaticMarkup(createElement(compiled.exports.default));
  const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]));
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(target), 'Missing anchor target: ' + target);
  const projectIds = new Set(PROJECTS.map((project) => project.id));
  let projectLinks = 0;
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    const url = new URL(href.replaceAll('&amp;', '&'), 'https://example.com/Portfolio/');
    if (!url.searchParams.has('project')) continue;
    assert.ok(projectIds.has(url.searchParams.get('project')), 'Unknown project link: ' + href);
    assert.equal(url.pathname, '/Portfolio/', 'Project links must preserve deployment subpaths');
    assert.equal(url.hash, '#projects');
    projectLinks += 1;
  }
  assert.ok(projectLinks >= 6, 'The showcase, archive, and disciplines should link directly to real projects');
  for (const [, source] of html.matchAll(/<img[^>]+src="([^"]+)"/g)) assert.ok(existsSync(resolve('public', source.replace(/^\.\//, ''))), 'Missing image: ' + source);
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
  assert.equal([...html.matchAll(/<article class="showcase-panel"/g)].length, 3);
  assert.equal([...html.matchAll(/class="archive-row"/g)].length, 6);
  assert.ok(html.includes('Show all 17 projects'));
  assert.ok(html.includes('Search all 17 projects'));
  assert.ok(html.includes('id="project-search"'));
  assert.ok(!html.includes('github.com/SupremeStha'));
  for (const label of ['Void theme', 'Ion theme', 'Pearl theme', 'Pause animations', 'Interactive particle field', 'Reset particle field', 'Email me directly', 'Open navigation menu', 'Start a conversation', 'Flight progress']) assert.ok(html.includes(label), 'Missing interaction: ' + label);
  for (const interest of ['aviation', 'photography', 'music', 'astronomy']) {
    assert.ok(ids.has('tab-' + interest));
    assert.ok(ids.has('panel-' + interest));
  }
  assert.ok(html.includes('aria-label="Skills and disciplines"'));
  assert.ok(html.includes('aria-label="Filter projects by category"'));
  for (const skill of ['interfaces', 'intelligence', 'data', 'systems']) {
    const trigger = html.match(new RegExp('<button[^>]*id="skill-' + skill + '"[^>]*>'))?.[0];
    assert.ok(trigger?.includes('aria-controls="skill-panel-' + skill + '"'));
    assert.ok(trigger.includes('aria-expanded="' + (skill === 'interfaces') + '"'));
    const panel = html.match(new RegExp('<div[^>]*id="skill-panel-' + skill + '"[^>]*>'))?.[0];
    assert.ok(panel?.includes('aria-labelledby="skill-' + skill + '"'));
    if (skill !== 'interfaces') assert.ok(panel.includes('inert=""'), 'Collapsed skills must not remain keyboard focusable');
  }
  assert.ok(html.includes('aria-label="Music patterns"'));
  assert.ok(html.includes('Next star'));
  assert.ok(html.includes('Your edits stay when you switch.'));
});

test('project media, case studies, and the future photo gallery render with subpath-safe assets', async () => {
  const result = await build({
    stdin: {
      contents: "export { default as ProjectVisual } from './src/experience/ProjectVisual.jsx'; export { ProjectCaseStudy } from './src/experience/Work.jsx'; export { PhotoGallery } from './src/experience/Interests.jsx';",
      resolveDir: resolve('.'),
    },
    bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic',
    loader: { '.css': 'empty' }, external: ['react', 'react-dom'],
    define: { 'import.meta.env': JSON.stringify({ BASE_URL: '/Portfolio/' }) },
  });
  const require = createRequire(resolve('package.json'));
  const compiled = { exports: {} };
  runInThisContext('(function(require, module, exports) {' + result.outputFiles[0].text + '\n})')(require, compiled, compiled.exports);
  const { ProjectVisual, ProjectCaseStudy, PhotoGallery } = compiled.exports;
  for (const project of PROJECTS.filter(item => item.media?.screenshot)) {
    const html = renderToStaticMarkup(createElement(ProjectVisual, { project }));
    assert.ok(html.includes('src="/Portfolio/' + project.media.screenshot + '"'));
    assert.ok(html.includes('loading="lazy"'));
    assert.ok(html.includes(project.media.alt));
  }
  const fallback = renderToStaticMarkup(createElement(ProjectVisual, { project: PROJECTS[0] }));
  assert.ok(fallback.includes('conceptual illustration'));
  assert.ok(!fallback.includes('<img'));
  const study = renderToStaticMarkup(createElement(ProjectCaseStudy, { study: PROJECTS[0].caseStudy }));
  for (const heading of ['THE PROBLEM', 'THE BUILD', 'ENGINEERING DECISIONS', 'THE RESULT']) assert.ok(study.includes(heading));
  assert.equal(renderToStaticMarkup(createElement(PhotoGallery, { photos: [] })), '');
  const gallery = renderToStaticMarkup(createElement(PhotoGallery, { photos: [
    { src: 'media/photography/example.webp', alt: 'An example photograph used by this test.', caption: 'A sample frame.', location: 'Kathmandu' },
    { src: 'media/photography/example-2.webp', alt: 'A second example photograph used by this test.', caption: 'Another frame.' },
  ] }));
  assert.ok(gallery.includes('src="/Portfolio/media/photography/example.webp"'));
  assert.ok(gallery.includes('Previous photograph'));
  assert.ok(gallery.includes('Next photograph'));
  assert.ok(gallery.includes('A sample frame.'));
});

test('education and interest panels expose their selected chapters and contact progress reflects valid details', async () => {
  const result = await build({
    stdin: {
      contents: "export { Journey } from './src/experience/About.jsx'; export { default as Interests } from './src/experience/Interests.jsx'; export { ContactProgress } from './src/experience/Contact.jsx';",
      resolveDir: resolve('.'),
    },
    bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic',
    loader: { '.css': 'empty' }, external: ['react', 'react-dom'],
    define: { 'import.meta.env': JSON.stringify({ BASE_URL: '/Portfolio/' }) },
  });
  const require = createRequire(resolve('package.json'));
  const compiled = { exports: {} };
  runInThisContext('(function(require, module, exports) {' + result.outputFiles[0].text + '\n})')(require, compiled, compiled.exports);
  const { Journey, Interests, ContactProgress } = compiled.exports;
  const journey = renderToStaticMarkup(createElement(Journey));
  assert.ok(journey.includes('aria-orientation="vertical"'));
  assert.ok(journey.includes('Still becoming'));
  for (const id of ['foundations', 'science', 'degree']) {
    const tab = journey.match(new RegExp('<button[^>]*id="chapter-tab-' + id + '"[^>]*>'))?.[0];
    const panel = journey.match(new RegExp('<div[^>]*id="chapter-panel-' + id + '"[^>]*>'))?.[0];
    assert.ok(tab?.includes('aria-controls="chapter-panel-' + id + '"'));
    assert.ok(panel?.includes('aria-labelledby="chapter-tab-' + id + '"'));
    assert.equal(tab.includes('aria-selected="true"'), id === 'degree');
    assert.equal(tab.includes('tabindex="0"'), id === 'degree');
    assert.equal(panel.includes('hidden=""'), id !== 'degree');
  }
  const interests = renderToStaticMarkup(createElement(Interests));
  for (const id of ['aviation', 'photography', 'music', 'astronomy']) {
    const panel = interests.match(new RegExp('<div[^>]*id="panel-' + id + '"[^>]*>'))?.[0];
    assert.ok(panel, 'Every exhibit remains mounted to retain visitor settings');
    assert.equal(panel.includes('hidden=""'), id !== 'aviation');
  }
  assert.ok(interests.includes('Photo exposure'));
  assert.ok(interests.includes('Music tempo'));
  assert.ok(interests.includes('Explore Betelgeuse'));
  for (const [values, count] of [
    [{ name: '', email: '', message: '' }, 0],
    [{ name: 'Visitor', email: 'invalid', message: 'A question about a project.' }, 2],
    [{ name: 'Visitor', email: 'visitor@example.com', message: 'A question about a project.' }, 3],
  ]) {
    const progress = renderToStaticMarkup(createElement(ContactProgress, { values }));
    assert.ok(progress.includes('aria-valuenow="' + count + '"'));
    assert.equal([...progress.matchAll(/data-complete="true"/g)].length, count);
  }
});
