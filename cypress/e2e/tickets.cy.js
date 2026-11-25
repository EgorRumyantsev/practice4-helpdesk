import { TicketsPage } from '../pages/TicketsPage';
import { TicketForm } from '../pages/TicketForm';

const page = new TicketsPage();
const form = new TicketForm();

describe('HelpDesk', () => {
  beforeEach(() => {
    cy.request('POST', '/api/__reset').its('body').should('deep.equal', { reset: true });
    page.open();
    page.count().should('have.text', '4');
  });

  it('E00: показывает четыре исходные заявки', () => {
    page.items().should('have.length', 4);
  });

  it('E01: создаёт заявку и показывает её номер и тему', () => {
    form.fill({ title: 'Сбой принтера', description: 'Принтер в аудитории не отвечает' });
    form.submit();
    form.message().should('have.text', 'Заявка №5 создана');
    page.ticket(5).should('contain.text', 'Сбой принтера');
    page.count().should('have.text', '5');
  });

  it('E02: объединяет поиск, статус, категорию и приоритет', () => {
    page.searchFor('VPN');
    page.setStatus('new');
    page.setCategory('network');
    page.items().should('have.length', 1).and('contain.text', 'VPN недоступен');
    page.setPriority('high');
    page.items().should('have.length', 1).and('contain.text', 'VPN недоступен');
    page.setPriority('low');
    page.count().should('have.text', '0');
    page.items().should('not.exist');
  });

  it('E03: переводит заявку в работу и завершает её', () => {
    page.changeStatus(1, 'В работу');
    page.ticket(1).should('contain.text', 'В работе');
    page.changeStatus(1, 'Завершить');
    page.ticket(1).should('contain.text', 'Завершена').find('button').should('not.exist');
  });

  it('E04: показывает символы разметки как обычный текст', () => {
    const title = '<b>Текст заявки</b>';
    const description = '<i>Текст описания</i>';
    form.fill({ title, description });
    form.submit();
    form.message().should('have.text', 'Заявка №5 создана');
    page.ticket(5).find('.ticket-title').should('have.text', title);
    page.ticket(5).find('.ticket-description').should('have.text', description);
  });
});
