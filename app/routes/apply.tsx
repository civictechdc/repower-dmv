import type { MetaFunction } from "@remix-run/node";
import React, { useState, useEffect, ChangeEvent } from "react";
import content from "../content/apply.json";
import styles from "../styles/apply.module.css";
import { SERVICES, STATES, Contractor, Service } from "../types";
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "Apply as a Contractor | re:Power DMV" },
];

// const actionData = useActionData<typeof action>();

interface ContractorBlockProps {
  contractor?: Contractor;
  setContractor: any;
}

const handleContractorOnChange = (
  props: ContractorBlockProps,
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
) => {
  const { setContractor } = props;
  setContractor((prevData: Contractor) => ({
    ...prevData,
    [e.target.name]: e.target.value,
  }));
};

const ContractorBlock = (props: ContractorBlockProps) => {
  const { contractor, setContractor } = props;
  return (
    <div>
      <div>
        <h3>Contact Information</h3>
        <div>
          <label htmlFor="name" className={styles["form-input-heading-label"]}>
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            className={styles["form-input"]}
            id="name"
            name="name"
            type="text"
            onChange={(e) => handleContractorOnChange(props, e)}
          />
        </div>
        <div>
          <label htmlFor="email" className={styles["form-input-heading-label"]}>
            Contact Email
          </label>
          <input
            className={styles["form-input"]}
            id="email"
            name="text"
            type="text"
            onChange={(e) => handleContractorOnChange(props, e)}
          />
        </div>
        <div>
          <label htmlFor="phone" className={styles["form-input-heading-label"]}>
            Contact Phone
          </label>
          <input
            className={styles["form-input"]}
            id="phone"
            name="phone"
            type="text"
            onChange={(e) => handleContractorOnChange(props, e)}
          />
        </div>
        <div>
          <label
            htmlFor="website"
            className={styles["form-input-heading-label"]}
          >
            Company Website
          </label>
          <input
            className={styles["form-input"]}
            id="website"
            name="website"
            placeholder="https://"
            type="text"
            onChange={(e) => handleContractorOnChange(props, e)}
          />
        </div>
      </div>
      <div>
        <h3>Company Address</h3>
        <div>
          <input
            className={styles["form-input"]}
            id="line1"
            name="addressLine1"
            type="text"
            onChange={(e) => handleContractorOnChange(props, e)}
          />
          <label
            htmlFor="line1"
            className={styles["form-input-description-label"]}
          >
            Street Address
          </label>
        </div>
        <div>
          <input
            className={styles["form-input"]}
            id="line2"
            name="addressLine2"
            type="text"
            onChange={(e) => handleContractorOnChange(props, e)}
          />
          <label
            htmlFor="line2"
            className={styles["form-input-description-label"]}
          >
            Address Line 2
          </label>
        </div>
        <div className="flex w-full flex-row">
          <div className="w-1/2">
            <input
              className={styles["form-input"]}
              id="city"
              name="city"
              type="text"
              onChange={(e) => handleContractorOnChange(props, e)}
            />
            <label
              htmlFor="city"
              className={styles["form-input-description-label"]}
            >
              City
            </label>
          </div>
          <div className="flex w-1/2 flex-col">
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
            <label
              htmlFor="stateSelect"
              className={styles["form-input-description-label"]}
            >
              State
            </label>
          </div>
        </div>
        <div>
          <input
            className={styles["form-input"]}
            id="zip"
            name="zip"
            type="text"
            onChange={(e) => handleContractorOnChange(props, e)}
          />
          <label
            htmlFor="zipcode"
            className={styles["form-input-description-label"]}
          >
            ZIP Code
          </label>
        </div>
      </div>
    </div>
  );
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

const ServiceBlock = (props: ContractorBlockProps) => {
  const { contractor, setContractor } = props;
  return (
    <div>
      <div>
        <h4>States Served (Check all that apply)</h4>
        <div>
          {STATES.map((item, index) => (
            <div key={index}>
              <input
                type="checkbox"
                id={`state_${item.toLowerCase()}`}
                name={item.toLocaleLowerCase()}
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
                htmlFor={`state_${item.toLowerCase()}`}
                className={styles["form-checkbox-label"]}
              >
                {item}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4>Services offered</h4>
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
        onClick={(e) => {
          console.log(contractor);
        }}
      >
        Submit
      </button>
    </div>
  );
};

export default function Application() {
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
          {/* <Form method="post" action="/submit"> */}
          <Form>
            <ContractorBlock
              contractor={contractor}
              setContractor={setContractor}
            />
            <ServiceBlock
              contractor={contractor}
              setContractor={setContractor}
            />
            <SubmitBlock
              contractor={contractor}
              setContractor={setContractor}
            />
          </Form>
        </div>
      </div>
    </main>
  );
}
