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

export interface CustomField {
  field_id: number;
  field_name: string;
  field_code?: string;
  field_type?: string;
  values: Array<{
    value: string | number | boolean;
    enum_id?: number;
    enum_code?: string;
  }>;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

export interface Task {
  id: number;
  text: string;
  complete_till: number;
  is_completed: boolean;
  task_type_id: number;
  created_at: number;
  updated_at: number;
  responsible_user_id: number;
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
  custom_fields: CustomField[];
  tags?: Tag[];
  tasks?: Task[];
  loss_reason?: string;
  loss_reason_name?: string;
  closed_at?: string;
  closest_task_at?: number;
  account_id?: number;
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