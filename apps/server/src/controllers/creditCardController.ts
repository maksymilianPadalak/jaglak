import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getCreditCards(req: Request, res: Response) {
  try {
    const creditCards = await prisma.creditCard.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(creditCards);
  } catch (error) {
    console.error('[CreditCard] Error fetching credit cards:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch credit cards',
    });
  }
}

