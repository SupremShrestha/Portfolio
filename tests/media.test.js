import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PROJECTS } from '../src/data/projects.js';
import { PROJECT_MEDIA, PHOTOGRAPHS } from '../src/data/media.js';
import { CASE_STUDIES } from '../src/data/caseStudies.js';

test('every registered media asset belongs to a real project and exists locally', () => {
  for (const [id, media] of Object.entries(PROJECT_MEDIA)) {
    assert.ok(PROJECTS.some(project => project.id === id), id);
    for (const field of ['screenshot', 'video']) if (media[field]) {
      assert.ok(!media[field].startsWith('/'), 'Media paths must preserve deployment subpaths');
      assert.ok(existsSync(resolve('public', media[field])), media[field]);
    }
    if (media.screenshot) assert.ok(media.alt?.length > 15, id + ' needs useful alt text');
  }
  for (const photo of PHOTOGRAPHS) {
    assert.ok(existsSync(resolve('public', photo.src)), photo.src);
    assert.ok(photo.alt?.length > 15);
  }
});

test('featured case studies have complete narratives and valid source links', () => {
  for (const project of PROJECTS.slice(0, 3)) {
    assert.equal(project.caseStudy, CASE_STUDIES[project.id]);
    for (const field of ['problem', 'build', 'outcome', 'evidence']) assert.ok(project.caseStudy[field].length > 30);
    assert.ok(project.caseStudy.decisions.length >= 2);
    assert.ok(project.github.startsWith('https://github.com/SupremShrestha/'));
  }
});

test('future media folders exist without registering missing placeholders', () => {
  for (const project of PROJECTS.slice(0, 3)) assert.ok(existsSync(resolve('public/media/projects', project.id)));
  assert.ok(existsSync('public/media/photography'));
  assert.ok(existsSync('public/media/README.md'));
});
