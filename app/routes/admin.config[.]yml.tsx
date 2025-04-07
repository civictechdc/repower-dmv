import fs from "fs";
import path from "path";

const CMS_CONFIG_FILE = "app/content/config.yml";

export const loader = async () => {
  // if (!isCmsEnabled()) {
  //   // Return a 404 response if the CMS is not enabled
  //   throw new Response("Not Found", { status: 404 });
  // }

  const filePath = path.resolve(CMS_CONFIG_FILE);
  const config = fs.readFileSync(filePath, "utf-8");

  return new Response(config, {
    headers: {
      "Content-Type": "text/yaml",
    },
  });
};
