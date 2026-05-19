const WEAK_BASE_WORDS = [
  "password",
  "admin",
  "welcome",
  "login",
  "qwerty",
  "asdf",
  "zxcv",
  "letmein",
  "iloveyou",
  "monkey",
  "dragon",
  "sunshine",
  "football",
  "baseball",
  "master",
  "secret",
];

const hasSequentialRun = (value, sequence, minLen) => {
  let asc = 1;
  let desc = 1;

  for (let i = 1; i < value.length; i += 1) {
    const prev = sequence.indexOf(value[i - 1]);
    const curr = sequence.indexOf(value[i]);

    if (prev === -1 || curr === -1) {
      asc = 1;
      desc = 1;
      continue;
    }

    if (curr === prev + 1) {
      asc += 1;
      desc = 1;
    } else if (curr === prev - 1) {
      desc += 1;
      asc = 1;
    } else {
      asc = 1;
      desc = 1;
    }

    if (asc >= minLen || desc >= minLen) {
      return true;
    }
  }

  return false;
};

export const isCommonPassword = (password) => {
  if (typeof password !== "string" || password.length === 0) {
    return false;
  }

  const normalized = password.toLowerCase();

  if (WEAK_BASE_WORDS.some((word) => normalized.includes(word))) {
    return true;
  }

  if (/(.)\1{5,}/.test(password)) {
    return true;
  }

  if (hasSequentialRun(normalized, "abcdefghijklmnopqrstuvwxyz", 5)) {
    return true;
  }

  if (hasSequentialRun(normalized, "0123456789", 5)) {
    return true;
  }

  return false;
};
