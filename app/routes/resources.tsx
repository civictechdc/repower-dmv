import type { MetaFunction } from "@remix-run/node";
import Heading from "~/components/heading";

export const meta: MetaFunction = () => [{ title: "Resources" }];

export default function Index() {
  return (
    <div>
      <Heading title="Resources" />
    </div>
  );
}
