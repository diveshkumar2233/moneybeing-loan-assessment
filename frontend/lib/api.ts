export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
export const TOKEN_KEY = 'moneybeing_access_token';

export async function apiResponse(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<Response> {
  const headers = new Headers(options.headers);
  // Login uses URL-encoded form data; application and rule requests use JSON.
  if (options.body && !(options.body instanceof URLSearchParams))
    headers.set('Content-Type', 'application/json');
  if (authenticated && typeof window !== 'undefined') {
    // Protected requests carry the token saved by the login screen.
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      cache: 'no-store',
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new Error(
      'Unable to reach the server. Check your connection and try again.',
    );
  }
  if (!response.ok) {
    if (
      response.status === 401 &&
      authenticated &&
      typeof window !== 'undefined'
    ) {
      // An expired or invalid login must be replaced before retrying admin actions.
      sessionStorage.removeItem(TOKEN_KEY);
      window.location.assign('/login');
    }
    const body = await response.json().catch(() => ({}));
    const detail = body.detail;
    throw new Error(
      Array.isArray(detail)
        ? detail
            .map(
              (item: { loc: string[]; msg: string }) =>
                `${item.loc.slice(1).join('.')}: ${item.msg}`,
            )
            .join('; ')
        : typeof detail === 'string'
          ? detail
          : `Request failed (${response.status})`,
    );
  }
  return response;
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const response = await apiResponse(path, options, authenticated);
  return response.status === 204 ? (undefined as T) : response.json();
}

export function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';
}
export const money = (value: string | number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value));
