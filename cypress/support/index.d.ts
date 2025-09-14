// cypress/support/index.d.ts
/// <reference types="cypress" />

import "@clerk/testing/cypress";

declare global {
  namespace Cypress {
    interface Chainable {
      clerkSignIn(params: {
        identifier: string;
        password: string;
        strategy: "password";
      }): Chainable<void>;
    }
  }
}
