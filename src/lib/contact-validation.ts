export interface ContactFields {
  name: string;
  email: string;
  message: string;
}

export type ContactField = keyof ContactFields;
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactFields(fields: ContactFields): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  if (!fields.name.trim()) {
    errors.name = 'Enter your name.';
  }

  const email = fields.email.trim();
  if (!email) {
    errors.email = 'Enter your email address.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!fields.message.trim()) {
    errors.message = 'Enter a message.';
  }

  return errors;
}
