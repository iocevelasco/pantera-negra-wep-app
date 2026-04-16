import { Router } from 'express';
import { ClassModel } from '../models/Class.js';
import { TenantModel } from '../models/Tenant.js';
import { classSchema } from '@pantera-negra/shared';
import type { Classes } from '@pantera-negra/shared';

export const classesRouter = Router();

// GET /api/classes - Get all classes
classesRouter.get('/', async (req, res, next) => {
  try {
    const { date, type } = req.query;
    const filter: any = {};

    if (date) {
      filter.date = date;
    }
    if (type) {
      filter.type = type;
    }

    const classes = await ClassModel.find(filter).lean();
    const formattedClasses: Classes[] = classes.map((cls) => ({
      id: cls._id.toString(),
      name: cls.name,
      type: cls.type as Classes['type'],
      instructor: cls.instructor,
      startTime: cls.startTime,
      endTime: cls.endTime,
      date: cls.date,
      location: cls.location,
      capacity: cls.capacity,
      enrolled: cls.enrolled,
    }));

    res.json({
      success: true,
      data: formattedClasses,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/classes/:id - Get class by ID
classesRouter.get('/:id', async (req, res, next) => {
  try {
    const cls = await ClassModel.findById(req.params.id).lean();
    if (!cls) {
      return res.status(404).json({
        success: false,
        error: 'Class not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: cls._id.toString(),
        ...cls,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/classes - Create new class
classesRouter.post('/', async (req, res, next) => {
  try {
    const validatedData = classSchema.parse(req.body);
    
    // Get tenant name from user's tenant_id if location is not provided
    let location = validatedData.location;
    if (!location && req.user?.tenant_id) {
      const tenant = await TenantModel.findById(req.user.tenant_id).lean();
      if (tenant) {
        location = tenant.name;
      }
    }

    const cls = new ClassModel({
      ...validatedData,
      location: location || validatedData.location,
      enrolled: 0,
    });

    await cls.save();

    res.status(201).json({
      success: true,
      data: {
        id: cls._id.toString(),
        ...cls.toObject(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/classes/:id - Update class
classesRouter.put('/:id', async (req, res, next) => {
  try {
    const validatedData = classSchema.partial().parse(req.body);
    
    // Get tenant name from user's tenant_id if location is not provided
    let location = validatedData.location;
    if (!location && req.user?.tenant_id) {
      const tenant = await TenantModel.findById(req.user.tenant_id).lean();
      if (tenant) {
        location = tenant.name;
      }
    }

    const updateData = {
      ...validatedData,
      ...(location && { location }),
    };

    const cls = await ClassModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!cls) {
      return res.status(404).json({
        success: false,
        error: 'Class not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: cls._id.toString(),
        ...cls,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/classes/bulk - Create multiple classes for a month
classesRouter.post('/bulk', async (req, res, next) => {
  try {
    const { month, year, startTime, endTime, daysOfWeek, name } = req.body;

    // Validate required fields
    if (!month || !year || !startTime || !endTime || !daysOfWeek) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: month, year, startTime, endTime, daysOfWeek',
      });
    }

    // Validate daysOfWeek (0 = Monday, 6 = Sunday)
    const validDays = Array.isArray(daysOfWeek) && daysOfWeek.every((day: number) => day >= 0 && day <= 6);
    if (!validDays) {
      return res.status(400).json({
        success: false,
        error: 'daysOfWeek must be an array of numbers between 0 (Monday) and 6 (Sunday)',
      });
    }

    // Get tenant name from user's tenant_id
    let location: string | undefined;
    if (req.user?.tenant_id) {
      const tenant = await TenantModel.findById(req.user.tenant_id).lean();
      if (tenant) {
        location = tenant.name;
      }
    }

    // Generate all dates for the month that match the daysOfWeek
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    const classesToCreate: any[] = [];

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      // Convert to Monday = 0 format
      const normalizedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      if (daysOfWeek.includes(normalizedDay)) {
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        classesToCreate.push({
          name: name || 'Class',
          startTime,
          endTime,
          date: dateString,
          location: location || '',
          enrolled: 0,
        });
      }
    }

    if (classesToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No classes to create for the specified month and days',
      });
    }

    // Insert all classes
    const createdClasses = await ClassModel.insertMany(classesToCreate);

    const formattedClasses: Classes[] = createdClasses.map((cls) => ({
      id: cls._id.toString(),
      name: cls.name,
      type: cls.type as Classes['type'],
      instructor: cls.instructor,
      startTime: cls.startTime,
      endTime: cls.endTime,
      date: cls.date,
      location: cls.location,
      capacity: cls.capacity,
      enrolled: cls.enrolled,
    }));

    res.status(201).json({
      success: true,
      data: formattedClasses,
      message: `Created ${formattedClasses.length} classes successfully`,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/classes/:id - Delete class
classesRouter.delete('/:id', async (req, res, next) => {
  try {
    const cls = await ClassModel.findByIdAndDelete(req.params.id);
    if (!cls) {
      return res.status(404).json({
        success: false,
        error: 'Class not found',
      });
    }

    res.json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

