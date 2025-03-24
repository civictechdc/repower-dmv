import type { MetaFunction } from "@remix-run/node";

import content from "../content/apply.json";
import { SERVICES, STATES } from "../types";

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
            name={item.toLocaleLowerCase()}
            value={item}
          />
          <label htmlFor={`${idPrefix}_${item.toLocaleLowerCase()}`}>
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
        <label htmlFor="name">Company Name</label>
        <input className="w-full border" id="name" type="text"></input>
      </div>
      <div>
        <label htmlFor="website">Company Website</label>
        <input className="w-full border" id="website" type="text"></input>
      </div>
      <div>
        <label htmlFor="email">Contact Email</label>
        <input className="w-full border" id="email" type="text"></input>
      </div>
      <div>
        <label htmlFor="phone">Contact Phone</label>
        <input className="w-full border" id="phone" type="text"></input>
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
            <label htmlFor={item.toLocaleLowerCase().replace(/ /g, "_")}>
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
      <button type="button">Submit</button>
    </div>
  );
};

export default function Application() {
  return (
    <main className="min-h screen relative">
      <h1>{content.heading}</h1>
      <div>
        <form>
          <ContactInfoBlock />
          <StateInfoBlock />
          <ServiceInfoBlock />
          <SubmitBlock />
        </form>
      </div>
    </main>
  );
}
