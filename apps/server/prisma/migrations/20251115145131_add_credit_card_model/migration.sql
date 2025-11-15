-- CreateTable
CREATE TABLE "CreditCard" (
    "id" TEXT NOT NULL,
    "numbers" TEXT NOT NULL,
    "expirationDate" TEXT NOT NULL,
    "cvc" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditCard_numbers_key" ON "CreditCard"("numbers");
