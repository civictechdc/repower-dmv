import type { MetaFunction } from "@remix-run/node";
import React, { useState } from "react";
import content from "../content/apply.json";
import { SERVICES, STATES, Contractor, Service } from "../types";
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  formatPhoneNumber,
  validateEmail,
  isEmpty,
  validateURL,
  formatZipCode,
} from "../utils";
import Heading from "~/components/heading";

export const meta: MetaFunction = () => [
  { title: "Apply as a Contractor | re:Power DMV" },
];

interface InputBlockProps {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  isMandatory: boolean;
}

interface ContractorBlockProps {
  actionData: any;
  contractor?: Contractor;
  setContractor: any;
}

const handleContractorOnChange = (
  props: ContractorBlockProps,
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
) => {
  const { setContractor } = props;

  const name = e.target.name;
  let value = e.target.value;
  if (name == "phone") {
    value = formatPhoneNumber(value);
  } else if (name == "zip") {
    value = formatZipCode(value);
  }

  setContractor((prevData: Contractor) => ({
    ...prevData,
    [name]: value,
  }));
};

const handleStatesServedOnChange = (
  props: ContractorBlockProps,
  e: React.ChangeEvent<HTMLInputElement>,
) => {
  const { contractor, setContractor } = props;
  let statesServed = contractor?.statesServed || [];
  let exists =
    statesServed.find((filter) => filter.name === e.target.value) || false;

  if (exists) {
    const updatedStatesServed = statesServed.filter(
      (filter) => filter.name !== e.target.value,
    );
    setContractor((prevData: Contractor) => ({
      ...prevData,
      statesServed: updatedStatesServed,
    }));
  } else {
    setContractor((prevData: Contractor) => ({
      ...prevData,
      statesServed: [
        ...(prevData?.statesServed || []),
        { name: e.target.value },
      ],
    }));
  }
};

const handleServiceOnChange = (
  props: ContractorBlockProps,
  e: React.ChangeEvent<HTMLInputElement>,
) => {
  const { contractor, setContractor } = props;
  let services = contractor?.services || [];
  let exists =
    services.find((filter) => filter.name === e.target.value) || false;

  if (exists) {
    const updatedServices = services.filter(
      (filter) => filter.name !== e.target.value,
    );
    setContractor((prevData: Contractor) => ({
      ...prevData,
      services: updatedServices,
    }));
  } else {
    setContractor((prevData: Contractor) => ({
      ...prevData,
      services: [...(prevData?.services || []), { name: e.target.value }],
    }));
  }
};

const LabelBlock = (props: { label: string; isMandatory: boolean }) => {
  return (
    <>
      <label className="block text-sm/6 font-medium text-gray-900">
        {props.label}{" "}
        {props.isMandatory ? <span className="text-red-500">*</span> : <></>}
      </label>
    </>
  );
};

const ErrorMessageBlock = (props: { value: string }) => {
  return props.value ? (
    <p className="block text-sm/6 text-red-500">{props.value}</p>
  ) : (
    <></>
  );
};

const InputBlock = (props: InputBlockProps & ContractorBlockProps) => {
  const { actionData, contractor } = props;
  const key: any = props["name"];
  return (
    <>
      <LabelBlock label={props.label} isMandatory={props.isMandatory} />
      <input
        className={
          actionData?.errors[key]
            ? "w-full border border-red-500 px-3 py-1.5 text-gray-900"
            : "w-full border px-3 py-1.5 text-gray-900"
        }
        id={props["id"]}
        name={props["name"]}
        value={props["value"]}
        placeholder={props["placeholder"] || ""}
        type="text"
        onChange={(e) => handleContractorOnChange(props, e)}
      />
      <ErrorMessageBlock value={actionData?.errors[key]} />
    </>
  );
};

