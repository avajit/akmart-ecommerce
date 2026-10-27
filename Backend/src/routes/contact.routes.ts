import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { z } from 'zod';
import { validateRequest } from '../middlewares/validateRequest';

const contactSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    subject: z.string().max(200).optional(),
    message: z.string().min(10, 'Message must be at least 10 characters'),
  }),
});

const router = Router();

router.post('/', validateRequest(contactSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const record = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been recorded. Our support team will respond promptly.',
      data: { id: record.id },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
