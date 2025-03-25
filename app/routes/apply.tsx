import type { MetaFunction } from "@remix-run/node";

import content from "../content/apply.json";
import styles from "../styles/apply.module.css";
import { SERVICES, STATES } from "../types";
import { Form } from "@remix-run/react";

export const meta: MetaFunction = () => [
  { title: "Apply as a Contractor | re:Power DMV" },
];

interface StateCheckboxProps {
  idPrefix: string;
}

const StateCheckboxes = (props: StateCheckboxProps) => {
  const { idPrefix } = props;
  return (
    <div>
      {STATES.map((item, index) => (
        <div key={index}>
          <input
            type="checkbox"
            id={`${idPrefix}_${item.toLocaleLowerCase()}`}
            className={styles["form-checkbox-input"]}
            name={item.toLocaleLowerCase()}
            value={item}
          />
          <label
            htmlFor={`${idPrefix}_${item.toLocaleLowerCase()}`}
            className={styles["form-checkbox-label"]}
          >
            {item}
          </label>
        </div>
      ))}
    </div>
  );
};

const ContactInfoBlock = () => {
  return (
    <div>
      <h3>Contact Information</h3>
      <div>
        <label htmlFor="name" className={styles["form-input-label"]}>
          Company Name
        </label>
        <input className={styles["form-input"]} id="name" type="text"></input>
      </div>
      <div>
        <label htmlFor="website" className={styles["form-input-label"]}>
          Company Website
        </label>
        <input
          className={styles["form-input"]}
          id="website"
          placeholder="https://"
          type="text"
        ></input>
      </div>
      <div>
        <label htmlFor="email" className={styles["form-input-label"]}>
          Contact Email
        </label>
        <input className={styles["form-input"]} id="email" type="text"></input>
      </div>
      <div>
        <label htmlFor="phone" className={styles["form-input-label"]}>
          Contact Phone
        </label>
        <input className={styles["form-input"]} id="phone" type="text"></input>
      </div>
    </div>
  );
};

const StateInfoBlock = () => {
  return (
    <div>
      <div>
        <h4>States Served (Check all that apply)</h4>
        <StateCheckboxes idPrefix="state_served" />
      </div>
      <div>
        <h4>States they are licensed for (Check all that apply)</h4>
        <StateCheckboxes idPrefix="state_licensed" />
      </div>
    </div>
  );
};

const ServiceInfoBlock = () => {
  return (
    <div>
      <h4>Services offered</h4>
      <div>
        {SERVICES.map((item, index) => (
          <div key={index}>
            <input
              type="checkbox"
              id={item.toLocaleLowerCase().replace(/ /g, "_")}
              name={item.toLocaleLowerCase().replace(/ /g, "_")}
              value={item}
            />
            <label
              htmlFor={item.toLocaleLowerCase().replace(/ /g, "_")}
              className={styles["form-checkbox-label"]}
            >
              {item}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

const SubmitBlock = () => {
  return (
    <div>
      <button type="submit" className={styles["form-submit-button"]}>
        Submit
      </button>
    </div>
  );
};

export default function Application() {
  return (
    <main className="min-h screen relative">
      <div className="flex w-full flex-col items-center justify-center">
        <h1>{content.heading}</h1>
        <div className="flex w-2/3">
          <Form method="post">
            <ContactInfoBlock />
            <StateInfoBlock />
            <ServiceInfoBlock />
            <SubmitBlock />
          </Form>
        </div>
      </div>
    </main>
  );
}
