// Checks if CMS should be enabled or not
export function isCmsEnabled() {
  return ["content", "local"].includes(process.env.DEPLOY_ENV ?? "");
}
