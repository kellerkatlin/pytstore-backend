-- AddForeignKey
ALTER TABLE "CapitalTransaction" ADD CONSTRAINT "CapitalTransaction_originAccountId_fkey" FOREIGN KEY ("originAccountId") REFERENCES "CapitalAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