const ContractorBlock = (props: ContractorBlockProps) => {
  const { actionData, contractor, setContractor } = props;
  return (
    <div>
      <div>
        <p className="pb-3 text-xl font-semibold">
          Company & Contact Information
        </p>
        <div className="pb-3">
          <InputBlock
            {...{
              id: "name",
              name: "name",
              label: "Company Name",
              value: contractor?.name || "",
              isMandatory: true,
              ...props,
            }}
          />
        </div>
        <div className="pb-3">
          <InputBlock
            {...{
              id: "email",
              name: "email",
              label: "Contact Email",
              value: contractor?.email || "",
              isMandatory: true,
              ...props,
            }}
          />
        </div>
        <div className="pb-3">
          <InputBlock
            {...{
              id: "phone",
              name: "phone",
              label: "Contact Phone",
              value: contractor?.phone || "",
              isMandatory: true,
              ...props,
            }}
          />
        </div>
        <div className="pb-3">
          <InputBlock
            {...{
              id: "website",
              name: "website",
              label: "Website",
              value: contractor?.website || "",
              placeholder: "https://",
              isMandatory: true,
              ...props,
            }}
          />
        </div>
      </div>
      <div>
        <div className="pb-3">
          <InputBlock
            {...{
              id: "addressLine1",
              name: "addressLine1",
              label: "Street Address",
              value: contractor?.addressLine1 || "",
              isMandatory: true,
              ...props,
            }}
          />
        </div>
        <div className="pb-3">
          <InputBlock
            {...{
              id: "addressLine2",
              name: "addressLine2",
              label: "Address Line 2",
              value: contractor?.addressLine2 || "",
              isMandatory: false,
              ...props,
            }}
          />
        </div>
        <div className="flex w-full flex-row pb-3">
          <div className="w-1/2 pr-10">
            <InputBlock
              {...{
                id: "city",
                name: "city",
                label: "City",
                value: contractor?.city || "",
                isMandatory: true,
                ...props,
              }}
            />
          </div>
          <div className="flex w-1/2 flex-col">
            <LabelBlock label="State" isMandatory={true} />
            <select
              id="stateSelect"
              name="state"
              className="px-3 py-1.5"
              onChange={(e) => handleContractorOnChange(props, e)}
            >
              {["", ...STATES].map((item, index) => (
                <option
                  key={`state_${item.toLowerCase()}`}
                  value={item.toUpperCase()}
                >
                  {item}
                </option>
              ))}
            </select>
            <ErrorMessageBlock value={actionData?.errors?.state} />
          </div>
        </div>
        <div className="w-1/2 pb-3 pr-10">
          <InputBlock
            {...{
              id: "zip",
              name: "zip",
              label: "Zip Code",
              value: contractor?.zip || "",
              isMandatory: true,
              ...props,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const ServiceBlock = (props: ContractorBlockProps) => {
  const { actionData, contractor, setContractor } = props;
  return (
    <div>
      <div className="pb-3">
        <p className="pb-3 text-xl font-semibold">
          States Served (Check all that apply){" "}
          <span className="text-red-500">*</span>
        </p>
        <div>
          {STATES.map((item, index) => (
            <div key={index}>
              <input
                type="checkbox"
                id={`state_served_${index}`}
                name={`state_served_${index}`}
                className="col-start-1 row-start-1"
                value={item}
                checked={
                  contractor?.statesServed.find(
                    (stateServed) => stateServed.name === item,
                  )
                    ? true
                    : false
                }
                onChange={(e) => handleStatesServedOnChange(props, e)}
              />
              <label
                htmlFor={`state_served_${index}`}
                className="font-medium text-gray-900"
              >
                {item}
              </label>
            </div>
          ))}
          <ErrorMessageBlock value={actionData?.errors?.statesServed} />
        </div>
      </div>
      <div className="pb-10">
        <p className="pb-3 text-xl font-semibold">
          Services offered <span className="text-red-500">*</span>
        </p>
        <div>
          {SERVICES.map((item, index) => (
            <div key={index}>
              <input
                type="checkbox"
                id={`service_${index}`}
                name={`service_${index}`}
                className="col-start-1 row-start-1"
                value={item}
                checked={
                  contractor?.services.find((service) => service.name === item)
                    ? true
                    : false
                }
                onChange={(e) => handleServiceOnChange(props, e)}
              />
              <label
                htmlFor={`service_${index}`}
                className="font-medium text-gray-900"
              >
                {item}
              </label>
            </div>
          ))}
          <ErrorMessageBlock value={actionData?.errors?.services} />
        </div>
      </div>
    </div>
  );
};

const SubmitBlock = (props: ContractorBlockProps) => {
  const { contractor } = props;
  return (
    <div>
      <button
        type="submit"
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        // onClick={(e) => handleSubmit(e)}
      >
        Submit
      </button>
    </div>
  );
};

export default function Application() {
  const actionData = useActionData<typeof action>();
  const [contractor, setContractor] = useState<Contractor | undefined>({
    id: "",
    name: "",
    email: "",
    phone: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    statesServed: [],
    services: [],
    certifications: [],
  });

  return (
    <main className="min-h screen relative">
      <Heading>{content.heading}</Heading>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="flex w-1/2 items-center justify-center">
          <Form method="post" className="flex w-full flex-col p-5">
            <ContractorBlock
              actionData={actionData}
              contractor={contractor}
              setContractor={setContractor}
            />
            <ServiceBlock
              actionData={actionData}
              contractor={contractor}
              setContractor={setContractor}
            />
            <SubmitBlock
              actionData={actionData}
              contractor={contractor}
              setContractor={setContractor}
            />
          </Form>
        </div>
      </div>
    </main>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const fieldDict: { [key: string]: string } = {
    name: "name",
    email: "email",
    phone: "phone number",
    website: "website",
    addressLine1: "street address",
    city: "city",
    state: "state",
    zip: "zip code",
  };

  const email = String(formData.get("email"));
  const website = String(formData.get("website"));

  const errors: any = {};

  // Check if required fields have missing values
  for (const key in fieldDict) {
    const value = String(formData.get(key));
    if (isEmpty(value)) {
      errors[key] = `Please provide the ${fieldDict[key]}.`;
    }
  }

  // Other validations
  if (!isEmpty(email) && !validateEmail(email)) {
    errors.email = "Please provide the valid email.";
  }

  if (!isEmpty(website) && !validateURL(website)) {
    errors.website = "Please provide the valid website.";
  }

  let statesServed = null;
  for (let i = 0; i < STATES.length; i++) {
    statesServed = statesServed || formData.get(`state_served_${i}`);
  }
  if (!statesServed) {
    errors.statesServed = "Please select at least one state.";
  }

  let services = null;
  for (let i = 0; i < SERVICES.length; i++) {
    services = services || formData.get(`service_${i}`);
  }
  if (!services) {
    errors.services = "Please select at least one service.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }
  // TODO: Fix this
  return redirect("/");
}
