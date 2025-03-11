import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import Select from "react-select";

import content from "../content/contractors.json";
import { CONTRACTORS, STATES, SERVICES } from "../data";
import { State, Service, Contractor, Address } from "../types";

export const meta: MetaFunction = () => [
  { title: "Contractor List | re:Power DMV" },
];

interface PhoneLinkProps {
  phoneNumber: string;
}

const PhoneLink = (props: PhoneLinkProps) => {
  const { phoneNumber } = props;
  const formattedPhoneNumber = `(${phoneNumber.slice(0, 3)})${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  return <a href={`tel:+1${phoneNumber}`}>{formattedPhoneNumber}</a>;
};

interface AddressBlockProps {
  address: Address;
}

const AddressBlock = ({ address }: AddressBlockProps) => {
  return (
    <>
      <p>{address.line1}</p>
      {address.line2 ? <p>{address.line2}</p> : null}
      <p>{`${address.city}, ${address.state} ${address.zipCode}`}</p>
    </>
  );
};

const filterContractors = (
  contractors: Contractor[],
  selectedState: State | undefined,
  selectedServices: Service[],
) => {
  const filtered = contractors.filter((contractor) => {
    const matchesSelectedState =
      selectedState === undefined ||
      contractor.statesServed.includes(selectedState);

    const matchesSelectedServices =
      selectedServices.length === 0 ||
      contractor.services.some((service) => selectedServices.includes(service));

    return matchesSelectedState && matchesSelectedServices;
  });
  return filtered;
};

interface ContractorBlockProps {
  contractor: Contractor;
}

const ContractorBlock = (props: ContractorBlockProps) => {
  const { contractor } = props;
  return (
    <li key={contractor.name} className="flex justify-center">
      <div className="flex w-full max-w-2xl items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="flex-shrink-0">
          <img
            className="h-24 w-24 object-cover"
            src="https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg"
            alt="Placeholder"
          />
        </div>
        <div className="p-4">
          <h2 className="text-xl font-bold">{contractor.name}</h2>
          <PhoneLink phoneNumber={contractor.phoneNumber} />
          <AddressBlock address={contractor.address} />
          <p>States Served: {contractor.statesServed.join(", ")}</p>
          <p>Services Offered: {contractor.services.join(", ")}</p>
        </div>
      </div>
    </li>
  );
};

export default function ContractorList() {
  const [selectedState, setSelectedState] = useState<State | undefined>();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [filteredContractors, setFilteredContractors] = useState(CONTRACTORS);

  useEffect(() => {
    const newFilteredContractors = filterContractors(
      CONTRACTORS,
      selectedState,
      selectedServices,
    );
    setFilteredContractors(newFilteredContractors);
  }, [selectedState, selectedServices]);

  interface Option<Type> {
    value: Type;
    label: Type;
  }
  const onSelectedStateChanged = (option: Option<State> | null) => {
    setSelectedState(option?.value);
  };

  const onSelectedServicesChanged = (options: readonly Option<Service>[]) => {
    setSelectedServices(options.map((option) => option.value));
  };

  return (
    <main className="relative min-h-screen bg-white p-8">
      <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-900">
        {content.heading}
      </h1>
      <div className="mt-6 flex items-center justify-center space-x-4">
        <h3 className="font-bold">Filter by:</h3>
        <Select<Option<State>>
          isClearable
          placeholder="Anywhere"
          options={STATES.map((state) => ({
            value: state,
            label: state,
          }))}
          onChange={onSelectedStateChanged}
        />
        <Select<Option<Service>, true>
          isMulti
          placeholder="Any service"
          options={SERVICES.map((service) => ({
            value: service,
            label: service,
          }))}
          onChange={onSelectedServicesChanged}
        />
      </div>
      <ul className="mt-6 space-y-4">
        {filteredContractors.map((contractor) => (
          <ContractorBlock contractor={contractor} key={contractor.name} />
        ))}
      </ul>
    </main>
  );
}
