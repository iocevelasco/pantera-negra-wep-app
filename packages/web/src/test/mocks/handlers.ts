import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8080';

export const authHandlers = [
  http.post(`${BASE}/api/auth/login`, () =>
    HttpResponse.json({
      accessToken: 'mock-access-token',
      user: {
        id: 'user-1',
        email: 'admin@test.com',
        name: 'Test Admin',
        roles: ['admin'],
      },
    })
  ),

  http.post(`${BASE}/api/auth/register`, () =>
    HttpResponse.json({
      accessToken: 'mock-access-token',
      user: {
        id: 'user-2',
        email: 'student@test.com',
        name: 'Test Student',
        roles: ['student'],
      },
    })
  ),

  http.get(`${BASE}/api/auth/current-user`, () =>
    HttpResponse.json({
      id: 'user-1',
      email: 'admin@test.com',
      name: 'Test Admin',
      roles: ['admin'],
      tenant_id: 'tenant-1',
    })
  ),

  http.post(`${BASE}/api/auth/logout`, () => HttpResponse.json({ success: true })),
];

export const usersHandlers = [
  http.get(`${BASE}/api/users`, () =>
    HttpResponse.json([
      {
        id: 'user-1',
        email: 'student@test.com',
        name: 'Juan García',
        roles: ['student'],
        rank: 'White',
        stripes: 2,
        tenant_id: 'tenant-1',
      },
    ])
  ),

  http.delete(`${BASE}/api/users/:id`, () => HttpResponse.json({ success: true })),
];

export const membershipsHandlers = [
  http.get(`${BASE}/api/memberships`, () =>
    HttpResponse.json([
      {
        id: 'membership-1',
        user_id: 'user-1',
        name: 'Juan García',
        status: 'Active',
        memberType: 'Adult',
        joined: '2024-01-01',
        lastSeen: '2024-12-01',
      },
    ])
  ),
];

export const classesHandlers = [
  http.get(`${BASE}/api/classes`, () =>
    HttpResponse.json([
      {
        id: 'class-1',
        name: 'BJJ Gi',
        type: 'Gi',
        startTime: '18:00',
        endTime: '19:30',
        date: '2024-12-01',
        enrolled: 5,
      },
    ])
  ),
];

export const handlers = [
  ...authHandlers,
  ...usersHandlers,
  ...membershipsHandlers,
  ...classesHandlers,
];
