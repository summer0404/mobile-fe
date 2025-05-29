// Loại giao dịch: thu nhập hoặc chi tiêu
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

// Trạng thái giao dịch
export enum TransactionStatus {
  PENDING = 'pending',
  PAID = 'paid'
}