import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import Select from "react-select";

import { getContractors } from "~/models/contractor.server";

import content from "../content/contractors.json";
import { STATES, SERVICES, State, Contractor } from "../types";

export async function loader() {
  const data = await getContractors();
  return json(data);
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

const filterContractors = (
  contractors: Contractor[],
  selectedState: string | "",
  selectedServices: string[],
) => {
  const filtered = contractors.filter((contractor) => {
    const matchesSelectedState =
      selectedState === "" ||
      contractor.statesServed.some((s: State) => s.name == selectedState);

    const matchesSelectedServices =
      selectedServices.length === 0 ||
      contractor.services.some((service) =>
        selectedServices.includes(service.name),
      );

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
      <div className="relative w-full max-w-2xl cursor-pointer items-start overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <h2 className="p-2 text-xl font-bold">{contractor.name}</h2>
        <div className="flex">
          <div className="flex-shrink-0 pb-2 pl-2">
            <img
              className="h-24 w-24 object-cover"
              src="https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg"
              alt="Placeholder"
            />
          </div>
          <div className="grow px-4 pb-4">
            <ul>
              {contractor.statesServed.map((item, index) => (
                <li
                  key={index}
                  className="mr-1 inline-block rounded-full bg-blue-100 px-2 text-xs text-blue-800"
                >
                  {item.name}
                </li>
              ))}
            </ul>
            <ul>
              {contractor.services.map((item, index) => (
                <li
                  key={index}
                  className="mr-1 inline-block rounded-full bg-green-100 px-2 text-xs text-green-800"
                >
                  {item.name}
                </li>
              ))}
            </ul>
            <a
              href={contractor.website}
              target="_blank"
              rel="noreferrer"
              className="block underline hover:text-blue-500"
              onClick={(e) => e.stopPropagation()}
            >
              {contractor.website}
            </a>
          </div>
          <div className="grow px-4 pb-4 text-sm">
            <PhoneLink phoneNumber={contractor.phone} />
            <p>{contractor.email}</p>
            <p>{contractor.addressLine1}</p>
            {contractor.addressLine2 ? <p>{contractor.addressLine2}</p> : null}
            <p>{`${contractor.city}, ${contractor.state} ${contractor.zip}`}</p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default function ContractorList() {
  const initialContractors = useLoaderData<typeof loader>()
    .contractors as Contractor[];
  const [contractors] = useState(initialContractors);
  const [selectedState, setSelectedState] = useState<string | "">();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [filteredContractors, setFilteredContractors] = useState(contractors);

  useEffect(() => {
    const newFilteredContractors = filterContractors(
      contractors,
      selectedState ?? "",
      selectedServices,
    );
    setFilteredContractors(newFilteredContractors);
  }, [contractors, selectedState, selectedServices]);

  interface Option<Type> {
    value: Type;
    label: Type;
  }
  const onSelectedStateChanged = (option: Option<string> | null | void) => {
    setSelectedState(option?.value);
  };

  const onSelectedServicesChanged = (
    options: readonly Option<string>[] | [],
  ) => {
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
