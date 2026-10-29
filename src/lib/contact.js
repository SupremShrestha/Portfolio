export const CONTACT_EMAIL = 'ssuprim26@gmail.com';

export function validateContact(values) {
  const errors = {};
  const name = typeof values?.name === 'string' ? values.name.trim() : '';
  const email = typeof values?.email === 'string' ? values.email.trim() : '';
  const message = typeof values?.message === 'string' ? values.message : '';
  if (name.length < 2 || name.length > 100 || /[\r\n]/.test(name)) errors.name = 'Please enter a name between 2 and 100 characters.';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (message.trim().length < 10) errors.message = 'Tell me a little more (at least 10 characters).';
  if (message.length > 3000) errors.message = 'Please keep your message under 3,000 characters.';
  return errors;
}

export function createContactMessage(values) {
  return values.message.trim() + '\n\n— ' + values.name.trim() + ' (' + values.email.trim() + ')';
}

export function createMailto(values) {
  const params = new URLSearchParams({
    subject: 'Portfolio enquiry from ' + values.name.trim(),
    body: createContactMessage(values),
  });
  return 'mailto:' + CONTACT_EMAIL + '?' + params.toString().replace(/\+/g, '%20');
}
