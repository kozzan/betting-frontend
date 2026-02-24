export interface Event {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'INACTIVE';
  marketCount: number;
}

export interface EventMarket {
  id: string;
  slug: string;
  title: string;
  closeTime: string;
  status: string;
  volumeCents?: number;
}

export interface EventDetail extends Event {
  markets?: EventMarket[];
}
