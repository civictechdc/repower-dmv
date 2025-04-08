import fs from "fs";
import path from "path";

import { isCmsEnabled } from "../content/utils";

const COMMON_CONFIG_FILE = "app/content/config.yml";
const CONTENT_ENV_BACKEND_CONFIG_FILE = "app/content/content-backend.yml";
const LOCAL_ENV_BACKEND_CONFIG_FILE = "app/content/local-backend.yml";

export const loader = async () => {
  if (!isCmsEnabled()) {
    // Return a 404 response if the CMS is not enabled
    throw new Response("Not Found", { status: 404 });
  }

  // Load the local config for local development or the deployed config for anything else
  let backendConfigFilePath =
    process.env.DEPLOY_ENV === "local"
      ? LOCAL_ENV_BACKEND_CONFIG_FILE
      : CONTENT_ENV_BACKEND_CONFIG_FILE;
  backendConfigFilePath = path.resolve(backendConfigFilePath);
  const backendConfig = fs.readFileSync(backendConfigFilePath, "utf-8");

  const commonConfigFilePath = path.resolve(COMMON_CONFIG_FILE);
  const commonConfig = fs.readFileSync(commonConfigFilePath, "utf-8");

  const fullConfig = [backendConfig, commonConfig].join("\n");

  return new Response(fullConfig, {
    headers: {
      "Content-Type": "text/yaml",
    },
  });
};
