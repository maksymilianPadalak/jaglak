import prisma from '../lib/prisma';

export interface CreditCardData {
  numbers: string;
  expirationDate: string;
  cvc: string;
  fullName: string;
}

export interface TransferMoneyData {
  creditCard: CreditCardData;
  description?: string;
  amount?: string;
}

export async function saveCreditCard(creditCard: CreditCardData): Promise<{ saved: boolean; message: string; cardId?: string }> {
  try {
    // Check if card with same numbers already exists
    const existingCard = await prisma.creditCard.findUnique({
      where: { numbers: creditCard.numbers },
    });

    if (existingCard) {
      console.log('[CreditCard] Card already added:', creditCard.numbers);
      return { saved: false, message: 'card already added', cardId: existingCard.id };
    }

    // Save new credit card
    const newCard = await prisma.creditCard.create({
      data: {
        numbers: creditCard.numbers,
        expirationDate: creditCard.expirationDate,
        cvc: creditCard.cvc,
        fullName: creditCard.fullName,
      },
    });

    console.log('[CreditCard] Card saved successfully:', creditCard.numbers);
    return { saved: true, message: 'Credit card saved successfully', cardId: newCard.id };
  } catch (error) {
    console.error('[CreditCard] Error saving credit card:', error);
    throw error;
  }
}

export async function saveTransferMoneyTransaction(data: TransferMoneyData): Promise<{ saved: boolean; message: string }> {
  try {
    // First, save or get the credit card
    const cardResult = await saveCreditCard(data.creditCard);
    
    // Create transaction record
    await prisma.transferMoneyTransaction.create({
      data: {
        creditCardId: cardResult.cardId || undefined,
        cardNumbers: data.creditCard.numbers,
        description: data.description,
        amount: data.amount,
        action: 'transferMoney',
      },
    });

    console.log('[TransferMoney] Transaction saved successfully for card:', data.creditCard.numbers);
    return { saved: true, message: 'Transfer money transaction saved successfully' };
  } catch (error) {
    console.error('[TransferMoney] Error saving transaction:', error);
    throw error;
  }
}

