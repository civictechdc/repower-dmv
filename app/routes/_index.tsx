import type { MetaFunction } from "@remix-run/node";

import Heading from "~/components/heading";

export const meta: MetaFunction = () => [{ title: "Home" }];

export default function Index() {
  return (
    <div>
      <Heading title="Home" />
    </div>
  );
}
