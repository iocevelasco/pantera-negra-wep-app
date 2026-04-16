import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { ClassModel } from '../models/Class.js';

dotenv.config();

// Default class configuration
const DEFAULT_CLASS_CONFIG = {
  name: 'Clase Regular',
  type: 'Gi' as const,
  instructor: 'Instructor Principal',
  startTime: '19:00',
  endTime: '20:30',
  location: 'Dojo Principal',
  capacity: 30,
  enrolled: 0,
};

// Rotate class types by day of week
const CLASS_TYPES_BY_DAY: Record<number, 'Gi' | 'No-Gi' | 'Kids'> = {
  0: 'Gi',      // Sunday
  1: 'Gi',      // Monday
  2: 'No-Gi',   // Tuesday
  3: 'Gi',      // Wednesday
  4: 'No-Gi',   // Thursday
  5: 'Gi',      // Friday
  6: 'Kids',    // Saturday
};

// Rotate class names by day of week
const CLASS_NAMES_BY_DAY: Record<number, string> = {
  0: 'Clase Dominical',
  1: 'Clase Lunes',
  2: 'Clase No-Gi',
  3: 'Clase Miércoles',
  4: 'Clase No-Gi',
  5: 'Clase Viernes',
  6: 'Clase Kids',
};

// Rotate instructors by day of week
const INSTRUCTORS_BY_DAY: Record<number, string> = {
  0: 'Instructor Principal',
  1: 'Instructor Principal',
  2: 'Instructor No-Gi',
  3: 'Instructor Principal',
  4: 'Instructor No-Gi',
  5: 'Instructor Principal',
  6: 'Instructor Kids',
};

// Rotate times by day of week
const TIMES_BY_DAY: Record<number, { start: string; end: string }> = {
  0: { start: '10:00', end: '11:30' },  // Sunday morning
  1: { start: '19:00', end: '20:30' },  // Monday evening
  2: { start: '19:00', end: '20:30' },  // Tuesday evening
  3: { start: '19:00', end: '20:30' },  // Wednesday evening
  4: { start: '19:00', end: '20:30' },  // Thursday evening
  5: { start: '19:00', end: '20:30' },  // Friday evening
  6: { start: '17:00', end: '18:00' },  // Saturday afternoon (Kids)
};

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get class configuration for a specific date
 */
function getClassConfigForDate(date: Date) {
  const dayOfWeek = date.getDay();
  const times = TIMES_BY_DAY[dayOfWeek] || TIMES_BY_DAY[1]; // Default to Monday if not found
  
  return {
    name: CLASS_NAMES_BY_DAY[dayOfWeek] || DEFAULT_CLASS_CONFIG.name,
    type: CLASS_TYPES_BY_DAY[dayOfWeek] || DEFAULT_CLASS_CONFIG.type,
    instructor: INSTRUCTORS_BY_DAY[dayOfWeek] || DEFAULT_CLASS_CONFIG.instructor,
    startTime: times.start,
    endTime: times.end,
    location: DEFAULT_CLASS_CONFIG.location,
    capacity: DEFAULT_CLASS_CONFIG.capacity,
    enrolled: DEFAULT_CLASS_CONFIG.enrolled,
  };
}

/**
 * Generate classes for a date range
 */
async function seedClasses(startDate: Date, endDate: Date) {
  try {
    await connectDatabase();
    console.log('✅ Connected to database\n');

    const classesToCreate: Array<{
      name: string;
      type?: 'Gi' | 'No-Gi' | 'Kids';
      instructor: string;
      startTime: string;
      endTime: string;
      date: string;
      location: string;
      capacity: number;
      enrolled: number;
    }> = [];

    // Generate classes for each day in the range
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    console.log(`📅 Generating classes from ${formatDate(startDate)} to ${formatDate(endDate)}\n`);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      
      // Skip Sundays (day 0) - only generate classes Monday to Saturday
      if (dayOfWeek === 0) {
        console.log(`⏭️  Skipping ${formatDate(currentDate)} - Sunday (no classes)`);
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const dateStr = formatDate(currentDate);
      const config = getClassConfigForDate(currentDate);

      // Check if class already exists for this date
      const existingClass = await ClassModel.findOne({ date: dateStr }).lean();
      
      if (existingClass) {
        console.log(`⏭️  Skipping ${dateStr} - class already exists`);
      } else {
        classesToCreate.push({
          ...config,
          date: dateStr,
        });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (classesToCreate.length === 0) {
      console.log('✅ All classes already exist for the specified date range');
      process.exit(0);
      return;
    }

    console.log(`🌱 Creating ${classesToCreate.length} classes...\n`);

    // Insert classes in batches
    const BATCH_SIZE = 50;
    let created = 0;

    for (let i = 0; i < classesToCreate.length; i += BATCH_SIZE) {
      const batch = classesToCreate.slice(i, i + BATCH_SIZE);
      await ClassModel.insertMany(batch);
      created += batch.length;
      console.log(`✅ Created ${created}/${classesToCreate.length} classes`);
    }

    console.log(`\n📋 Summary:`);
    console.log(`   - Total classes created: ${created}`);
    console.log(`   - Date range: ${formatDate(startDate)} to ${formatDate(endDate)}`);

    // Show sample of created classes
    console.log(`\n📋 Sample of created classes (first 5):`);
    const sampleClasses = await ClassModel.find({
      date: { $gte: formatDate(startDate), $lte: formatDate(endDate) },
    })
      .sort({ date: 1 })
      .limit(5)
      .lean();
    
    sampleClasses.forEach((cls) => {
      console.log(`   - ${cls.date}: ${cls.name} (${cls.type || 'N/A'}) - ${cls.startTime} to ${cls.endTime}`);
    });

    console.log('\n✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding classes:', error);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

// Default: generate classes for the next 30 days
const startDate = new Date();
startDate.setHours(0, 0, 0, 0);

const endDate = new Date();
endDate.setDate(endDate.getDate() + 30);
endDate.setHours(23, 59, 59, 999);

// Allow custom date range via command line arguments
// Usage: npm run seed:classes [startDate] [endDate]
// Dates should be in YYYY-MM-DD format
if (args.length >= 1) {
  const customStart = new Date(args[0]);
  if (!isNaN(customStart.getTime())) {
    startDate.setTime(customStart.getTime());
    startDate.setHours(0, 0, 0, 0);
  }
}

if (args.length >= 2) {
  const customEnd = new Date(args[1]);
  if (!isNaN(customEnd.getTime())) {
    endDate.setTime(customEnd.getTime());
    endDate.setHours(23, 59, 59, 999);
  }
}

console.log('🌱 Starting class seeding...\n');
seedClasses(startDate, endDate);

