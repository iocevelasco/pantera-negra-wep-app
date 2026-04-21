import { describe, it, expect } from 'vitest';
import {
  loginCredentialsSchema,
  registerCredentialsSchema,
  resetPasswordRequestSchema,
  userSchema,
  membershipSchema,
  classSchema,
  paymentSchema,
  membershipPlanSchema,
  createPrivatePlanRequestSchema,
  pushSubscriptionSchema,
} from './index';

describe('loginCredentialsSchema', () => {
  it('accepts valid credentials', () => {
    expect(() =>
      loginCredentialsSchema.parse({ email: 'user@test.com', password: 'pass123' })
    ).not.toThrow();
  });

  it('rejects invalid email', () => {
    const result = loginCredentialsSchema.safeParse({ email: 'not-an-email', password: 'pass123' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginCredentialsSchema.safeParse({ email: 'user@test.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('allows optional recaptchaToken', () => {
    const result = loginCredentialsSchema.safeParse({
      email: 'user@test.com',
      password: 'pass',
      recaptchaToken: 'token-abc',
    });
    expect(result.success).toBe(true);
  });
});

describe('registerCredentialsSchema', () => {
  it('rejects passwords shorter than 8 characters', () => {
    const result = registerCredentialsSchema.safeParse({
      email: 'user@test.com',
      password: 'short',
      tenant_id: 'tenant-1',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('8');
  });

  it('accepts valid registration data', () => {
    expect(() =>
      registerCredentialsSchema.parse({
        email: 'user@test.com',
        password: 'validpassword',
        tenant_id: 'tenant-1',
        rank: 'White',
        stripes: 2,
      })
    ).not.toThrow();
  });
});

describe('resetPasswordRequestSchema', () => {
  it('requires both token and password', () => {
    expect(resetPasswordRequestSchema.safeParse({ token: 'abc' }).success).toBe(false);
    expect(resetPasswordRequestSchema.safeParse({ password: 'newpass123' }).success).toBe(false);
  });

  it('rejects passwords shorter than 8 characters', () => {
    const result = resetPasswordRequestSchema.safeParse({ token: 'abc', password: '123' });
    expect(result.success).toBe(false);
  });
});

describe('userSchema', () => {
  const validUser = {
    email: 'user@test.com',
    roles: ['student'],
    tenant_id: 'tenant-1',
    rank: 'White',
    stripes: 2,
  };

  it('accepts a valid user', () => {
    expect(() => userSchema.parse(validUser)).not.toThrow();
  });

  it('rejects stripes above 4', () => {
    const result = userSchema.safeParse({ ...validUser, stripes: 5 });
    expect(result.success).toBe(false);
  });

  it('rejects unknown belt rank', () => {
    const result = userSchema.safeParse({ ...validUser, rank: 'Red' });
    expect(result.success).toBe(false);
  });

  it('requires at least one role', () => {
    const result = userSchema.safeParse({ ...validUser, roles: [] });
    expect(result.success).toBe(false);
  });
});

describe('membershipSchema', () => {
  it('rejects negative price', () => {
    const result = membershipSchema.safeParse({
      user_id: 'user-1',
      name: 'Juan',
      status: 'Active',
      memberType: 'Adult',
      price: -10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown status', () => {
    const result = membershipSchema.safeParse({
      user_id: 'user-1',
      name: 'Juan',
      status: 'Expired',
      memberType: 'Adult',
    });
    expect(result.success).toBe(false);
  });
});

describe('classSchema', () => {
  const validClass = { name: 'BJJ Gi', startTime: '18:00', endTime: '19:30', date: '2024-12-01' };

  it('accepts a valid class', () => {
    expect(() => classSchema.parse(validClass)).not.toThrow();
  });

  it('requires a name', () => {
    const result = classSchema.safeParse({ ...validClass, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects non-positive capacity', () => {
    const result = classSchema.safeParse({ ...validClass, capacity: 0 });
    expect(result.success).toBe(false);
  });
});

describe('paymentSchema', () => {
  it('rejects non-positive amount', () => {
    const result = paymentSchema.safeParse({
      membershipId: 'm-1',
      amount: -50,
      plan: 'monthly',
      paymentType: 'cash',
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown payment type', () => {
    const result = paymentSchema.safeParse({
      membershipId: 'm-1',
      plan: 'monthly',
      paymentType: 'crypto',
    });
    expect(result.success).toBe(false);
  });
});

describe('membershipPlanSchema', () => {
  it('defaults active to true', () => {
    const result = membershipPlanSchema.parse({
      name: 'Monthly Plan',
      type: 'monthly',
      duration: 1,
      description: 'Standard monthly membership',
    });
    expect(result.active).toBe(true);
  });

  it('rejects non-positive duration', () => {
    const result = membershipPlanSchema.safeParse({
      name: 'Plan',
      type: 'monthly',
      duration: 0,
      description: 'desc',
    });
    expect(result.success).toBe(false);
  });
});

describe('createPrivatePlanRequestSchema', () => {
  it('rejects zero sessions', () => {
    const result = createPrivatePlanRequestSchema.safeParse({
      name: 'Private BJJ',
      sessionsTotal: 0,
    });
    expect(result.success).toBe(false);
  });

  it('validates schedule time format', () => {
    const result = createPrivatePlanRequestSchema.safeParse({
      name: 'Private BJJ',
      sessionsTotal: 10,
      schedule: { days: [1, 3], start_time: '25:00', duration_minutes: 60 },
    });
    expect(result.success).toBe(false);
  });
});

describe('pushSubscriptionSchema', () => {
  it('rejects invalid endpoint URL', () => {
    const result = pushSubscriptionSchema.safeParse({
      endpoint: 'not-a-url',
      keys: { p256dh: 'key', auth: 'auth' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid push subscription', () => {
    const result = pushSubscriptionSchema.safeParse({
      endpoint: 'https://push.example.com/endpoint',
      keys: { p256dh: 'publickey', auth: 'authsecret' },
    });
    expect(result.success).toBe(true);
  });
});
