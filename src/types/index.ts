export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type LeadSource = 'Website' | 'Instagram' | 'Referral';

export interface ILead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: string;
}

export interface IPaginationMeta {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}