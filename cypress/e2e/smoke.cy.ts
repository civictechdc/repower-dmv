import { faker } from "@faker-js/faker";
import {STATES, CERTIFICATIONS, SERVICES} from "~/types";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it.skip("should allow you to register and login", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    };

    cy.then(() => ({ email: loginForm.email })).as("user");

    cy.visitAndCheck("/");

    cy.findByRole("link", { name: /sign up/i }).click();

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();

    cy.findByRole("link", { name: /notes/i }).click();
    cy.findByRole("button", { name: /logout/i }).click();
    cy.findByRole("link", { name: /log in/i });
  });

  it.skip("should allow you to make a note", () => {
    const testNote = {
      title: faker.lorem.words(1),
      body: faker.lorem.sentences(1),
    };
    cy.login();

    cy.visitAndCheck("/");

    cy.findByRole("link", { name: /notes/i }).click();
    cy.findByText("No notes yet");

    cy.findByRole("link", { name: /\+ new note/i }).click();

    cy.findByRole("textbox", { name: /title/i }).type(testNote.title);
    cy.findByRole("textbox", { name: /body/i }).type(testNote.body);
    cy.findByRole("button", { name: /save/i }).click();

    cy.findByRole("button", { name: /delete/i }).click();

    cy.findByText("No notes yet");
  });

  it.skip("should allow contractors to request to be listed", () => {
    const testContractor = {
      name: faker.company.name(),
      email: faker.internet.email(),
      phone: faker.phone.number({style: 'national'}),
      website: faker.internet.url(),
      addressLine1: faker.location.streetAddress(),
      city: faker.location.city(),
      state: STATES[Math.floor(Math.random() * STATES.length)],
      zip: faker.location.zipCode(),
      statesServed: [STATES[0], STATES[1]],
      services: [SERVICES[0], SERVICES[1]],
      certifications: [CERTIFICATIONS[0], CERTIFICATIONS[1]]
    };
    cy.visitAndCheck("/apply");
    cy.get("#name").type(testContractor.name);
    cy.get("#email").type(testContractor.email);
    cy.get("#phone").type(testContractor.phone);
    cy.get("#website").type(testContractor.website);
    cy.get("#addressLine1").type(testContractor.addressLine1);
    cy.get("#city").type(testContractor.city);
    cy.get("#zip").type(testContractor.zip);
    cy.get("#stateSelect").select(testContractor.state);
    cy.get("#state_served_0").check();
    cy.get("#state_served_1").check();
    cy.get("#service_0").check();
    cy.get("#service_1").check();
    cy.get("#certification_0").check();
    cy.get("#certification_1").check();
  });

});

