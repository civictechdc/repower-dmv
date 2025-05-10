import type { MetaFunction } from "@remix-run/node";

import Heading from "~/components/heading";

import content from "../content/home.json";

export const meta: MetaFunction = () => [{ title: "Home" }];

export default function Index() {
  return (
    <div className="m-auto max-w-3xl">
      <Heading>{content.heading}</Heading>
      <p className="mb-4 mt-10">
        The Electrify DMV platform is a project developed collaboratively by
        Electrify DC and Civic Tech DC, designed to accelerate residential
        electrification in the Washington, DC metropolitan region. Our goal is
        to connect homeowners with qualified contractors specializing in home
        decarbonization, provide centralized access to financial incentives, and
        offer resources for homeowners, renters and home renovation
        professionals to learn about how to improve the health, comfort, energy
        efficiency of homes while reducing emissions.
      </p>
      <p className="my-4">
        Residential buildings account for up to 25% of final greenhouse gas
        emissions in the DMV region. By switching to efficient, electric
        appliances, homeowners can significantly reduce the region&lsquo;s
        carbon footprint while also making their homes healthier and safer for
        occupants by eliminating combustion emissions.
      </p>
      <h2 className="my-4 font-bold">Contractor List</h2>
      <p className="my-4">
        Our regional contractor list helps homeowners find reliable,
        knowledgeable contractors committed to sustainability and energy
        efficiency. We provide information about businesses licenses and
        certifications, what services they provide, where in the DMV they work,
        and their ratings from Google.
      </p>
      <h2 className="my-4 font-bold">Incentives</h2>
      <p className="m4-4">
        Our incentives page aggregates updated local, regional and federal
        government incentives to reduce the cost of decarbonizing homes by
        installing heat pumps, heat pump water heaters, heat pump dryers,
        induction stoves, electrical panels, EV chargers, insulation, solar
        arrays, etc.
      </p>
      <h2 className="my-4 font-bold">Resources</h2>
      <p className="m4-4">
        Our resources page links to essential guidance on how to navigate your
        decarbonization journey, including in-person and virtual learning
        opportunities. It can be difficult to know where to start, what’s most
        impactful and cost-effective, and how to pick businesses to complete
        your projects.
      </p>
      <p className="m4-4">
        By bridging the gap between consumers and trusted contractors, providing
        easy access to incentives, and allowing access to training and self
        paced learning, the Electrify DMV platform is paving the way for greater
        adoption of clean energy solutions, helping residents across the region
        reduce their carbon footprint and create healthier, more efficient
        homes.
      </p>
      <p className="m4-4">
        The Electrify DMV platform is proudly powered by the combined efforts
        and expertise of Electrify DC and Civic Tech DC, leveraging technology
        and community collaboration to build a sustainable future for the DC
        metropolitan area.
      </p>
    </div>
  );
}
