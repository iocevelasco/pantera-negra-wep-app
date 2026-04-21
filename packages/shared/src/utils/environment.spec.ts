import { describe, it, expect } from 'vitest';
import {
  isLocalhost,
  isFlyDev,
  isPanteraNegra,
  getApiBaseUrl,
} from './environment';

describe('isLocalhost()', () => {
  it.each(['localhost', '127.0.0.1', '192.168.1.1', '10.0.0.1', '172.16.0.1'])(
    'returns true for %s',
    (host) => expect(isLocalhost(host)).toBe(true)
  );

  it.each(['my-app.fly.dev', 'pantera-negra.com', 'example.com'])(
    'returns false for %s',
    (host) => expect(isLocalhost(host)).toBe(false)
  );

  it('returns false for null', () => {
    expect(isLocalhost(null)).toBe(false);
  });
});

describe('isFlyDev()', () => {
  it('returns true for fly.dev domains', () => {
    expect(isFlyDev('my-app.fly.dev')).toBe(true);
  });

  it('returns false for other domains', () => {
    expect(isFlyDev('localhost')).toBe(false);
    expect(isFlyDev('example.com')).toBe(false);
  });
});

describe('isPanteraNegra()', () => {
  it('returns true for pantera-negra domains', () => {
    expect(isPanteraNegra('app.pantera-negra.com')).toBe(true);
  });

  it('returns false for other domains', () => {
    expect(isPanteraNegra('localhost')).toBe(false);
  });
});

describe('getApiBaseUrl()', () => {
  it('returns the dev URL in development', () => {
    expect(getApiBaseUrl('http://localhost:8080')).toBe('http://localhost:8080');
  });

  it('falls back to localhost:8080 if no devUrl provided', () => {
    expect(getApiBaseUrl()).toBe('http://localhost:8080');
  });
});
