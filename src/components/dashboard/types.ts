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

export interface AppNotification {
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
  status_name: string;
  status_color: string;
  pipeline_id: number;
  pipeline_name: string;
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

export interface Document {
  id: string;
  name: string;
  file_url: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
  type: 'contract' | 'agreement' | 'other';
}

export interface ChatMessage {
  id: string;
  text: string;
  created_at: number;
  author_id: number;
  is_client: boolean;
}