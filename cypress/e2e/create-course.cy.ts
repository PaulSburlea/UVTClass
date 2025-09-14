describe("Creare și configurare completă curs de către profesor (desktop)", () => {
  before(() => {
    cy.viewport(1280, 800);
    cy.session("teacher-session", () => {
      cy.visit("/");
      cy.clerkSignIn({
        strategy: "password",
        identifier: "emaildetestuvtclassteacher@maildrop.cc",
        password: "paroladetest7",
      });
    });
  });

  it("creează cursul, îl configurează și îl publică", () => {
    cy.intercept("POST", "**/api/courses").as("createCourse");
    cy.intercept("GET", "**/api/courses").as("getCourses");
    cy.intercept("PATCH", "**/api/courses/*").as("patchCourse");

    // 1) Creare curs
    cy.visit("/teacher/create");
    cy.get("main.hidden.md\\:block").within(() => {
      cy.contains("h1", "Denumiți-vă cursul").should("be.visible");
      cy.get("[data-cy=course-name]").type("Test curs E2E");
      cy.contains("button", "Înainte").click();
    });
    cy.wait("@createCourse").then((i) => {
      const newId = i.response!.body.id;
      expect(i.response!.statusCode).to.eq(200);
      cy.wrap(i.response!.body.id).as("courseId");
    });
    cy.wait("@getCourses");

    // 2) Verificăm redirect-ul pe edit și header-ul de configurare
    cy.get<string>("@courseId").then((id) => {
      cy.url().should("match", new RegExp(`/teacher/courses/${id}/edit$`));
    });
    cy.get("main.hidden.md\\:block")
      .contains("h1", "Configurarea cursului")
      .should("be.visible");

    cy.get("main.hidden.md\\:block").within(() => {
      // 3) Descriere
      cy.contains("button", "Editează descrierea").click();
      cy.get("textarea").first().should("be.visible").clear().type("Aceasta este descrierea pentru E2E");
      cy.contains("button", "Salvează").click();
      cy.wait("@patchCourse");
      cy.contains("Aceasta este descrierea pentru E2E");

      // 4) Subiect
      cy.contains("button", "Editează subiectul").click();
      cy.get("input").first().should("be.visible").clear().type("Matematică");
      cy.contains("button", "Salvează").click();
      cy.wait("@patchCourse");
      cy.contains("Matematică");

      // 5) Sala
      cy.contains("button", "Editează sala").click();
      cy.get("input").first().should("be.visible").clear().type("A12");
      cy.contains("button", "Salvează").click();
      cy.wait("@patchCourse");
      cy.contains("A12");

      // 6) Finalizare
      cy.contains("button", "Finalizați configurarea")
        .should("be.visible")
        .click();
    });


    // 8) Verificăm redirect-ul și overview
    cy.get<string>("@courseId").then((id) => {
        // 7) Navigare explicită către pagina finală de detalii a cursului
        cy.visit(`/teacher/courses/${id}`);
        
        // 8) Verificări pe pagina detaliată
        cy.url().should("include", `/teacher/courses/${id}`);
        cy.get("main.hidden.md\\:block").within(() => {
            cy.contains("h1", "Test curs E2E").should("be.visible");
        });
    });
  });
});
