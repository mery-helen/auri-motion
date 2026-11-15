export function parseJwtExpiresInSeconds(value: string | undefined): number {
  const trimmed = value?.trim();
  const parsed = trimmed ? Number(trimmed) : NaN;

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('JWT_EXPIRES_IN deve ser um número inteiro positivo de segundos.');
  }

  return parsed;
}
