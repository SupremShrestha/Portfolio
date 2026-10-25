import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { CONTACT_EMAIL, createContactMessage, createMailto, validateContact } from '../src/lib/contact.js';
import { filterProjects, PROJECTS, PROJECT_CATEGORIES } from '../src/data/projects.js';

const validContact = {
  name: '  Sam Example  ',
  email: '  sam@example.com  ',
  message: '  I would like to talk about a new project.  ',
};

test('the form rejects blank and whitespace-only submissions', () => {
  assert.deepEqual(Object.keys(validateContact({ name: ' ', email: ' ', message: ' ' })), ['name', 'email', 'message']);
});

test('valid contact details are accepted with surrounding whitespace', () => {
  assert.deepEqual(validateContact(validContact), {});
});

test('invalid emails, short messages, and overlong messages are rejected', () => {
  for (const email of ['sam', 'sam@', 'sam@example', 'sam @example.com', 'a@b@example.com']) {
    assert.ok(validateContact({ ...validContact, email }).email, email);
  }
  assert.ok(validateContact({ ...validContact, message: 'hello' }).message);
  assert.ok(validateContact({ ...validContact, message: 'a'.repeat(3001) }).message);
  assert.equal(validateContact({ ...validContact, message: 'a'.repeat(3000) }).message, undefined);
});

test('email drafts preserve newlines, Unicode, and reserved URL characters without adding recipients', () => {
  const values = { name: 'Zoë & Co?', email: 'zoe@example.com', message: 'A project about C++ & AI?\nBudget: 50% + ideas #1' };
  const url = new URL(createMailto(values));
  assert.equal(url.pathname, CONTACT_EMAIL);
  assert.equal(url.searchParams.get('subject'), 'Portfolio enquiry from ' + values.name);
  assert.equal(url.searchParams.get('body'), createContactMessage(values));
  assert.deepEqual([...url.searchParams.keys()], ['subject', 'body']);
});

test('filter categories cover every project exactly once', () => {
  assert.equal(filterProjects('All projects').length, 17);
  const filtered = PROJECT_CATEGORIES.slice(1).flatMap((category) => filterProjects(category));
  assert.equal(filtered.length, PROJECTS.length);
  assert.equal(new Set(filtered.map((project) => project.id)).size, PROJECTS.length);
  assert.equal(filterProjects('AI & data').length, 6);
  assert.equal(filterProjects('Development').length, 9);
  assert.equal(filterProjects('IoT').length, 1);
  assert.equal(filterProjects('Automation').length, 1);
  assert.deepEqual(filterProjects('unknown category'), []);
});

test('the complete requested repository set has local covers and six curated highlights', () => {
  const expected = [
    'GroupRideSharingApp', 'robotic-arm-rl', 'sonar-mine-and-rock-classifier',
    'Risk_Evaluation_Platform', 'Car-Dealership-Website', 'Portfolio',
    'Analysis-and-Predictive-Modeling-of-Automobile-Fuel-Efficiency', 'Code-Crunch',
    'Seoul-Bike-Pipeline', 'Restaurant-SAAS', 'n8n-mqtf7eir', 'FlightBookingSystem',
    'Personal-Expense-Tracker', 'airline-passenger-satisfaction-ml', 'CVisionary',
    'Smart-Water-Conservation-System-IOT', 'Hospital-Management-System',
  ];
  assert.deepEqual(PROJECTS.map((project) => project.repository).sort(), expected.sort());
  assert.equal(new Set(PROJECTS.map((project) => project.id)).size, 17);
  assert.equal(PROJECTS.filter((project) => project.featured).length, 6);
  for (const project of PROJECTS) {
    assert.ok(existsSync(new URL('../public/' + project.image, import.meta.url)), project.image);
    const repository = new URL(project.github);
    assert.equal(repository.hostname, 'github.com');
    assert.equal(repository.pathname, '/SupremShrestha/' + project.repository);
    assert.ok(project.highlights.length > 0);
  }
});

test('search reaches archived projects, handles spacing, and combines with category filters', () => {
  assert.deepEqual(filterProjects('All projects', 'PHP').map((project) => project.id), ['expense-tracker']);
  assert.deepEqual(filterProjects('All projects', '  REACT   native  ').map((project) => project.id), ['group-ride-sharing']);
  assert.deepEqual(filterProjects('All projects', 'Risk_Evaluation_Platform').map((project) => project.id), ['risk-evaluation']);
  assert.deepEqual(filterProjects('Automation', 'PostgreSQL').map((project) => project.id), ['n8n-automation']);
  assert.deepEqual(filterProjects('IoT', 'PHP'), []);
  assert.deepEqual(filterProjects('All projects', 'no-such-project-xyz'), []);
  assert.equal(filterProjects('All projects', '   ').length, PROJECTS.length);
  for (const project of PROJECTS) {
    assert.ok(filterProjects('All projects', project.repository).some((result) => result.id === project.id), project.repository);
  }
});
