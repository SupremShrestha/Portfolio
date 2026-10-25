/**
 * Shared project navigation contract.
 *
 * getProjectHref(id) is safe during SSR and provides an ordinary relative link
 * that works with a base path, ordinary navigation, and new tabs.
 *
 * navigateToProject(id) preserves the current path and all non-project query
 * parameters, sets ?project=<id>#projects, and pushes one history entry unless
 * that exact URL is already current. It then dispatches the window CustomEvent
 * `portfolio:project-open` with detail { projectId: id }.
 *
 * The Projects gallery reads the URL on that event and on native `popstate`;
 * consumers need no shared React state. Close any other modal before calling.
 * Browser Back/Forward changes selection without pushing another entry.
 */
export const PROJECT_OPEN_EVENT = 'portfolio:project-open';

export function getProjectHref(id) {
  return '?project=' + encodeURIComponent(id) + '#projects';
}

export function getProjectShareUrl(id) {
  if (typeof window === 'undefined') return getProjectHref(id);
  const url = new URL(window.location.href);
  url.searchParams.set('project', id);
  url.hash = 'projects';
  return url.href;
}

export function navigateToProject(id) {
  const href = getProjectShareUrl(id);
  if (typeof window === 'undefined') return href;
  if (window.location.href !== href) window.history.pushState(window.history.state, '', href);
  window.dispatchEvent(new window.CustomEvent(PROJECT_OPEN_EVENT, { detail: { projectId: id } }));
  return href;
}

// URL parsing does not assume that an ID exists in the portfolio's data.
// The gallery validates IDs against PROJECTS before opening a dialog.
export function getProjectIdFromUrl(href) {
  const source = href ?? (typeof window !== 'undefined' ? window.location.href : '');
  if (!source) return null;
  try { return new URL(source, 'https://portfolio.local/').searchParams.get('project') || null; }
  catch { return null; }
}

// Explicit dialog close replaces the current entry instead of navigating Back.
// This removes only the project parameter and never dispatches an open event.
// Popstate-driven closes must not call this: their URL already belongs to history.
export function clearProjectUrl() {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  url.searchParams.delete('project');
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url.href);
  return url.href;
}

// Reports clipboard failure instead of claiming success. The caller can expose
// the returned URL in a selectable field for manual copying.
export async function copyProjectShareLink(id, clipboard) {
  const url = getProjectShareUrl(id);
  try {
    const target = clipboard === undefined ? (typeof navigator !== 'undefined' ? navigator.clipboard : null) : clipboard;
    if (!target?.writeText) return { copied: false, url };
    await target.writeText(url);
    return { copied: true, url };
  } catch { return { copied: false, url }; }
}
