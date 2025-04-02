import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import Heading from "~/components/heading";
import { getContractorById } from "~/models/contractor.server";

import {
  Contractor,
} from "../types";


export async function loader({ params }: LoaderFunctionArgs) {
  const contractorId = params.contractorId as string;
  return json(await getContractorById(contractorId));
}

export const meta: MetaFunction = () => [
  { title: "Contractor | re:Power DMV" },
];

interface PhoneLinkProps {
  phoneNumber: string;
}

const PhoneLink = (props: PhoneLinkProps) => {
  const { phoneNumber } = props;
  const formattedPhoneNumber = `(${phoneNumber.slice(0, 3)})${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  return <a href={`tel:+1${phoneNumber}`}>{formattedPhoneNumber}</a>;
};

export default function ContractorDetails() {
  const contractor = useLoaderData<typeof loader>() as Contractor;
  return (
    <div>
      <Heading>{contractor.name}</Heading>
      <Link to="/contractors" className="mb-4"><div className="inline-block mb-4 p-2 bg-gray-300 rounded-lg hover:shadow-md">Back to Contractor List</div></Link>
      <div className="relative w-full max-w-3xl items-start overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <h2 className="inline-block p-2 text-xl font-bold">{contractor.name}</h2>
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
    </div>
  );
}
