export const CONTACT_EMAIL = 'ssuprim26@gmail.com';

export function validateContact(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your name (at least 2 characters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Please enter a valid email address.';
  if (values.message.trim().length < 10) errors.message = 'Tell me a little more (at least 10 characters).';
  if (values.message.length > 3000) errors.message = 'Please keep your message under 3,000 characters.';
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
