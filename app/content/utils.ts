// Define a function to check if the CMS is enabled
export function isCmsEnabled() {
  // You can replace this with your actual logic to determine if the CMS is enabled
  console.log("deploy env: " + process.env.DEPLOY_ENV);
  return ["content", "local"].includes(process.env.DEPLOY_ENV ?? "");
}
