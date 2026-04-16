import { Router } from 'express';
import { paymentSchema } from '@pantera-negra/shared';
import { PaymentModel, PAYMENT_AMOUNTS, PAYMENT_CURRENCY } from '../models/Payment.js';
import type { Payment } from '@pantera-negra/shared';

export const paymentsRouter = Router();

// GET /api/payments - Get payment records
paymentsRouter.get('/', async (req, res, next) => {
  try {
    const { membershipId } = req.query;
    
    const filter: any = {};
    if (membershipId) {
      filter.membershipId = membershipId as string;
    }
    
    const payments = await PaymentModel.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();
    
    const formattedPayments: Payment[] = payments.map((payment) => ({
      id: payment._id.toString(),
      membershipId: payment.membershipId.toString(),
      amount: payment.amount,
      date: payment.date,
      status: payment.status as Payment['status'],
      plan: payment.plan,
      paymentType: payment.paymentType,
      currency: payment.currency || PAYMENT_CURRENCY,
    }));
    
    res.json({
      success: true,
      data: formattedPayments,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/payments - Create payment record
paymentsRouter.post('/', async (req, res, next) => {
  try {
    const validatedData = paymentSchema.parse(req.body);
    
    // Calculate amount based on payment type if not provided
    let amount = validatedData.amount;
    if (!amount) {
      if (validatedData.paymentType === 'transfer') {
        amount = PAYMENT_AMOUNTS.TRANSFER;
      } else if (validatedData.paymentType === 'cash') {
        amount = PAYMENT_AMOUNTS.CASH;
      } else {
        // For card, use transfer amount as default
        amount = PAYMENT_AMOUNTS.TRANSFER;
      }
    }
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const payment = new PaymentModel({
      membershipId: validatedData.membershipId,
      amount,
      date: today,
      status: 'completed',
      plan: validatedData.plan,
      paymentType: validatedData.paymentType,
      currency: validatedData.currency || PAYMENT_CURRENCY,
    });
    
    await payment.save();
    
    const formattedPayment: Payment = {
      id: payment._id.toString(),
      membershipId: payment.membershipId.toString(),
      amount: payment.amount,
      date: payment.date,
      status: payment.status as Payment['status'],
      plan: payment.plan,
      paymentType: payment.paymentType,
      currency: payment.currency || PAYMENT_CURRENCY,
    };
    
    res.status(201).json({
      success: true,
      message: 'Payment recorded',
      data: formattedPayment,
    });
  } catch (error) {
    next(error);
  }
});

