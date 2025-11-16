// RFC 5322 compliant email validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Email validation
export function validateEmail(email: string): string | undefined {
  if (!email) {
    return "Email is required";
  }
  if (typeof email !== "string") {
    return "Invalid email format";
  }
  // Trim whitespace
  email = email.trim();

  // Check length (max 254 chars per RFC 5321)
  if (email.length > 254) {
    return "Email address is too long";
  }

  // Check format with regex
  if (!EMAIL_REGEX.test(email)) {
    return "Invalid email address format";
  }
}

// Password validation with complexty requirements
export function validatePassword(password: string): string | undefined {
  if (!password) {
    return "Password is required";
  }
  if (typeof password !== "string") {
    return "Invalid password format";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (password.length > 72) {
    return "Password must be less than 72 characters";
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return "Password must contain uppercase, lowercase, number, and special character";
  }
}

// Name validation
export function validateName(name: string): string | undefined {
  if (!name) {
    return "Name is required";
  }
  if (typeof name !== "string") {
    return "Invalid name format";
  }

  name = name.trim();

  if (name.length < 2) {
    return "Name must be at least 2 characters long";
  }

  if (name.length > 100) {
    return "Name must be less than 100 characters";
  }

  if (/<script|<iframe|javascript:|onerror=/i.test(name)) {
    return "Name contains invalid characters";
  }
}

// Generic required field validation with sanitization
export function validateRequired(value: string, fieldName: string): string | undefined {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    return `${fieldName} is required`;
  }

  if (/<script|<iframe|javascript:|onerror=/i.test(value)) {
    return `${fieldName} contains invalid characters`;
  }
}

// Project name validation
export function validateProjectName(name: string): string | undefined {
  if (!name) {
    return "Project name is required";
  }
  if (typeof name !== "string") {
    return "Invalid project name format";
  }

  name = name.trim();

  if (name.length < 3) {
    return "Project name must be at least 3 characters long";
  }

  if (name.length > 100) {
    return "Project name must be less than 100 characters";
  }

  if (/<script|<iframe|javascript:|onerror=/i.test(name)) {
    return "Project name contains invalid characters";
  }
}

// Contact name validation for canvassing notes
export function validateContactName(name: string): string | undefined {
  if (!name) {
    return "Contact name is required";
  }
  if (typeof name !== "string") {
    return "Invalid contact name format";
  }

  name = name.trim();

  if (name.length < 2) {
    return "Contact name must be at least 2 characters long";
  }

  if (name.length > 100) {
    return "Contact name must be less than 100 characters";
  }

  if (/<script|<iframe|javascript:|onerror=/i.test(name)) {
    return "Contact name contains invalid characters";
  }
}

// Notes validation for canvassing
export function validateNotes(notes: string): string | undefined {
  if (!notes) {
    return "Notes are required";
  }
  if (typeof notes !== "string") {
    return "Invalid notes format";
  }

  notes = notes.trim();

  if (notes.length < 10) {
    return "Notes must be at least 10 characters long";
  }

  if (notes.length > 10000) {
    return "Notes must be less than 10,000 characters";
  }

  if (/<script|<iframe|javascript:|onerror=/i.test(notes)) {
    return "Notes contain invalid content";
  }
}
