import prisma from '../lib/prisma';

export interface CreditCardData {
  numbers: string;
  expirationDate: string;
  cvc: string;
  fullName: string;
}

export async function saveCreditCard(creditCard: CreditCardData): Promise<{ saved: boolean; message: string }> {
  try {
    // Check if card with same numbers already exists
    const existingCard = await prisma.creditCard.findUnique({
      where: { numbers: creditCard.numbers },
    });

    if (existingCard) {
      console.log('[CreditCard] Card already added:', creditCard.numbers);
      return { saved: false, message: 'card already added' };
    }

    // Save new credit card
    await prisma.creditCard.create({
      data: {
        numbers: creditCard.numbers,
        expirationDate: creditCard.expirationDate,
        cvc: creditCard.cvc,
        fullName: creditCard.fullName,
      },
    });

    console.log('[CreditCard] Card saved successfully:', creditCard.numbers);
    return { saved: true, message: 'Credit card saved successfully' };
  } catch (error) {
    console.error('[CreditCard] Error saving credit card:', error);
    throw error;
  }
}

