export interface PaymentMethod {
  id: string;
  name: string;
  fullName: string;
  icon: string;
  color: string;
  type: "credit" | "qr" | "emoney" | "transport";
  group: string;
}

export interface StoreReward {
  method: string;
  rate: number;
  note: string;
}

export interface Store {
  name: string;
  distance: number;
  category: string;
  lat: number;
  lng: number;
}

export type StoreRewardsMap = Record<string, StoreReward[]>;
export type PaymentMethodsMap = Record<string, Omit<PaymentMethod, "id">>;
