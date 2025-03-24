export const STATES = ["DC", "MD", "VA"] as const;
export const SERVICES = [
  "Energy Audit",
  "Weatherization",
  "HVAC",
  "Electrical",
  "Water Heater",
  "Appliances",
];

export interface State {
  state: string;
}

export interface Service {
  serviceName: string;
}

export interface Contractor {
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  statesServed: State[];
  services: Service[];
}

export type SerializedContractor = Omit<
  Contractor,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
};

export const deserializeContractor = (
  serialized: SerializedContractor,
): Contractor => {
  return {
    ...serialized,
    createdAt: new Date(serialized.createdAt),
    updatedAt: new Date(serialized.createdAt),
  };
};

export const deserializeContractors = (
  serialized: SerializedContractor[],
): Contractor[] => {
  return serialized.map((obj) => deserializeContractor(obj));
};
