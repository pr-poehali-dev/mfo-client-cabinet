export interface Loan {
  id: string;
  amount: number;
  paid: number;
  status: 'active' | 'completed' | 'overdue';
  date: string;
  nextPayment: string;
  rate: number;
  name?: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  type: 'payment' | 'fee' | 'penalty';
  status: 'success' | 'pending';
  loan_id?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export interface Deal {
  id: string;
  name: string;
  status: string;
  price: number;
  status_id: number;
  pipeline_id: number;
  responsible_user_id: number;
  created_at: string;
  updated_at: string;
  custom_fields: Array<{
    field_id: number;
    field_name: string;
    field_code: string;
    values: Array<{
      value: string | number;
    }>;
  }>;
}