export const sanitizeRutInput = (raw: string): string =>
  raw
    .toUpperCase()
    .replaceAll(/[^0-9K]/g, "")
    .slice(0, 9);

export const splitRut = (rut: string): { body: string; verifier: string } => {
  const clean = sanitizeRutInput(rut);
  if (clean.length <= 1) {
    return { body: clean, verifier: "" };
  }

  return {
    body: clean.slice(0, -1),
    verifier: clean.slice(-1),
  };
};

export const formatRut = (rut: string): string => {
  const { body, verifier } = splitRut(rut);
  if (!body || !verifier) {
    return sanitizeRutInput(rut);
  }

  const bodyWithDots = body.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${bodyWithDots}-${verifier}`;
};

const computeVerifier = (body: string): string => {
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const result = 11 - (sum % 11);
  if (result === 11) {
    return "0";
  }

  if (result === 10) {
    return "K";
  }

  return String(result);
};

export const isValidRut = (rut: string): boolean => {
  const { body, verifier } = splitRut(rut);
  if (body.length < 7 || !verifier) {
    return false;
  }

  return computeVerifier(body) === verifier;
};
