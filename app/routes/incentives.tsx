import type { MetaFunction } from "@remix-run/node";

import Heading from "~/components/heading";

import content from "../content/incentives.json";

export const meta: MetaFunction = () => [{ title: "Incentives" }];

export default function Index() {
  return (
    <div>
      <Heading>{content.heading}</Heading>
    </div>
  );
}
