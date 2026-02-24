export type MarketRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MarketRequest {
  id: string;
  title: string;
  description?: string;
  resolutionCriteria: string;
  category: string;
  proposedCloseTime: string;
  status: MarketRequestStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}
