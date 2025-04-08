import { isCmsEnabled } from "../content/utils";

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
