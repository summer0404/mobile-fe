export const validateEmail = (email: string): string | null => {
  const regex = /^\S+@\S+\.\S+$/;
  if (!email) return 'Email is required';
  if (!regex.test(email)) return 'Invalid email format';
  return null;
};

export const validateName = (name: string, field = 'Name'): string | null => {
  if (!name) return `${field} is required`;
  if (name.length < 2) return `${field} is too short`;
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 255) return 'Password must be at most 255 characters';
  return null;
};


export const validateConfirmPassword = (password: string, confirm: string): string | null => {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return null;
};