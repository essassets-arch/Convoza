export function getAdminApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port, origin } = window.location;
    if (port === '3000' || port === '3001' || port === '3002') {
      return `${protocol}//${hostname}:4000/api/v1`;
    }
    return `${origin}/api/v1`;
  }
  return 'http://localhost:4000/api/v1';
}

export async function adminFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('convoza_admin_access_token') || '' : '';
  const url = path.startsWith('http')
    ? path
    : `${getAdminApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((init?.headers as Record<string, string>) || {}),
    },
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined' && !path.includes('/auth/login')) {
      localStorage.removeItem('convoza_admin_access_token');
      localStorage.removeItem('convoza_admin_user');
      window.location.replace('/admin/login');
    }
    throw new Error('Unauthorized: Super Admin authentication required');
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message || json.message || `Admin API Error (${res.status})`);
  }
  return json.data !== undefined ? json.data : json;
}
