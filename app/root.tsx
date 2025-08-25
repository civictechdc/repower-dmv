import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";

import Footer from "~/components/footer";
import Navbar from "~/components/nav";
import { getUser } from "~/session.server";
import stylesheet from "~/tailwind.css";


export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css", integrity: "sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==", crossOrigin: "anonymous", referrerPolicy: "no-referrer" },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ user: await getUser(request) });
};

export default function App() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const hideNav = ["true", "1"].includes((params.get("hideNav") || "").toLowerCase()); return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {!hideNav ?
          <>
            <Navbar />
            <main className="relative min-h-screen bg-white p-4 md:p-8 mt-[160px] md:mt-[144px]">
              <Outlet />
            </main>
            <Footer />
          </> : <>
            <main className="relative min-h-screen bg-white p-4 md:p-8">
              <Outlet />
            </main>
          </>}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
