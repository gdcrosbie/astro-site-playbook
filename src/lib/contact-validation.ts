export interface ContactFields {
  name: string;
  email: string;
  message: string;
}

export type ContactField = keyof ContactFields;
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINE_BREAK_PATTERN = /[\r\n]/;

export const CONTACT_FIELD_LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
} as const;

export function validateContactFields(fields: ContactFields): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  const name = fields.name.trim();
  if (!name) {
    errors.name = 'Enter your name.';
  } else if (name.length > CONTACT_FIELD_LIMITS.name) {
    errors.name = `Name must be ${CONTACT_FIELD_LIMITS.name} characters or fewer.`;
  } else if (LINE_BREAK_PATTERN.test(name)) {
    errors.name = 'Enter your name without line breaks.';
  }

  const email = fields.email.trim();
  if (!email) {
    errors.email = 'Enter your email address.';
  } else if (email.length > CONTACT_FIELD_LIMITS.email) {
    errors.email = `Email must be ${CONTACT_FIELD_LIMITS.email} characters or fewer.`;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  const message = fields.message.trim();
  if (!message) {
    errors.message = 'Enter a message.';
  } else if (message.length > CONTACT_FIELD_LIMITS.message) {
    errors.message = `Message must be ${CONTACT_FIELD_LIMITS.message} characters or fewer.`;
  }

  return errors;
}
