export interface BinResponse {
  scheme: string;
  type: string;
  brand: string;
  country: {
    name: string;
    emoji: string;
    alpha2: string;
  };
  bank: {
    name: string;
  };
}