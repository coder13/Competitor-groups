const enabledValues = new Set(['1', 'true', 'yes', 'on']);

const isEnabled = (value: string | undefined) =>
  value ? enabledValues.has(value.toLowerCase()) : false;

export const FEATURE_FLAGS = {
  personalUserPage: isEnabled(import.meta.env.VITE_FEATURE_PERSONAL_USER_PAGE),
};
