import { json } from "@remix-run/node";
import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import Select from "react-select";

import Heading from "~/components/heading";
import { Ratings } from "~/components/rating";
import { getContractors } from "~/models/contractor.server";

import content from "../content/contractors.json";
import { STATES, SERVICES, CERTIFICATIONS, Contractor, ContractorFilters } from "../types";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();

  console.log(JSON.stringify(body, null, 2));
  let services: string[] = [];
  let certifications: string[] = [];

  for (var pair of body.entries()) {
    if (pair[0] == "services") {
      services.push(pair[1].toString())
    } 
    if (pair[0] == "certifications") {
      certifications.push(pair[1].toString())
    } 
  }
  
  let filters : ContractorFilters = {
    "zip": body.get("zip")?.toString() ?? "",
    "stateServed": body.get("state")?.toString() ?? "",
    "services": services,
    "certifications": certifications
  }

  const data = await getContractors(filters);
  return json(data);
}

export async function loader(filters = {}) {
  const data = await getContractors(filters);
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

interface ContractorBlockProps {
  contractor: Contractor;
}

const ContractorBlock = (props: ContractorBlockProps) => {
  const { contractor } = props;
  return (
    <li key={contractor.name} className="flex justify-center">
      <div className="relative w-full max-w-3xl items-start overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <Link to={"/contractors/" + contractor.id}>
          <h2 className="inline-block p-2 text-xl font-bold hover:underline">
            {contractor.name}
          </h2>
        </Link>
        <div className="flex">
          <Link
            to={"/contractors/" + contractor.id}
            className="flex-shrink-0 cursor-pointer pb-2 pl-2"
          >
            <img
              className="h-24 w-24 object-cover hover:shadow-lg"
              src="https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg"
              alt="Placeholder"
            />
          </Link>
          <div className="w-[400px] px-4 pb-4">
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
          </div>
          <div className="flex grow flex-col px-4 pb-4 text-sm">
            <div className="flex justify-end text-nowrap">
              <a
                href={contractor.website}
                target="_blank"
                rel="noreferrer"
                className="mr-2 inline-block text-sm underline hover:text-blue-500"
              >
                Website
              </a>
              <a
                href={`mailto:${contractor.email}`}
                rel="noreferrer"
                className="mr-2 inline-block text-sm underline hover:text-blue-500"
              >
                Email
              </a>
              <PhoneLink phoneNumber={contractor.phone} />
            </div>
            <p className="text-end">{`${contractor.city}, ${contractor.state}`}</p>
            <div className="mt-auto flex justify-end">
              <Ratings rating={4.4} title="4.4" />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default function ContractorList() {
  console.log("A");  
  const initialContractors = useLoaderData<typeof loader>()
    .contractors as Contractor[];
  const [contractors] = useState(initialContractors);
  console.log("B");  
  const [filteredContractors, setFilteredContractors] = useState(contractors);

  const fetcher = useFetcher();
  
  useEffect(() => { 
    console.log("C");    
    setFilteredContractors(fetcher.data?.contractors)
    console.log("D");
  }, [fetcher.data]);

  interface Option<Type> {
    value: Type;
    label: Type;
  }

  return (
    <div>
      <Heading>{content.heading}</Heading>
      <fetcher.Form method="post">
        <div className="mt-6 flex items-center justify-center space-x-4">
        <h3 className="font-bold">Filter by:</h3>
          <Select<Option<string>>
            name="state"
            id="state"
            classNames={{
              control: () => "!border-2 !border-green-200",
            }}
            isClearable
            placeholder="Anywhere"
            options={STATES.map((state) => ({
              value: state,
              label: state,
            }))}
          />
          <Select<Option<string>, true>
            name="services"
            id="services"
            classNames={{
              control: () => "!border-2 !border-blue-200",
            }}
            isMulti
            placeholder="Any service"
            options={SERVICES.map((service) => ({
              value: service,
              label: service,
            }))}
          />
          <Select<Option<string>, true>
            name="certifications"
            id="certifications"
            classNames={{
              control: () => "!border-2 !border-orange-200",
            }}
            isMulti
            placeholder="Any certifications"
            options={CERTIFICATIONS.map((cert) => ({
              value: cert,
              label: cert,
            }))}
          />
        <input
          className="border-2"
          type="number"
          id="zip"
          name="zip"
        />
        </div>
        <button type="submit">Submit</button>
      </fetcher.Form>
      <ul className="mt-6 space-y-4">
        {filteredContractors.map((contractor: Contractor) => (
          <ContractorBlock contractor={contractor} key={contractor.name} />
        ))}
      </ul>
    </div>
  );
}
