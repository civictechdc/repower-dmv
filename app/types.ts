export const STATES = ["DC", "MD", "VA"] as const;
export const SERVICES = [
  "Energy Audit",
  "Weatherization",
  "HVAC / Heat Pump",
  "Electrical",
  "Water Heater",
  "Appliances",
];
export const CERTIFICATIONS = ["CEA", "HEP", "BPI-ALCI", "BPI-ACHPP"];

export interface State {
  id: number;
  name: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
}

export interface Certification {
  id: number;
  name: string;
  shortName: string;
  description: string;
}

export interface Contractor {
  id: string;
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
  distance?: number | undefined;
  googleRating?: number | undefined;
}

export interface CreateContractorPayload {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  statesServed: string[];
  services: string[];
  certifications: string[];
}

export interface ContractorResponse {
  contractors: Contractor[],
  totalPages: number,
  currentPage: number  
}

export interface ContractorFilters {
  stateServed: string;
  services: string[];
  certifications: string[];
  zip: string;
}
