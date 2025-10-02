export interface Loan {
  id: string;
  amount: number;
  paid: number;
  status: 'active' | 'completed' | 'overdue';
  date: string;
  nextPayment: string;
  rate: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  type: 'payment' | 'fee' | 'penalty';
  status: 'success' | 'pending';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}
