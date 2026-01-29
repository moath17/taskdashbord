export function generateId(): string {
  return crypto.randomUUID();
}

export function jsonResponse(data: any, status: number = 200) {
  return Response.json(data, { status });
}

export function errorResponse(error: string, status: number = 400) {
  return Response.json({ error }, { status });
}
