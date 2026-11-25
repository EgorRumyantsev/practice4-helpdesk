export class TicketsPage {
  open() { cy.visit('/'); }
  items() { return cy.get('[data-testid="ticket-item"]'); }
  count() { return cy.get('[data-testid="ticket-count"]'); }
  searchFor(text) { cy.get('[data-testid="search"]').clear().type(text); }
  setStatus(status) { cy.get('[data-testid="status-filter"]').select(status); }
  setCategory(category) { cy.get('[data-testid="category-filter"]').select(category); }
  setPriority(priority) { cy.get('[data-testid="priority-filter"]').select(priority); }
  ticket(id) { return this.items().filter('[data-id="' + id + '"]'); }
  changeStatus(id, label) { this.ticket(id).contains('button', label).click(); }
}
