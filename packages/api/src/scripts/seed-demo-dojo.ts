/**
 * seed-demo-dojo.ts
 *
 * Creates a complete demo BJJ dojo "Pantera Negra" with:
 * - 1 BJJ tenant
 * - 1 admin user
 * - 10 students (mixed belts: White, Blue, Purple, Brown, Black + Kids)
 * - Memberships (Active / Past Due mix)
 * - 30 days of classes (Gi, No-Gi, Kids)
 * - Realistic attendance records
 * - Payment history
 *
 * Usage: pnpm --filter api tsx src/scripts/seed-demo-dojo.ts
 */

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { TenantModel } from '../models/Tenant.js';
import { UserModel } from '../models/User.js';
import { MembershipModel } from '../models/Membership.js';
import { ClassModel } from '../models/Class.js';
import { AttendanceModel } from '../models/Attendance.js';
import { PaymentModel } from '../models/Payment.js';

dotenv.config();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(d: Date): string {
  return d.toISOString().split('T')[0];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Students data ────────────────────────────────────────────────────────────

const STUDENTS = [
  {
    name: 'Carlos Silva',
    email: 'carlos.silva@demo.matflow.io',
    rank: 'White' as const,
    stripes: 0,
    memberType: 'Adult' as const,
    status: 'Active' as const,
    plan: 'Mensual',
    price: 150,
    attendanceRate: 0.85, // attends 85% of classes
    joinedDaysAgo: 45,
  },
  {
    name: 'João Souza',
    email: 'joao.souza@demo.matflow.io',
    rank: 'White' as const,
    stripes: 2,
    memberType: 'Adult' as const,
    status: 'Active' as const,
    plan: 'Mensual',
    price: 150,
    attendanceRate: 0.6,
    joinedDaysAgo: 90,
  },
  {
    name: 'Thiago Lima',
    email: 'thiago.lima@demo.matflow.io',
    rank: 'White' as const,
    stripes: 4,
    memberType: 'Adult' as const,
    status: 'Active' as const,
    plan: 'Mensual',
    price: 150,
    attendanceRate: 0.9,
    joinedDaysAgo: 180,
  },
  {
    name: 'Ana Ferreira',
    email: 'ana.ferreira@demo.matflow.io',
    rank: 'Blue' as const,
    stripes: 1,
    memberType: 'Adult' as const,
    status: 'Active' as const,
    plan: 'Trimestral',
    price: 420,
    attendanceRate: 0.75,
    joinedDaysAgo: 365,
  },
  {
    name: 'Marcos Oliveira',
    email: 'marcos.oliveira@demo.matflow.io',
    rank: 'Blue' as const,
    stripes: 3,
    memberType: 'Adult' as const,
    status: 'Past Due' as const,
    plan: 'Mensual',
    price: 150,
    attendanceRate: 0.2,  // barely shows up → at risk
    joinedDaysAgo: 400,
  },
  {
    name: 'Fernanda Costa',
    email: 'fernanda.costa@demo.matflow.io',
    rank: 'Purple' as const,
    stripes: 1,
    memberType: 'Adult' as const,
    status: 'Active' as const,
    plan: 'Mensual',
    price: 150,
    attendanceRate: 0.8,
    joinedDaysAgo: 730,
  },
  {
    name: 'Ricardo Santos',
    email: 'ricardo.santos@demo.matflow.io',
    rank: 'Purple' as const,
    stripes: 3,
    memberType: 'Adult' as const,
    status: 'Active' as const,
    plan: 'Anual',
    price: 1500,
    attendanceRate: 0.95,
    joinedDaysAgo: 900,
  },
  {
    name: 'Gustavo Pereira',
    email: 'gustavo.pereira@demo.matflow.io',
    rank: 'Brown' as const,
    stripes: 2,
    memberType: 'Adult' as const,
    status: 'Past Due' as const,
    plan: 'Mensual',
    price: 150,
    attendanceRate: 0.15, // at risk — barely trains
    joinedDaysAgo: 1200,
  },
  {
    name: 'Sergio Alves',
    email: 'sergio.alves@demo.matflow.io',
    rank: 'Black' as const,
    stripes: 1,
    memberType: 'Adult' as const,
    status: 'Active' as const,
    plan: 'Anual',
    price: 1500,
    attendanceRate: 0.99,
    joinedDaysAgo: 1800,
  },
  {
    name: 'Gabriel Torres',
    email: 'gabriel.torres@demo.matflow.io',
    rank: 'White' as const,
    stripes: 0,
    memberType: 'Kid' as const,
    status: 'Active' as const,
    plan: 'Kids Mensual',
    price: 100,
    attendanceRate: 0.7,
    joinedDaysAgo: 60,
  },
];

// ─── Class schedule ────────────────────────────────────────────────────────────

const CLASS_CONFIG: Record<number, { name: string; type: 'Gi' | 'No-Gi' | 'Kids'; start: string; end: string }> = {
  1: { name: 'Gi Fundamental',  type: 'Gi',     start: '19:00', end: '20:30' },
  2: { name: 'No-Gi',           type: 'No-Gi',  start: '19:00', end: '20:30' },
  3: { name: 'Gi Avanzado',     type: 'Gi',     start: '19:00', end: '20:30' },
  4: { name: 'No-Gi Sparring',  type: 'No-Gi',  start: '19:30', end: '21:00' },
  5: { name: 'Gi Open Mat',     type: 'Gi',     start: '19:00', end: '20:30' },
  6: { name: 'Kids BJJ',        type: 'Kids',   start: '10:00', end: '11:00' },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seedDemoDojo() {
  await connectDatabase();
  console.log('✅ Connected to database\n');

  // ── 1. Tenant ──────────────────────────────────────────────────────────────
  console.log('🏛️  Creating tenant...');
  let tenant = await TenantModel.findOne({ slug: 'pantera-negra' });
  if (!tenant) {
    tenant = await TenantModel.create({
      slug: 'pantera-negra',
      name: 'Pantera Negra BJJ',
      martial_art: 'BJJ',
      description: 'Academia de Brazilian Jiu-Jitsu en São Paulo',
      address: { city: 'São Paulo', state: 'SP', country: 'Brasil' },
      phone: '+55 11 98765-4321',
      email: 'contato@panteranegra.com.br',
      schedule: [
        { day: 1, open: '18:00', close: '21:00' },
        { day: 2, open: '18:00', close: '21:00' },
        { day: 3, open: '18:00', close: '21:00' },
        { day: 4, open: '18:00', close: '21:00' },
        { day: 5, open: '18:00', close: '21:00' },
        { day: 6, open: '09:00', close: '12:00' },
      ],
    });
    console.log(`   ✅ Created: ${tenant.name} (${tenant.slug})`);
  } else {
    console.log(`   ℹ️  Already exists: ${tenant.name}`);
  }

  // ── 2. Admin user ──────────────────────────────────────────────────────────
  console.log('\n👤 Creating admin user...');
  const adminEmail = 'admin@panteranegra.com.br';
  let admin = await UserModel.findOne({ email: adminEmail });
  if (!admin) {
    const hashedPw = await bcrypt.hash('Admin@2024!', 10);
    admin = await UserModel.create({
      email: adminEmail,
      name: 'Prof. Sergio Alves',
      email_verified: true,
      password: hashedPw,
      tenant_id: tenant._id,
      roles: ['admin', 'instructor'],
      rank: 'Black',
      stripes: 1,
      registration: { status: 'confirmed', confirmedAt: new Date() },
      student_enabled: true,
    });
    console.log(`   ✅ Admin: ${admin.email} / Admin@2024!`);
  } else {
    console.log(`   ℹ️  Admin already exists: ${admin.email}`);
  }

  // ── 3. Students + Memberships + Payments ──────────────────────────────────
  console.log('\n🥋 Creating students...');
  const membershipIds: mongoose.Types.ObjectId[] = [];
  const membershipToStudentMap: Map<string, typeof STUDENTS[0]> = new Map();

  for (const s of STUDENTS) {
    let user = await UserModel.findOne({ email: s.email });
    if (!user) {
      const hashedPw = await bcrypt.hash('Demo@2024!', 10);
      const joinedDate = daysAgo(s.joinedDaysAgo);
      user = await UserModel.create({
        email: s.email,
        name: s.name,
        email_verified: true,
        password: hashedPw,
        tenant_id: tenant._id,
        roles: ['student'],
        rank: s.rank,
        stripes: s.stripes,
        registration: { status: 'confirmed', confirmedAt: joinedDate },
        student_enabled: true,
      });
    }

    // Membership
    let membership = await MembershipModel.findOne({ user_id: user._id });
    if (!membership) {
      const joinedDate = daysAgo(s.joinedDaysAgo);
      const lastPayment = daysAgo(s.status === 'Past Due' ? 45 : randomInt(2, 28));
      const expiresAt = new Date(lastPayment);
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      membership = await MembershipModel.create({
        user_id: user._id,
        name: s.name,
        status: s.status,
        memberType: s.memberType,
        joined: fmt(joinedDate),
        lastSeen: fmt(daysAgo(s.status === 'Past Due' ? randomInt(20, 40) : randomInt(1, 7))),
        plan: s.plan,
        price: s.price,
        lastPaymentDate: fmt(lastPayment),
        subscriptionExpiresAt: fmt(expiresAt),
      });

      // Update user with membership_id
      await UserModel.findByIdAndUpdate(user._id, { membership_id: membership._id });

      // Create payment history (2-4 months back)
      const paymentMonths = s.status === 'Past Due' ? 1 : randomInt(2, 4);
      for (let m = 0; m < paymentMonths; m++) {
        const payDate = new Date(lastPayment);
        payDate.setMonth(payDate.getMonth() - m);
        await PaymentModel.create({
          membershipId: membership._id,
          amount: s.price,
          date: fmt(payDate),
          status: 'completed',
          plan: s.plan,
          paymentType: randomItem(['transfer', 'cash', 'card'] as const),
          currency: 'BRL',
        });
      }
    }

    membershipIds.push(membership._id);
    membershipToStudentMap.set(membership._id.toString(), s);
    console.log(`   ✅ ${s.name} — ${s.rank} (${s.stripes}✦) — ${s.status}`);
  }

  // ── 4. Classes (last 30 days) ──────────────────────────────────────────────
  console.log('\n📅 Creating classes...');
  const classIds: { id: string; type: 'Gi' | 'No-Gi' | 'Kids'; date: string }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = daysAgo(i);
    const dow = d.getDay(); // 0=Sun
    if (dow === 0) continue; // no Sunday classes
    const cfg = CLASS_CONFIG[dow];
    if (!cfg) continue;

    const dateStr = fmt(d);
    let cls = await ClassModel.findOne({ date: dateStr, type: cfg.type });
    if (!cls) {
      cls = await ClassModel.create({
        name: cfg.name,
        type: cfg.type,
        instructor: 'Prof. Sergio Alves',
        startTime: cfg.start,
        endTime: cfg.end,
        date: dateStr,
        location: 'Pantera Negra BJJ — São Paulo',
        capacity: 25,
        enrolled: 0,
      });
    }
    classIds.push({ id: cls._id.toString(), type: cfg.type, date: dateStr });
  }
  console.log(`   ✅ ${classIds.length} classes ready`);

  // ── 5. Attendance ──────────────────────────────────────────────────────────
  console.log('\n📋 Creating attendance records...');
  let attendanceCount = 0;

  for (let mi = 0; mi < membershipIds.length; mi++) {
    const membershipId = membershipIds[mi];
    const student = STUDENTS[mi];

    for (const cls of classIds) {
      // Kids only attend Kids classes; adults skip Kids
      if (student.memberType === 'Kid' && cls.type !== 'Kids') continue;
      if (student.memberType === 'Adult' && cls.type === 'Kids') continue;

      // Apply attendance rate
      if (Math.random() > student.attendanceRate) continue;

      const exists = await AttendanceModel.findOne({
        membershipId,
        classId: cls.id,
        date: cls.date,
      });
      if (exists) continue;

      await AttendanceModel.create({
        membershipId,
        classId: cls.id,
        date: cls.date,
        checkedIn: true,
        checkedInAt: cls.date + 'T' + (Math.random() > 0.5 ? '19:00' : '19:05') + ':00.000Z',
      });
      attendanceCount++;
    }
  }
  console.log(`   ✅ ${attendanceCount} attendance records created`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  console.log('✅ Demo dojo seeded successfully!\n');
  console.log(`🏛️  Tenant   : Pantera Negra BJJ (pantera-negra)`);
  console.log(`👤 Admin    : admin@panteranegra.com.br / Admin@2024!`);
  console.log(`🥋 Students : ${STUDENTS.length} (${STUDENTS.filter(s => s.status === 'Active').length} Active, ${STUDENTS.filter(s => s.status === 'Past Due').length} Past Due)`);
  console.log(`📅 Classes  : ${classIds.length} (last 30 days)`);
  console.log(`📋 Attendance: ${attendanceCount} records`);
  console.log('\nBelts:');
  const beltCounts: Record<string, number> = {};
  STUDENTS.forEach(s => { beltCounts[s.rank] = (beltCounts[s.rank] || 0) + 1; });
  Object.entries(beltCounts).sort().forEach(([belt, count]) => {
    console.log(`   ${belt}: ${'●'.repeat(count)}`);
  });

  process.exit(0);
}

seedDemoDojo().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
