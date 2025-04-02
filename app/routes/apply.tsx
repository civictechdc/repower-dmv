import type { MetaFunction } from "@remix-run/node";
import React, { useState, useEffect, ChangeEvent } from "react";
import content from "../content/apply.json";
import styles from "../styles/apply.module.css";
import { SERVICES, STATES, Contractor, Service } from "../types";
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { data, redirect } from "@remix-run/node";
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

const ContractorBlock = (props: ContractorBlockProps) => {
  const { actionData, contractor, setContractor } = props;
  return (
    <div>
      <div>
        <h3>Contact Information</h3>
        <div>
          <label htmlFor="name" className={styles["form-input-heading-label"]}>
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            className={
              actionData?.errors?.name
                ? styles["form-input-invalid"]
                : styles["form-input"]
            }
            id="name"
            name="name"
            type="text"
            onChange={(e) => handleContractorOnChange(props, e)}
          />
          {actionData?.errors?.name ? (
            <p className={styles["form-input-error"]}>
              {actionData?.errors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className={styles["form-input-heading-label"]}>
            Contact Email <span className="text-red-500">*</span>
          </label>
          <input
            className={
              actionData?.errors?.email
                ? styles["form-input-invalid"]
                : styles["form-input"]
            }
            id="email"
            name="email"
            type="text"
            onChange={(e) => handleContractorOnChange(props, e)}
          />
          {actionData?.errors?.email ? (
            <p className={styles["form-input-error"]}>
              {actionData?.errors.email}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="phone" className={styles["form-input-heading-label"]}>
            Contact Phone <span className="text-red-500">*</span>
          </label>
          <input
            className={
              actionData?.errors?.phone
                ? styles["form-input-invalid"]
                : styles["form-input"]
            }
            id="phone"
            name="phone"
            type="text"
            value={contractor?.phone}
            onChange={(e) => handleContractorOnChange(props, e)}
            maxLength={13}
          />
          {actionData?.errors?.phone ? (
            <p className={styles["form-input-error"]}>
              {actionData?.errors.phone}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="website"
            className={styles["form-input-heading-label"]}
          >
            Company Website <span className="text-red-500">*</span>
          </label>
          <input
            className={
              actionData?.errors?.website
                ? styles["form-input-invalid"]
                : styles["form-input"]
            }
            id="website"
            name="website"
            placeholder="https://"
            type="text"
            onChange={(e) => handleContractorOnChange(props, e)}
          />
          {actionData?.errors?.website ? (
            <p className={styles["form-input-error"]}>
              {actionData?.errors.website}
            </p>
          ) : null}
        </div>
      </div>
      <div>
        <h3>Company Address</h3>
        <div>
          <label htmlFor="line1" className={styles["form-input-heading-label"]}>
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            className={
              actionData?.errors?.addressLine1
                ? styles["form-input-invalid"]
                : styles["form-input"]
            }
            id="line1"
            name="addressLine1"
            type="text"
            onChange={(e) => handleContractorOnChange(props, e)}
          />
          {actionData?.errors?.addressLine1 ? (
            <p className={styles["form-input-error"]}>
              {actionData?.errors.addressLine1}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="line2" className={styles["form-input-heading-label"]}>
            Address Line 2
          </label>
          <input
            id="line2"
            name="addressLine2"
            type="text"
            onChange={(e) => handleContractorOnChange(props, e)}
          />
        </div>
        <div className="flex w-full flex-row">
          <div className="w-1/2">
            <label
              htmlFor="city"
              className={styles["form-input-description-label"]}
            >
              City <span className="text-red-500">*</span>
            </label>
            <input
              className={
                actionData?.errors?.city
                  ? styles["form-input-invalid"]
                  : styles["form-input"]
              }
              id="city"
              name="city"
              type="text"
              onChange={(e) => handleContractorOnChange(props, e)}
              maxLength={45}
            />
            {actionData?.errors?.city ? (
              <p className={styles["form-input-error"]}>
                {actionData?.errors.city}
              </p>
            ) : null}
          </div>
          <div className="flex w-1/2 flex-col">
            <label
              htmlFor="stateSelect"
              className={styles["form-input-description-label"]}
            >
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="stateSelect"
              name="state"
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
            {actionData?.errors?.state ? (
              <p className={styles["form-input-error"]}>
                {actionData?.errors.state}
              </p>
            ) : null}
          </div>
        </div>
        <div>
          <label htmlFor="zip" className={styles["form-input-heading-label"]}>
            ZIP Code <span className="text-red-500">*</span>
          </label>
          <input
            className={
              actionData?.errors?.zip
                ? styles["form-input-invalid"]
                : styles["form-input"]
            }
            id="zip"
            name="zip"
            type="text"
            value={contractor?.zip}
            onChange={(e) => handleContractorOnChange(props, e)}
            maxLength={5}
          />
          {actionData?.errors?.zip ? (
            <p className={styles["form-input-error"]}>
              {actionData?.errors.zip}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const ServiceBlock = (props: ContractorBlockProps) => {
  const { actionData, contractor, setContractor } = props;
  return (
    <div>
      <div>
        <h4>
          States Served (Check all that apply){" "}
          <span className="text-red-500">*</span>
        </h4>
        <div>
          {STATES.map((item, index) => (
            <div key={index}>
              <input
                type="checkbox"
                id={`state_served_${index}`}
                name={`state_served_${index}`}
                className={styles["form-checkbox-input"]}
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
                className={styles["form-checkbox-label"]}
              >
                {item}
              </label>
            </div>
          ))}
          {actionData?.errors?.statesServed ? (
            <p className={styles["form-input-error"]}>
              {actionData?.errors.statesServed}
            </p>
          ) : null}
        </div>
      </div>
      <div>
        <h4>
          Services offered <span className="text-red-500">*</span>
        </h4>
        <div>
          {SERVICES.map((item, index) => (
            <div key={index}>
              <input
                type="checkbox"
                id={`service_${index}`}
                name={`service_${index}`}
                className={styles["form-checkbox-input"]}
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
                className={styles["form-checkbox-label"]}
              >
                {item}
              </label>
            </div>
          ))}
          {actionData?.errors?.services ? (
            <p className={styles["form-input-error"]}>
              {actionData?.errors.services}
            </p>
          ) : null}
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
        className={styles["form-submit-button"]}
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
      <div className="flex w-full flex-col items-center justify-center">
        <h1>{content.heading}</h1>
        <div className="flex w-2/3">
          <Form method="post">
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
