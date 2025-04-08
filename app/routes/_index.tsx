import type { MetaFunction } from "@remix-run/node";

import Heading from "~/components/heading";

import content from "../content/home.json";

export const meta: MetaFunction = () => [{ title: "Home" }];

export default function Index() {
  return (
    <div>
      <Heading>{content.heading}</Heading>
    </div>
  );
}
