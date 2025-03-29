import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import Select from "react-select";

import Heading from "~/components/heading";
import { getContractors } from "~/models/contractor.server";

import { STATES, SERVICES, CERTIFICATIONS, State, Contractor } from "../types";

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
  selectedCertifications: string[],
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

    const matchesSelectedCertifications =
      selectedCertifications.length === 0 ||
      contractor.certifications.some((cert) =>
        selectedCertifications.includes(cert.shortName),
      );

    return matchesSelectedState && matchesSelectedServices && matchesSelectedCertifications;
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
      <div className="relative w-full max-w-3xl items-start overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <Link to={"/contractors/"+contractor.id}><h2 className="inline-block p-2 text-xl font-bold hover:underline">{contractor.name}</h2></Link>
        <div className="flex">
          <Link to={"/contractors/"+contractor.id} className="flex-shrink-0 pb-2 pl-2 cursor-pointer">
            <img
              className="h-24 w-24 object-cover hover:shadow-lg"
              src="https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg"
              alt="Placeholder"
            />
          </Link>
          <div className="grow px-4 pb-4">
            <ul>
              {contractor.statesServed.map((item, index) => (
                <li
                  key={index}
                  className="mr-1 inline-block rounded-full bg-green-100 px-2 text-xs text-green-800"
                >
                  {item.name}
                </li>
              ))}
            </ul>
            <ul>
              {contractor.services.map((item, index) => (
                <li
                  key={index}
                  className="mr-1 inline-block rounded-full bg-blue-100 px-2 text-xs text-blue-800"
                >
                  {item.name}
                </li>
              ))}
            </ul>
            <ul>
              {contractor.certifications.map((item, index) => (
                <li
                  key={index}
                  className="mr-1 inline-block rounded-full bg-orange-100 px-2 text-xs text-orange-800"
                  title={item.name}
                >
                  {item.shortName}
                </li>
              ))}
            </ul>
            <a
              href={contractor.website}
              target="_blank"
              rel="noreferrer"
              className="inline-block underline text-sm hover:text-blue-500"
            >
              Website
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
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [filteredContractors, setFilteredContractors] = useState(contractors);

  useEffect(() => {
    const newFilteredContractors = filterContractors(
      contractors,
      selectedState ?? "",
      selectedServices,
      selectedCertifications,
    );
    setFilteredContractors(newFilteredContractors);
  }, [contractors, selectedState, selectedServices, selectedCertifications]);

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

  const onSelectedCertificationsChanged = (
    options: readonly Option<string>[] | [],
  ) => {
    setSelectedCertifications(options.map((option) => option.value));
  };

  return (
    <div>
      <Heading title="Contractor List" />
      <div className="mt-6 flex items-center justify-center space-x-4">
        <h3 className="font-bold">Filter by:</h3>
        <Select<Option<string>>
          classNames={{
            control: () => "!border-2 !border-green-200",
          }}
          isClearable
          placeholder="Anywhere"
          options={STATES.map((state) => ({
            value: state,
            label: state,
          }))}
          onChange={onSelectedStateChanged}
        />
        <Select<Option<string>, true>
          classNames={{
            control: () => "!border-2 !border-blue-200",
          }}
          isMulti
          placeholder="Any service"
          options={SERVICES.map((service) => ({
            value: service,
            label: service,
          }))}
          onChange={onSelectedServicesChanged}
        />
        <Select<Option<string>, true>
          classNames={{
            control: () => "!border-2 !border-orange-200",
          }}
          isMulti
          placeholder="Any certifications"
          options={CERTIFICATIONS.map((cert) => ({
            value: cert,
            label: cert,
          }))}
          onChange={onSelectedCertificationsChanged}
        />
      </div>
      <ul className="mt-6 space-y-4">
        {filteredContractors.map((contractor: Contractor) => (
          <ContractorBlock contractor={contractor} key={contractor.name} />
        ))}
      </ul>
    </div>
  );
}
