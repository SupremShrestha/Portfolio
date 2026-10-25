import test from 'node:test';
import assert from 'node:assert/strict';
import { clearProjectUrl, copyProjectShareLink, getProjectHref, getProjectIdFromUrl, getProjectShareUrl, navigateToProject, PROJECT_OPEN_EVENT } from '../src/lib/projectNavigation.js';

function mockBrowser(href) {
  const browser = new EventTarget();
  const entries = [{ href, state: { existing: 'keep me' } }];
  let index = 0;
  browser.location = { href };
  browser.CustomEvent = class extends Event {
    constructor(type, options) { super(type); this.detail = options.detail; }
  };
  const travel = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= entries.length) return;
    index = nextIndex;
    browser.location.href = entries[index].href;
    browser.dispatchEvent(new Event('popstate'));
  };
  browser.history = {
    get state() { return entries[index].state; },
    get length() { return entries.length; },
    pushState(state, _unused, nextHref) {
      entries.splice(index + 1);
      entries.push({ href: String(nextHref), state });
      index += 1;
      browser.location.href = String(nextHref);
    },
    replaceState(state, _unused, nextHref) {
      entries[index] = { href: String(nextHref), state };
      browser.location.href = String(nextHref);
    },
    back() { travel(index - 1); },
    forward() { travel(index + 1); },
  };
  return browser;
}

async function withBrowser(href, run) {
  const previous = globalThis.window;
  globalThis.window = mockBrowser(href);
  try { await run(globalThis.window); }
  finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
}

test('project links and URL reads work before a browser exists', () => {
  assert.equal(typeof window, 'undefined');
  assert.equal(getProjectHref('a/b & c'), '?project=a%2Fb%20%26%20c#projects');
  assert.equal(navigateToProject('group-ride-sharing'), '?project=group-ride-sharing#projects');
  assert.equal(getProjectShareUrl('tableflow'), '?project=tableflow#projects');
  assert.equal(getProjectIdFromUrl(), null);
  assert.equal(getProjectIdFromUrl('?project=robotic-arm-rl#projects'), 'robotic-arm-rl');
  assert.equal(getProjectIdFromUrl('https://example.com/Portfolio/?project=flight-booking#projects'), 'flight-booking');
  assert.equal(getProjectIdFromUrl('?project='), null);
  assert.equal(getProjectIdFromUrl('http://['), null);
});

test('initial deep links, base paths, query parameters, and history navigation stay intact', async () => {
  await withBrowser('https://example.com/Portfolio/?ref=friend&tag=one&tag=two#about', async (browser) => {
    const opened = [];
    const popped = [];
    browser.addEventListener(PROJECT_OPEN_EVENT, (event) => opened.push({ id: event.detail.projectId, href: browser.location.href }));
    browser.addEventListener('popstate', () => popped.push(getProjectIdFromUrl()));

    assert.equal(getProjectIdFromUrl(), null);
    const first = navigateToProject('restaurant-saas');
    assert.equal(first, 'https://example.com/Portfolio/?ref=friend&tag=one&tag=two&project=restaurant-saas#projects');
    assert.equal(getProjectIdFromUrl(), 'restaurant-saas');
    assert.deepEqual(browser.history.state, { existing: 'keep me' });
    assert.equal(opened[0].id, 'restaurant-saas');
    assert.equal(opened[0].href, first, 'the URL is updated before consumers receive the event');
    assert.equal(browser.history.length, 2);

    navigateToProject('restaurant-saas');
    assert.equal(browser.history.length, 2, 'opening an already-current project does not duplicate history');
    navigateToProject('flight-booking');
    assert.equal(browser.history.length, 3);
    browser.history.back();
    assert.equal(getProjectIdFromUrl(), 'restaurant-saas');
    browser.history.back();
    assert.equal(getProjectIdFromUrl(), null);
    assert.equal(browser.location.href, 'https://example.com/Portfolio/?ref=friend&tag=one&tag=two#about');
    browser.history.forward();
    assert.equal(getProjectIdFromUrl(), 'restaurant-saas');
    assert.deepEqual(popped, ['restaurant-saas', null, 'restaurant-saas']);
    assert.equal(opened.length, 3, 'Back/Forward do not produce a second custom open event');
    browser.history.forward();
    assert.equal(getProjectIdFromUrl(), 'flight-booking', 'a history-driven close must leave the Forward entry usable');
  });
});

test('explicit close removes only the project query without emitting another open or changing history length', async () => {
  await withBrowser('https://example.com/nested/Portfolio/?ref=friend&project=robotic-arm-rl&mode=dark#projects', async (browser) => {
    let events = 0;
    browser.addEventListener(PROJECT_OPEN_EVENT, () => { events += 1; });
    assert.equal(getProjectIdFromUrl(), 'robotic-arm-rl', 'an initial-load URL can be parsed directly');
    const result = clearProjectUrl();
    assert.equal(result, 'https://example.com/nested/Portfolio/?ref=friend&mode=dark#projects');
    assert.equal(getProjectIdFromUrl(), null);
    assert.equal(browser.history.length, 1);
    assert.equal(events, 0);
    assert.deepEqual(browser.history.state, { existing: 'keep me' });
    clearProjectUrl();
    assert.equal(browser.history.length, 1);
  });
});

test('sharing preserves the current URL and clipboard failures return a manual-copy URL', async () => {
  await withBrowser('https://example.com/Portfolio/?ref=friend&project=old#contact', async (browser) => {
    const before = browser.location.href;
    const expected = 'https://example.com/Portfolio/?ref=friend&project=expense-tracker#projects';
    assert.equal(getProjectShareUrl('expense-tracker'), expected);
    assert.equal(browser.location.href, before, 'constructing a share URL must not navigate');
    let copiedText;
    assert.deepEqual(await copyProjectShareLink('expense-tracker', { writeText: async (text) => { copiedText = text; } }), { copied: true, url: expected });
    assert.equal(copiedText, expected);
    assert.deepEqual(await copyProjectShareLink('expense-tracker', { writeText: async () => { throw new Error('Permission denied'); } }), { copied: false, url: expected });
    assert.deepEqual(await copyProjectShareLink('expense-tracker', null), { copied: false, url: expected });
    assert.equal(browser.location.href, before);
  });
});
