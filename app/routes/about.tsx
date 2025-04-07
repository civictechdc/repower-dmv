import type { MetaFunction } from "@remix-run/node";

import Heading from "~/components/heading";

import content from "../content/about.json";

export const meta: MetaFunction = () => [{ title: "About" }];

export default function Index() {
  return (
    <div>
      <Heading>{content.heading}</Heading>
    </div>
  );
}
