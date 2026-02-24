export interface ResponsibleGamblingSettings {
  dailyDepositLimitCents: number | null;
  weeklyDepositLimitCents: number | null;
  monthlyDepositLimitCents: number | null;
  dailyLossLimitCents: number | null;
  weeklyLossLimitCents: number | null;
  monthlyLossLimitCents: number | null;
  coolingOffUntil: string | null;
  realityCheckIntervalMins: number | null;
  isInCoolingOff: boolean;
}
