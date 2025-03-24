import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import Select from "react-select";

import { getContractors } from "~/models/contractor.server";

import content from "../content/contractors.json";
import { CONTRACTORS, STATES, SERVICES } from "../data";
import { State, Service, Contractor, Address } from "../types";

export async function loader() {
  const data = await getContractors();
  return data;
}
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
  selectedState: string | undefined,
  selectedServices: string[],
) => {
  const filtered = contractors.filter((contractor) => {
    const matchesSelectedState =
      selectedState === undefined ||
<<<<<<< Updated upstream
      contractor.statesServed.includes(selectedState);

    const matchesSelectedServices =
      selectedServices.length === 0 ||
      contractor.services.some((service) => selectedServices.includes(service));
=======
      contractor.statesServed.some((s: State) => s.state == selectedState);

    const matchesSelectedServices =
      selectedServices.length === 0 ||
      contractor.services.some((service: Service) => selectedServices.includes(service.serviceName));
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
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
=======
      <div className="relative w-full max-w-2xl items-start overflow-hidden cursor-pointer rounded-lg border border-gray-200 bg-white shadow-md">
        <h2 className="text-xl font-bold p-2">{contractor.name}</h2>
        <div className="flex">
          <div className="flex-shrink-0 pl-2 pb-2">
            <img
              className="h-24 w-24 object-cover"
              src="https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg"
              alt="Placeholder"
            />
          </div>
          <div className="grow px-4 pb-4">
            <ul>
              {contractor.statesServed.map((item, index) => (
                <li key={index} className="inline-block rounded-full bg-blue-100 px-2 text-xs text-blue-800 mr-1">{item.state}</li>
              ))}
            </ul>
            <ul>
              {contractor.services.map((item, index) => (
                <li key={index} className="inline-block rounded-full bg-green-100 px-2 text-xs text-green-800 mr-1">{item.serviceName}</li>
              ))}
            </ul>
            <a href={contractor.website} target="_blank" rel="noreferrer" className="block underline hover:text-blue-500" onClick={ e => e.stopPropagation() }>{contractor.website}</a>
          </div>
          <div className="grow px-4 pb-4 text-sm">
            <PhoneLink phoneNumber={contractor.phone} />
            <p>{contractor.email}</p>
            <p>{contractor.addressLine1}</p>
            {contractor.addressLine2 ? <p>{contractor.addressLine2}</p> : null}
            <p>{`${contractor.city}, ${contractor.state} ${contractor.zip}`}</p>
          </div>
>>>>>>> Stashed changes
        </div>
      </div>
    </li>
  );
};

export default function ContractorList() {
<<<<<<< Updated upstream
  const [selectedState, setSelectedState] = useState<State | undefined>();
=======
  const CONTRACTORS = useLoaderData<typeof loader>().contractors;
  const [selectedState, setSelectedState] = useState<string | undefined>();
>>>>>>> Stashed changes
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
  const onSelectedStateChanged = (option: Option<string> | null) => {
    setSelectedState(option?.value);
  };

  const onSelectedServicesChanged = (options: readonly Option<string>[]) => {
    setSelectedServices(options.map((option) => option.value));
  };

  return (
    <main className="relative min-h-screen bg-white p-8">
      <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-900">
        {content.heading}
      </h1>
      <div className="mt-6 flex items-center justify-center space-x-4">
        <h3 className="font-bold">Filter by:</h3>
        <Select<Option<string>>
          isClearable
          placeholder="Anywhere"
          options={STATES.map((state) => ({
            value: state,
            label: state,
          }))}
          onChange={onSelectedStateChanged}
        />
        <Select<Option<string>, true>
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
        {filteredContractors.map((contractor: Contractor) => (
          <ContractorBlock contractor={contractor} key={contractor.name} />
        ))}
      </ul>
    </main>
  );
}
