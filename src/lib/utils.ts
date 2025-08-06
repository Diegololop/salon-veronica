// Función para generar un ID único compatible con todos los navegadores
export function generateId(): string {
  // Usar crypto.randomUUID() si está disponible
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback para navegadores que no soportan crypto.randomUUID
  const timestamp = new Date().getTime();
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
}