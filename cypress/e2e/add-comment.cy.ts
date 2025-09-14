describe("Comentariu nou la un post (desktop)", () => {
  const courseId = "f791b6dd-7a57-4254-bc67-c4d78c2abb53";
  const postId   = "d872ea39-7e38-4fd1-8e0e-541fbeddef13";
  const postUrl  = `/teacher/courses/${courseId}/details/${postId}`;

  before(() => {
    cy.viewport(1280, 800);
    cy.session("teacher-session", () => {
      cy.visit("/");
      cy.clerkSignIn({
        strategy:   "password",
        identifier: "emaildetestuvtclassteacher@maildrop.cc",
        password:   "paroladetest7",
      });
    });
  });

  it("adaugă un comentariu și îl afișează în listă", () => {
    cy.intercept("POST", "**/api/comments").as("postComment");
    cy.intercept("GET", "**/api/comments**").as("getComments");

    cy.visit(postUrl);

    cy.wait("@getComments");

    cy.get("main.hidden.md\\:block").within(() => {
      cy.contains("h3", "Comentarii la curs").should("be.visible");

      // completează și trimite comentariul
      cy.get('textarea[placeholder="Adaugă un comentariu..."]')
        .should("be.visible")
        .type("Acesta este un comentariu de test E2E");

      cy.get("button[type=button]").last().click();

      // așteaptă POST + refresh
      cy.wait("@postComment").its("response.statusCode").should("eq", 200);
      cy.wait("@getComments");

      // verifică prezența comentariului
      cy.contains("Acesta este un comentariu de test E2E").should("be.visible");
    });
  });
});
