import { MetaFunction, ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import React, { useState, Dispatch, SetStateAction } from "react";

import content from "../content/apply.json";
import { SERVICES, STATES, Contractor, Service, State } from "../types";
import {
  formatPhoneNumber,
  validateEmail,
  isEmpty,
  validateURL,
  formatZipCode,
} from "../utils";

export const meta: MetaFunction = () => [
  { title: "Apply as a Contractor | re:Power DMV" },
];

// TODO: Change this to different one
const REDIRECT_URL = "/";

interface InputBlockProps {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
  required: boolean;
}

interface CheckboxBlockProps {
  id: string;
  name: string;
  value: string;
  selectedValues: State[] | Service[];
  field: string;
}

interface ContractorBlockProps {
  actionData: any;
  contractor?: Contractor;
  setContractor: Dispatch<SetStateAction<Contractor>>;
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

const handleCheckboxOnChange = (
  props: CheckboxBlockProps & ContractorBlockProps,
  e: React.ChangeEvent<HTMLInputElement>,
) => {
  const { setContractor } = props;
  const selectedValues = props.selectedValues;

  const exists =
    selectedValues.find((filter) => filter.name === e.target.value) || false;

  if (exists) {
    const updatedSelectedValues = selectedValues.filter(
      (filter) => filter.name !== e.target.value,
    );
    setContractor((prevData: Contractor) => ({
      ...prevData,
      [props.field]: updatedSelectedValues,
    }));
  } else {
    setContractor((prevData: Contractor) => ({
      ...prevData,
      [props.field]: [
        ...(prevData ? prevData[props.field as keyof Contractor] : []),
        { name: e.target.value },
      ],
    }));
  }
};

const LabelBlock = (props: { label: string; required: boolean }) => {
  return (
    <>
      <label className="block text-sm/6 font-medium text-gray-900">
        {props.label}{" "}
        {props.required ? <span className="text-red-500">*</span> : <></>}
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
  const { actionData } = props;
  const key: string = props["name"];
  return (
    <>
      <LabelBlock label={props.label} required={props.required} />
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
        maxLength={props["maxLength"]}
        onChange={(e) => handleContractorOnChange(props, e)}
      />
      <ErrorMessageBlock value={actionData?.errors[key]} />
    </>
  );
};

const CheckboxBlock = (props: CheckboxBlockProps & ContractorBlockProps) => {
  const { contractor } = props;

  const values: any = contractor
    ? contractor[props.field as keyof Contractor]
    : [];
  return (
    <div className="my-1 flex">
      <input
        type="checkbox"
        id={props["id"]}
        name={props["name"]}
        className="mt-1 h-4 w-4 shrink-0 appearance-none rounded-sm border-2 border-blue-600 bg-white checked:border-0 checked:bg-blue-800"
        value={props["value"]}
        checked={
          values.find((value: State | Service) => value.name === props["value"])
            ? true
            : false
        }
        onChange={(e) => handleCheckboxOnChange(props, e)}
      />
      <label htmlFor={props["name"]} className="pl-3 font-medium text-gray-900">
        {props["value"]}
      </label>
    </div>
  );
};

const ContractorBlock = (props: ContractorBlockProps) => {
  const { actionData, contractor } = props;
  return (
    <div>
      <div>
        <p className="pb-3 text-2xl font-semibold">
          Company & Contact Information
        </p>
        <div className="pb-3">
          <InputBlock
            {...{
              id: "name",
              name: "name",
              label: "Company Name",
              value: contractor?.name || "",
              required: true,
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
              required: true,
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
              required: true,
              maxLength: 13,
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
              required: true,
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
              required: true,
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
              required: false,
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
                required: true,
                maxLength: 49,
                ...props,
              }}
            />
          </div>
          <div className="flex w-1/2 flex-col">
            <LabelBlock label="State" required={true} />
            <select
              id="stateSelect"
              name="state"
              className={
                actionData?.errors["state"]
                  ? "border border-red-500 px-3 py-1.5"
                  : "px-3 py-1.5"
              }
              onChange={(e) => handleContractorOnChange(props, e)}
            >
              {["", ...STATES].map((item) => (
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
              required: true,
              maxLength: 5,
              ...props,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const ServiceBlock = (props: ContractorBlockProps) => {
  const { actionData, contractor } = props;
  return (
    <div>
      <p className="text-2xl font-semibold">Services</p>
      <div className="py-3">
        <p className="text-lg font-medium">
          States Served (check all that apply):{" "}
          <span className="text-red-500">*</span>
        </p>
        <div className="pt-3">
          {STATES.map((item, index) => (
            <div key={index}>
              <CheckboxBlock
                {...{
                  id: `state_served_${index}`,
                  name: `state_served_${index}`,
                  value: item,
                  selectedValues: contractor?.statesServed || [],
                  field: "statesServed",
                  ...props,
                }}
              />
            </div>
          ))}
          <ErrorMessageBlock value={actionData?.errors?.statesServed} />
        </div>
      </div>
      <div className="py-3">
        <p className="text-lg font-medium">
          Services offered (check all that apply):{" "}
          <span className="text-red-500">*</span>
        </p>
        <div className="pt-3">
          {SERVICES.map((item, index) => (
            <div key={index}>
              <CheckboxBlock
                {...{
                  id: `service_${index}`,
                  name: `service_${index}`,
                  value: item,
                  selectedValues: contractor?.services || [],
                  field: "services",
                  ...props,
                }}
              />
            </div>
          ))}
          <ErrorMessageBlock value={actionData?.errors?.services} />
        </div>
      </div>
    </div>
  );
};

const SubmitBlock = (props: ContractorBlockProps) => {
  return (
    <div className="py-10">
      <button
        type="submit"
        className="rounded bg-blue-500 px-10 py-3 font-semibold text-white hover:bg-blue-600"
        onClick={() => {
          console.log(props.contractor);
        }}
      >
        SUBMIT
      </button>
    </div>
  );
};

export default function Application() {
  const actionData = useActionData<typeof action>();
  const [contractor, setContractor] = useState<Contractor>({
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
      <div className="flex w-full flex-col items-center justify-center">
        <div className="flex w-1/2 flex-col items-center justify-center">
          <div className="flex w-full px-5 py-2 text-4xl font-bold">
            {content.heading}
          </div>
          <Form method="post" className="flex w-full flex-col p-5">
            <ContractorBlock
              actionData={actionData}
              contractor={contractor}
              setContractor={setContractor}
            />
            <hr className="my-5 border-2 border-gray-300" />
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

  const fieldDict: Record<string, string> = {
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

  const errors: Record<string, string> = {};

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

  return redirect(REDIRECT_URL);
}
