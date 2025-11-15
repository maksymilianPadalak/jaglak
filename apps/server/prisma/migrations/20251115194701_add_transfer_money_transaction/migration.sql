-- CreateTable
CREATE TABLE "TransferMoneyTransaction" (
    "id" TEXT NOT NULL,
    "creditCardId" TEXT,
    "cardNumbers" TEXT NOT NULL,
    "amount" TEXT,
    "description" TEXT,
    "action" TEXT NOT NULL DEFAULT 'transferMoney',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferMoneyTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransferMoneyTransaction" ADD CONSTRAINT "TransferMoneyTransaction_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "CreditCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
