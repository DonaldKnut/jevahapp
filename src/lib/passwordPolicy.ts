const COMMON = new Set([
  "password",
  "password1",
  "12345678",
  "qwerty123",
  "letmein1",
  "iloveyou",
  "admin123",
  "welcome1",
  "jesus123",
  "gospel12",
]);

export const PASSWORD_HINT =
  "Use at least 8 characters with a letter and a number.";

export function isCommonPassword(password: string, email = "") {
  const pwd = password.toLowerCase();
  if (COMMON.has(pwd)) return true;
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  return local.length >= 4 && pwd.includes(local);
}

export function passwordStrength(password: string): {
  score: 0 | 1 | 2 | 3;
  label: string;
} {
  if (!password) return { score: 0, label: "" };
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (password.length < 8 || !hasLetter || !hasNumber) {
    return { score: 1, label: "Too weak" };
  }
  if (password.length >= 12 && /[^A-Za-z0-9]/.test(password)) {
    return { score: 3, label: "Strong" };
  }
  return { score: 2, label: "Good" };
}
