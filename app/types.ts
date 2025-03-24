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

export interface Address {
  line1: string;
  line2: string;
  city: string;
  state: State;
  zipCode: string;
}

export interface Contractor {
  name: string;
<<<<<<< Updated upstream
  address: Address;
  phoneNumber: string;
  statesServed: string[];
=======
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  statesServed: State[];
>>>>>>> Stashed changes
  services: Service[];
}
