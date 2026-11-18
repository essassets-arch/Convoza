export function getApiBaseUrl(): string {
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

export function getDashboardUrl(): string {
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port, origin } = window.location;
    if (port === '3000') {
      return `${protocol}//${hostname}:3001/dashboard`;
    }
    return `${origin}/dashboard`;
  }
  return '/dashboard';
}

export function buildDashboardRedirectUrl(authPayload: {
  accessToken: string;
  refreshToken: string;
  user: any;
  orgId?: string;
  orgName?: string;
}): string {
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port, origin } = window.location;
    if (port === '3000') {
      const encoded = encodeURIComponent(JSON.stringify(authPayload));
      return `${protocol}//${hostname}:3001/dashboard#convoza_auth=${encoded}`;
    }
    return `${origin}/dashboard`;
  }
  return '/dashboard';
}
