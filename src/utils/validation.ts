// Validation utilities

export const validateProjectName = (
  name: string,
): { isValid: boolean; error?: string } => {
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Название проекта не может быть пустым' };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: 'Название проекта должно содержать минимум 2 символа',
    };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: 'Название проекта не может превышать 100 символов',
    };
  }

  // Check for potentially dangerous characters (XSS protection)
  const dangerousChars = /<script|javascript:|data:|vbscript:/i;
  if (dangerousChars.test(trimmed)) {
    return { isValid: false, error: 'Название содержит недопустимые символы' };
  }

  return { isValid: true };
};

export const validateChatTitle = (
  title: string,
): { isValid: boolean; error?: string } => {
  const trimmed = title.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Название чата не может быть пустым' };
  }

  if (trimmed.length > 200) {
    return {
      isValid: false,
      error: 'Название чата не может превышать 200 символов',
    };
  }

  // Check for potentially dangerous characters (XSS protection)
  const dangerousChars = /<script|javascript:|data:|vbscript:/i;
  if (dangerousChars.test(trimmed)) {
    return { isValid: false, error: 'Название содержит недопустимые символы' };
  }

  return { isValid: true };
};

export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
