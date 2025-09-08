import { isCmsEnabled } from "../content/utils";
import { Link } from "@remix-run/react";

// Loads a CMS admin page from CDN. This will require authentication through github for a user to proceed.
const CMS_HTML = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Content Manager</title>
  </head>
  <body>
    <!-- Include the script that builds the page and powers Decap CMS -->
    <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  </body>
</html>
`;

export const loader = async () => {
  if (!isCmsEnabled()) {
    // Return a 404 response if the CMS is not enabled
    throw new Response("Not Found", { status: 404 });
  }

  // Return the HTML content
  return new Response(CMS_HTML, {
    headers: {
      "Content-Type": "text/html",
    },
  });
};

export default function AdminIndex() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Admin</h1>
      <ul className="list-disc pl-6">
        <li><Link to="/admin/contractors" className="text-blue-600 underline">Contractors</Link></li>
        <li><Link to="/admin/data/certifications" className="text-blue-600 underline">Certifications</Link></li>
        <li><Link to="/admin/data/services" className="text-blue-600 underline">Services</Link></li>
        <li><Link to="/admin/data/states" className="text-blue-600 underline">States</Link></li>
      </ul>
    </div>
  );
}
