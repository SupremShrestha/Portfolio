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
  for (const label of ['Void theme', 'Ion theme', 'Pearl theme', 'Pause animations', 'Interactive particle field', 'Reset particle field', 'Open email draft', 'Open navigation menu', 'Start a conversation']) assert.ok(html.includes(label), 'Missing interaction: ' + label);
  assert.ok(html.includes('aria-label="Skills and disciplines"'));
  assert.ok(html.includes('aria-label="Filter projects by category"'));
  assert.ok(html.includes('<details'));
});
