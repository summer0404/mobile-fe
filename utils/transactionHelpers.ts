import { TransactionItemData } from "@/components/addTransaction/types"; 

export interface GroupedTransactions {
  [monthYear: string]: TransactionItemData[];
}

export const groupTransactionsByMonth = (transactions: TransactionItemData[]): GroupedTransactions => {
  return transactions.reduce((acc, transaction) => {
    const monthYear = transaction.dateObject.toLocaleDateString('en-US', {
      month: 'long', // "April"
      year: 'numeric', // "2024"
    });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(transaction);
    // Sort transactions within each month by date, newest first
    acc[monthYear].sort((a, b) => b.dateObject.getTime() - a.dateObject.getTime());
    return acc;
  }, {} as GroupedTransactions);
};