export type PageId = 'home' | 'forms' | 'tables' | 'dynamic' | 'shadow-iframe' | 'flows' | 'guides';

export interface NetworkLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  duration?: number;
  requestBody?: string;
  responseBody?: string;
  mocked?: boolean;
}

export interface MockRule {
  id: string;
  urlPattern: string;
  status: number;
  responseBody: string;
  enabled: boolean;
  delayMs: number;
}

export interface PageInfo {
  id: PageId;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export type AutomationFramework = 'playwright' | 'selenium' | 'cypress';

export interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  role: string;
  subscribe: boolean;
  terms: boolean;
}

export interface TableRow {
  id: number;
  name: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Pending';
  role: string;
  joinedDate: string;
}
