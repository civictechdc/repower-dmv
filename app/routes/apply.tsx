import type { MetaFunction } from "@remix-run/node";
import React, { useState, useEffect, ChangeEvent } from "react";
import content from "../content/apply.json";
import styles from "../styles/apply.module.css";
import { SERVICES, STATES, Contractor, Address } from "../types";
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "Apply as a Contractor | re:Power DMV" },
];

interface StateCheckboxProps {
  idPrefix: string;
}

// const actionData = useActionData<typeof action>();

// TODO: Use Address and Contractor from types
interface ContractorInfo {
  name: string;
  address: Address;
  website?: string;
  email?: string;
  phoneNumber: string;
}

interface AddressBlockProps {
  setAddress: any;
}

interface ContractorInfoBlockProps {
  setContractorInfo: any;
}

const AddressBlock = (props: AddressBlockProps) => {
  const { setAddress } = props;

  return (
    <div>
      <label className={styles["form-input-heading-label"]}>
        Company Address
      </label>
      <div>
        <input
          className={styles["form-input"]}
          id="line1"
          type="text"
          onChange={(e) => {
            setAddress((prevData: Address) => ({
              ...prevData,
              line1: e.target.value,
            }));
          }}
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
          type="text"
          onChange={(e) => {
            setAddress((prevData: Address) => ({
              ...prevData,
              line2: e.target.value,
            }));
          }}
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
            type="text"
            onChange={(e) => {
              setAddress((prevData: Address) => ({
                ...prevData,
                city: e.target.value,
              }));
            }}
          />
          <label
            htmlFor="city"
            className={styles["form-input-description-label"]}
          >
            City
          </label>
        </div>
        <div className="flex w-1/2 flex-col">
          <select name="stateSelect" id="stateSelect">
            {STATES.map((item, index) => (
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
          id="zipcode"
          type="text"
          onChange={(e) => {
            setAddress((prevData: Address) => ({
              ...prevData,
              zipcode: e.target.value,
            }));
          }}
        />
        <label
          htmlFor="zipcode"
          className={styles["form-input-description-label"]}
        >
          ZIP Code
        </label>
      </div>
    </div>
  );
};

const ContractorInfoBlock = (props: ContractorInfoBlockProps) => {
  const { setContractorInfo } = props;
  return (
    <div>
      <h3>Contact Information</h3>
      <div>
        <label htmlFor="name" className={styles["form-input-heading-label"]}>
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          className={styles["form-input"]}
          id="name"
          type="text"
          onChange={(e) => {
            setContractorInfo((prevData: ContractorInfo) => ({
              ...prevData,
              name: e.target.value,
            }));
          }}
        />
      </div>
      <div>
        <label htmlFor="email" className={styles["form-input-heading-label"]}>
          Contact Email
        </label>
        <input
          className={styles["form-input"]}
          id="email"
          type="text"
          onChange={(e) => {
            setContractorInfo((prevData: ContractorInfo) => ({
              ...prevData,
              email: e.target.value,
            }));
          }}
        />
      </div>
      <div>
        <label htmlFor="phone" className={styles["form-input-heading-label"]}>
          Contact Phone
        </label>
        <input
          className={styles["form-input"]}
          id="phone"
          type="text"
          onChange={(e) => {
            setContractorInfo((prevData: ContractorInfo) => ({
              ...prevData,
              phoneNumber: e.target.value,
            }));
          }}
        />
      </div>
      <div>
        <label htmlFor="website" className={styles["form-input-heading-label"]}>
          Company Website
        </label>
        <input
          className={styles["form-input"]}
          id="website"
          placeholder="https://"
          type="text"
          onChange={(e) => {
            setContractorInfo((prevData: ContractorInfo) => ({
              ...prevData,
              website: e.target.value,
            }));
          }}
        ></input>
      </div>
    </div>
  );
};

export default function Application() {
  const [contractorInfo, setContractorInfo] = useState<ContractorInfo>();
  const [address, setAddress] = useState<Address>();

  // const StateCheckboxes = (props: StateCheckboxProps) => {
  //   const { idPrefix } = props;
  //   return (
  //     <div>
  //       {STATES.map((item, index) => (
  //         <div key={index}>
  //           <input
  //             type="checkbox"
  //             id={`${idPrefix}_${item.toLowerCase()}`}
  //             className={styles["form-checkbox-input"]}
  //             name={item.toLocaleLowerCase()}
  //             value={item}
  //           />
  //           <label
  //             htmlFor={`${idPrefix}_${item.toLowerCase()}`}
  //             className={styles["form-checkbox-label"]}
  //           >
  //             {item}
  //           </label>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // };

  // const StateInfoBlock = () => {
  //   return (
  //     <div>
  //       <div>
  //         <h4>States Served (Check all that apply)</h4>
  //         <StateCheckboxes idPrefix="state_served" />
  //       </div>
  //       <div>
  //         <h4>States they are licensed for (Check all that apply)</h4>
  //         <StateCheckboxes idPrefix="state_licensed" />
  //       </div>
  //     </div>
  //   );
  // };

  // const ServiceInfoBlock = () => {
  //   return (
  //     <div>
  //       <h4>Services offered</h4>
  //       <div>
  //         {SERVICES.map((item, index) => (
  //           <div key={index}>
  //             <input
  //               type="checkbox"
  //               id={item.toLowerCase().replace(/ /g, "_")}
  //               name={item.toLocaleLowerCase().replace(/ /g, "_")}
  //               value={item}
  //             />
  //             <label
  //               htmlFor={item.toLowerCase().replace(/ /g, "_")}
  //               className={styles["form-checkbox-label"]}
  //             >
  //               {item}
  //             </label>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  const SubmitBlock = () => {
    return (
      <div>
        <button
          type="submit"
          className={styles["form-submit-button"]}
          onClick={(e) => {
            console.log(contractorInfo);
          }}
        >
          Submit
        </button>
      </div>
    );
  };

  return (
    <main className="min-h screen relative">
      <div className="flex w-full flex-col items-center justify-center">
        <h1>{content.heading}</h1>
        <div className="flex w-2/3">
          {/* <Form method="post" action="/submit"> */}
          <Form>
            <ContractorInfoBlock setContractorInfo={setContractorInfo} />
            <AddressBlock setAddress={setAddress} />
            {/* <StateInfoBlock />
            <ServiceInfoBlock /> */}
            <SubmitBlock />
          </Form>
        </div>
      </div>
    </main>
  );
}

// export async function action({ request }: ActionFunctionArgs) {
//   const formData = await request.formData();
//   console.log(formData);
//   // const email = String(formData.get("email"));
//   // const password = String(formData.get("password"));

//   // const errors = {};

//   // if (!email.includes("@")) {
//   //   errors.email = "Invalid email address";
//   // }

//   // if (password.length < 12) {
//   //   errors.password = "Password should be at least 12 characters";
//   // }

//   // if (Object.keys(errors).length > 0) {
//   //   return json({ errors });
//   // }

//   // Redirect to dashboard if validation is successful
//   // return redirect("/");
//   return null;
// }
