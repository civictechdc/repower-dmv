import type { MetaFunction } from "@remix-run/node";

import Heading from "~/components/heading";

import content from "../content/resources.json";

export const meta: MetaFunction = () => [{ title: "Resources" }];

export default function Index() {
  return (
    <div className="max-w-3xl m-auto">
      <Heading>{content.heading}</Heading>
      <p className="mt-10">
        Explore our collection of resources to learn more about home electrification and efficiency, understand available incentives, and find trusted service providers.
      </p>
      <p className="my-4 font-bold">
        Learning About Home Electrification and Efficiency:
      </p>
      <ul className="list-disc list-inside pl-4">
        <li>
          <a className="text-blue-500" href="https://www.rewiringamerica.org" target="_blank" rel="noreferrer">Rewiring America Electrification Guide</a>
        </li>
        <li>
          Efficiency Vermont Energy Guides
        </li>
        <li>
          Energy Star Home Energy Tips
        </li>
      </ul>
      <p className="my-4 font-bold">
        Government Incentives and Rebates:
      </p>
      <ul className="list-disc list-inside pl-4">
        <li>
          <a className="text-blue-500" href="https://www.dcseu.com" target="_blank" rel="noreferrer">DC Sustainable Energy Utility (DCSEU) Rebates</a>
        </li>
        <li>
          Maryland Energy Administration Incentives
        </li>
        <li>
          Virginia Energy Efficiency and Renewable Energy Incentives
        </li>
        <li>
          Federal Incentives for Electrification
        </li>
      </ul>
      <p className="my-4 font-bold">
        Choosing Contractors and Services:
      </p>
      <ul className="list-disc list-inside pl-4">
        <li>
          <a className="text-blue-500" href="https://www.bbb.org" target="_blank" rel="noreferrer">Better Business Bureau (BBB)</a>
        </li>
        <li>
          <a className="text-blue-500" href="https://www.angi.com" target="_blank" rel="noreferrer">Angie's List Reviews and Ratings</a>
        </li>
        <li>
          <a className="text-blue-500" href="https://www.yelp.com" target="_blank" rel="noreferrer">Yelp Contractor Reviews</a>
        </li>
      </ul>
      <p className="mt-4">
        These resources will help you make informed choices, ensuring a smooth and effective home electrification process.
      </p>
    </div>
  );
}
