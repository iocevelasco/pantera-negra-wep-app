import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { TenantModel } from '../models/Tenant.js';

dotenv.config();

async function seedTenants() {
  try {
    await connectDatabase();
    console.log('✅ Connected to database\n');

    const tenants = [
      { slug: 'avellaneda', name: 'Avellaneda' },
      { slug: 'belgrano', name: 'Belgrano' },
      { slug: 'los-incas', name: 'Los Incas' },
    ];

    console.log('🌱 Seeding tenants...\n');

    // Insert or update tenants
    for (const tenantData of tenants) {
      const existingTenant = await TenantModel.findOne({ slug: tenantData.slug });
      
      if (existingTenant) {
        // Update if exists
        existingTenant.name = tenantData.name;
        await existingTenant.save();
        console.log(`✅ Updated tenant: ${tenantData.name} (${tenantData.slug})`);
      } else {
        // Create if doesn't exist
        await TenantModel.create(tenantData);
        console.log(`✅ Created tenant: ${tenantData.name} (${tenantData.slug})`);
      }
    }

    console.log('\n📋 All tenants:');
    const allTenants = await TenantModel.find().sort({ slug: 1 }).lean();
    allTenants.forEach((tenant) => {
      console.log(`   - ${tenant.name} (${tenant.slug})`);
    });

    console.log('\n✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding tenants:', error);
    process.exit(1);
  }
}

seedTenants();


