export interface OracleProfile {
  id: string;
  username: string;
  bio?: string;
  resolvedMarkets: number;
  activeMarkets: number;
  accuracy?: number;
  verifiedAt?: string;
}
