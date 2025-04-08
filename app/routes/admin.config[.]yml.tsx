import fs from "fs";
import path from "path";

import { isCmsEnabled } from "../content/utils";

const CMS_DEPLOYED_CONFIG_FILE = "app/content/content-config.yml";
const CMS_LOCAL_CONFIG_FILE = "app/content/local-config.yml";

export const loader = async () => {
  if (!isCmsEnabled()) {
    // Return a 404 response if the CMS is not enabled
    throw new Response("Not Found", { status: 404 });
  }

  // Load the local config for local development or the deployed config for anything else
  let filePath =
    process.env.DEPLOY_ENV === "local"
      ? CMS_LOCAL_CONFIG_FILE
      : CMS_DEPLOYED_CONFIG_FILE;
  filePath = path.resolve(filePath);
  const config = fs.readFileSync(filePath, "utf-8");

  return new Response(config, {
    headers: {
      "Content-Type": "text/yaml",
    },
  });
};
