import type { MetaFunction } from "@remix-run/node";

import Heading from "~/components/heading";

export const meta: MetaFunction = () => [{ title: "Incentives" }];

export default function Index() {
  return (
    <div>
      <Heading>Incentives</Heading>
    </div>
  );
}
