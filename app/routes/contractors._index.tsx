import type { MetaFunction, ActionFunctionArgs  } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import Select from "react-select";

import Heading from "~/components/heading";
import { Ratings } from "~/components/rating";
import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
  renderPageNumbers,
} from "~/components/ui/pagination"
import { getContractors } from "~/models/contractor.server";


import content from "../content/contractors.json";
import { STATES, SERVICES, CERTIFICATIONS, Contractor, ContractorFilters, ContractorResponse } from "../types";

export async function action({ request }: ActionFunctionArgs) : Promise<ContractorResponse> {
  const body = await request.formData();
  const services: string[] = [];
  const certifications: string[] = [];

  for (const pair of body.entries()) {
    if (!pair[1]) continue;
    if (pair[0] == "services") {
      services.push(pair[1].toString());
    } 
    if (pair[0] == "certifications") {
      certifications.push(pair[1].toString());
    } 
  }

  let zip = body.get("zip")?.toString();
  if (!zip || zip.length != 5) {
    zip = "";
  }
  
  const filters : ContractorFilters = {
    "zip": zip,
    "stateServed": body.get("state")?.toString() ?? "",
    "services": services,
    "certifications": certifications
  }

  const pageNumber = Number(body.get("page-number")?.toString()) ?? 1;

  const data = await getContractors(filters, pageNumber);
  return data as ContractorResponse;
}

export async function loader() : Promise<ContractorResponse> {
  const data = await getContractors({} as ContractorFilters);
  return data as ContractorResponse;
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
        <div className="flex justify-between px-4 py-2 ">
          <h2 className="text-xl font-bold">
            {contractor.name}
          </h2>
          {contractor.distance ? <div className="align-center">
            Distance: {contractor.distance} mi
          </div> : null}
        </div>
        <div className="flex">
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
          <div className="flex grow flex-col items-end px-4 pb-4 text-sm">
            <a
              href={contractor.website}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm underline hover:text-blue-500"
            >
              Website
            </a>
            <a
              href={`mailto:${contractor.email}`}
              rel="noreferrer"
              className="inline-block text-sm underline hover:text-blue-500"
            >
              Email
            </a>
            <PhoneLink phoneNumber={contractor.phone} />
            <p>{`${contractor.city}, ${contractor.state}`}</p>
            <div className="mt-auto flex pt-2">
              <Ratings rating={4.4} title="4.4" />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default function ContractorList() {
  const initialData = useLoaderData<typeof loader>();
  const initialContractors = initialData.contractors as Contractor[];
  const [filteredContractors, setFilteredContractors] = useState(initialContractors);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);

  const fetcher = useFetcher<ContractorResponse>();
  
  useEffect(() => { 
    if (fetcher.data) {
      const data = fetcher.data;
      setFilteredContractors(data.contractors);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    }
  }, [fetcher.data]);

  interface Option<Type> {
    value: Type;
    label: Type;
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    (document.getElementById("page-number") as HTMLInputElement).value = page.toString();
    const form = document.getElementById("filter-form") as HTMLFormElement;

    fetcher.submit(
      form,
      {
        method: "POST",
      }
    );
  };

  return (
    <div>
      <Heading>{content.heading}</Heading>
      <fetcher.Form id="filter-form" method="post">
        <div className="mt-6 flex flex-wrap gap-y-2 items-center justify-center space-x-4">
          <h3 className="font-bold">Filter by:</h3>
          <Select<Option<string>>
            id="state"
            instanceId="state"
            name="state"
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
            id="services"
            instanceId="services"
            name="services"
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
            id="certifications"
            instanceId="certifications"
            name="certifications"
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
            className="border-2 w-24 rounded-sm p-[6px]"
            type="text"
            id="zip"
            name="zip"
            placeholder="Zip Code"
            maxLength={5}
          />
          <input type="hidden" id="page-number" name="page-number" value="1"></input>
          <button className="px-4 py-2 bg-gray-200 rounded-sm hover:bg-gray-300" type="submit">Search</button>
        </div>
      </fetcher.Form>
      <ul className="mt-6 space-y-4">
        {filteredContractors.map((contractor: Contractor) => (
          <ContractorBlock contractor={contractor} key={contractor.name} />
        ))}
      </ul>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</PaginationPrevious>
          {renderPageNumbers(currentPage, totalPages, handlePageChange)}
          <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</PaginationNext>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
