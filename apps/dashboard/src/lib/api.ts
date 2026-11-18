export function getApiOrigin(): string {
  if (process.env.NEXT_PUBLIC_API_ORIGIN) {
    return process.env.NEXT_PUBLIC_API_ORIGIN.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port, origin } = window.location;
    if (port === '3000' || port === '3001' || port === '3002') {
      return `${protocol}//${hostname}:4000`;
    }
    return origin;
  }
  return 'http://localhost:4000';
}

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return `${getApiOrigin()}/api/v1`;
}

export function getWebsiteUrl(): string {
  if (process.env.NEXT_PUBLIC_WEBSITE_URL) {
    return process.env.NEXT_PUBLIC_WEBSITE_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port, origin } = window.location;
    if (port === '3001' || port === '3002') {
      return `${protocol}//${hostname}:3000`;
    }
    return origin;
  }
  return 'http://localhost:3000';
}

export function consumeAuthHandoffFromHash(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash || '';
  if (!hash.startsWith('#convoza_auth=')) return false;

  try {
    const encoded = hash.slice('#convoza_auth='.length);
    const parsed = JSON.parse(decodeURIComponent(encoded));
    if (parsed.accessToken) {
      localStorage.setItem('convoza_access_token', parsed.accessToken);
    }
    if (parsed.refreshToken) {
      localStorage.setItem('convoza_refresh_token', parsed.refreshToken);
    }
    if (parsed.user) {
      localStorage.setItem('convoza_user', JSON.stringify(parsed.user));
    }
    if (parsed.orgId) {
      localStorage.setItem('convoza_org_id', parsed.orgId);
    }
    if (parsed.orgName) {
      localStorage.setItem('convoza_org_name', parsed.orgName);
    }
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    return true;
  } catch {
    return false;
  }
}

export function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('convoza_access_token') || '' : '';
  const orgId = typeof window !== 'undefined' ? localStorage.getItem('convoza_org_id') || '' : '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(orgId ? { 'x-organization-id': orgId } : {}),
    ...(extra || {}),
  };
}

export async function apiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    ...getAuthHeaders(),
    ...((init?.headers as Record<string, string>) || {}),
  };

  let res = await fetch(url, {
    ...init,
    headers,
  });

  // Auto-refresh expired JWT if refresh_token is available
  if (res.status === 401 && typeof window !== 'undefined' && !path.includes('/auth/')) {
    const refreshToken = localStorage.getItem('convoza_refresh_token');
    if (refreshToken) {
      const refreshRes = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => null);

      if (refreshRes && refreshRes.ok) {
        const refreshJson = await refreshRes.json().catch(() => ({}));
        const newAccess = refreshJson?.data?.accessToken;
        const newRefresh = refreshJson?.data?.refreshToken;
        if (newAccess) {
          localStorage.setItem('convoza_access_token', newAccess);
          if (newRefresh) localStorage.setItem('convoza_refresh_token', newRefresh);
          res = await fetch(url, {
            ...init,
            headers: {
              ...getAuthHeaders(),
              ...((init?.headers as Record<string, string>) || {}),
            },
          });
        }
      }
    }

    if (res.status === 401) {
      localStorage.removeItem('convoza_access_token');
      window.location.href = '/dashboard/login';
      throw new Error('Please sign in to your CONVOZA workspace first.');
    }
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message || json.message || `API Error (${res.status})`);
  }
  return json.data !== undefined ? json.data : json;
}
