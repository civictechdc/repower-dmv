import type { MetaFunction } from "@remix-run/node";

import Heading from "~/components/heading";

import content from "../content/incentives.json";

export const meta: MetaFunction = () => [{ title: "Incentives" }];

export default function Index() {
  return (
    <div className="max-w-3xl m-auto">
      <Heading>{content.heading}</Heading>
      <p className="mt-10">
        Making electrification and efficiency upgrades to your home can be more affordable by taking advantage of federal, state, and local incentive programs. Be sure to research what incentives you’re eligible to make the most of them.
      </p>
      <p className="my-4 font-bold">
        District of Columbia (DC) Incentives:
      </p>
      <ul className="list-disc list-inside pl-4">
        <li>
          <a className="text-blue-500" href="https://www.dcseu.com/residential-rebates" target="_blank" rel="noreferrer">DCSEU Rebates</a>
        </li>
        <li>
          <a className="text-blue-500" href="https://www.dcseu.com/affordable-home-electrification" target="_blank" rel="noreferrer">Affordable Home Electrification Program</a>
        </li>
      </ul>
      <p className="my-4 font-bold">
        Maryland Incentives:
      </p>
      <ul className="list-disc list-inside pl-4">
        <li>
          <a className="text-blue-500" href="https://energy.maryland.gov/Pages/IRArebates.aspx" target="_blank" rel="noreferrer">Home Electrification and Appliance Rebates</a>
        </li>
        <li>
          <a className="text-blue-500" href="https://www.psc.state.md.us/electricity/empower-maryland" target="_blank" rel="noreferrer">EmPOWER Maryland Program</a>
        </li>
      </ul>
      <p className="my-4 font-bold">
      Virginia Incentives:
      </p>
      <ul className="list-disc list-inside pl-4">
        <li>
          <a className="text-blue-500" href="https://www.energy.virginia.gov/energy-efficiency/HomeEnergyRebatesFrequentlyAskedQuestions.shtml" target="_blank" rel="noreferrer">Home Energy Rebates</a>
        </li>
        <li>
          <a className="text-blue-500" href="https://www.dominionenergy.com/virginia/save-energy/my-home" target="_blank" rel="noreferrer">Dominion Energy Rebates</a>
        </li>
      </ul>
      <p className="my-4 font-bold">
        Federal Incentives:
      </p>
      <ul className="list-disc list-inside pl-4">
        <li>
          <a className="text-blue-500" href="https://www.irs.gov/credits-deductions/energy-efficient-home-improvement-credit" target="_blank" rel="noreferrer">Energy Efficient Home Improvement Credit</a>
        </li>
        <li>
          <a className="text-blue-500" href="https://www.energysage.com/solar/solar-tax-credit-explained" target="_blank" rel="noreferrer">Residential Clean Energy Credit</a>
        </li>
      </ul>
      <p className="my-4 font-bold">
        How to Use Incentives:
      </p>
      <p className="mt-4">
        To effectively leverage these incentives:
      </p>
      <ol className="mt-4 list-decimal pl-10">
        <li>
          <span className="font-bold">Research and Planning:</span> Investigate eligible products, services, and contractors to understand which incentives apply.
        </li>
        <li>
          <span className="font-bold">Choosing a Product or Service:</span> Select qualified products or services that meet incentive program requirements.
        </li>
        <li>
          <span className="font-bold">Purchasing:</span> Purchase and install the eligible equipment or service through a qualified contractor.
        </li>
        <li>
          <span className="font-bold">Documentation:</span> Keep detailed records of purchases, installation dates, and contractor information.
        </li>
        <li>
          <span className="font-bold">Claiming Incentives:</span> Submit rebate applications to the appropriate regional or utility incentive programs. For federal tax credits, claim them when filing your annual taxes, ensuring to include all required documentation and forms.
        </li>
      </ol>
      <p className="mt-4">
        Following these steps ensures you maximize available incentives and rebates, significantly reducing the overall cost of your home&apos;s electrification upgrades.
      </p>
    </div>
  );
}
