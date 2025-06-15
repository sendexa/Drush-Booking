export interface ApiKey {
  id: string;
  name: string;
  clientId: string;
  keyPrefix: string;
  keySecret: string;
  createdAt: string;
  lastUsed?: string;
}

// types.ts
export interface SMSPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  discount?: number;
  popular?: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  plan: string;
  credits: number;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
}