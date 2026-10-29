import test from 'node:test';
import assert from 'node:assert/strict';
import { tabDestination } from '../src/lib/sectionInteractions.js';
import { CONVERSATION_TOPICS, messageForTopic, resolveConversationTopic } from '../src/data/conversation.js';
import { DISCIPLINES, EDUCATION } from '../src/data/profile.js';
import { PROJECTS } from '../src/data/projects.js';

test('interest and education tabs support orientation, wrapping, and boundary shortcuts', () => {
  assert.equal(tabDestination('ArrowRight', 3, 4), 0);
  assert.equal(tabDestination('ArrowLeft', 0, 4), 3);
  assert.equal(tabDestination('ArrowRight', 1, 4), 2);
  assert.equal(tabDestination('ArrowDown', 1, 4), null);
  assert.equal(tabDestination('ArrowDown', 2, 3, 'vertical'), 0);
  assert.equal(tabDestination('ArrowUp', 0, 3, 'vertical'), 2);
  assert.equal(tabDestination('ArrowRight', 1, 3, 'vertical'), null);
  for (const orientation of ['horizontal', 'vertical']) {
    assert.equal(tabDestination('Home', 2, 3, orientation), 0);
    assert.equal(tabDestination('End', 0, 3, orientation), 2);
    assert.equal(tabDestination('Tab', 1, 3, orientation), null);
    assert.equal(tabDestination('Enter', 1, 3, orientation), null);
  }
  assert.equal(tabDestination('ArrowRight', 0, 0), null);
});

test('conversation choices replace only empty or untouched starter messages', () => {
  for (const next of CONVERSATION_TOPICS) {
    assert.equal(messageForTopic('', next.id), next.starter);
    assert.equal(messageForTopic('  \n ', next.id), next.starter);
    for (const previous of CONVERSATION_TOPICS) {
      assert.equal(messageForTopic(previous.starter, next.id), next.starter);
      assert.equal(messageForTopic('  ' + previous.starter + '\n', next.id), next.starter);
    }
  }
});

test('conversation choices preserve edits verbatim and recover obsolete stored topics', () => {
  const drafts = ['My own project idea, with a few notes.\n\n  Keep this spacing. ', CONVERSATION_TOPICS[0].starter.replace('The idea is…', 'The idea is a walking map.')];
  for (const draft of drafts) {
    for (const next of CONVERSATION_TOPICS) assert.equal(messageForTopic(draft, next.id), draft);
    assert.equal(messageForTopic(draft, 'obsolete-topic'), draft);
  }
  assert.equal(resolveConversationTopic('obsolete-topic'), CONVERSATION_TOPICS[0]);
  assert.equal(messageForTopic(null, 'obsolete-topic'), CONVERSATION_TOPICS[0].starter);
});

test('profile chapters and disciplines link to real projects', () => {
  const ids = new Set(PROJECTS.map(project => project.id));
  for (const item of [...DISCIPLINES, ...EDUCATION].filter(item => item.project)) {
    assert.ok(ids.has(item.project), 'Unknown project: ' + item.project);
  }
  assert.equal(EDUCATION.filter(chapter => chapter.current).length, 1);
  assert.equal(EDUCATION.at(-1).current, true);
});
