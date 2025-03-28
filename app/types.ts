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
  name: string;
}

export interface Service {
  name: string;
  description: string;
}

export interface Certification {
  name: string;
  shortName: string;
  description: string;
}

export interface Contractor {
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
  certifications: Certification[];
}
