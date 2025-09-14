describe('Înscriere la un curs', () => {
  before(() => {
    cy.visit('/');
    cy.clerkSignIn({
      strategy: 'password',
      identifier: 'emaildetestuvtclass@maildrop.cc',
      password: 'paroladetest7',
    });
  });

  it('Studentul se poate înscrie la un curs', () => {
    cy.visit('/student');

    cy.get('button[aria-label="Adaugă curs"]').click();
    cy.contains('Înscrie-te la un curs').click();

    cy.url().should('include', '/enroll-course');

    cy.get('input[placeholder="Codul cursului"]').type('kx9qbb3');
    cy.contains('Înscrie-mă').click();

    cy.url().should('eq', 'http://localhost:3000/student');
    cy.contains('Programare Web').should('be.visible');
  });
});
