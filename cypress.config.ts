import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents: (on, config) => {
      console.log("1111111111111111111111");
      const isDev = config.watchForFileChanges;
      console.log("2222222222222222222222");
      const port = process.env.PORT ?? (isDev ? "3000" : "8811");
      console.log("3333333333333333333333");
      const configOverrides: Partial<Cypress.PluginConfigOptions> = {
        baseUrl: `http://localhost:${port}`,
        screenshotOnRunFailure: !process.env.CI,
      };
      console.log("44444444444444444444444");

      // To use this:
      // cy.task('log', whateverYouWantInTheTerminal)
      on("task", {
        log: (message) => {
          console.log(message);

          return null;
        },
      });

      return { ...config, ...configOverrides };
    },
  },
});
