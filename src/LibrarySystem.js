import { addDays, daysBetween } from './utils/dateUtils.js';

const LOAN_PERIOD_DAYS = 14;

/**
 * Dependency injection: NotificationService (Observer) and FineStrategy
 * (Strategy) are passed in rather than constructed internally, so both can
 * be swapped or faked in tests without changing this class.
 */
export class LibrarySystem {
  constructor(notificationService, fineStrategy) {
    this.notificationService = notificationService;
    this.fineStrategy = fineStrategy;
    this.members = [];
    this.books = [];
    this.loans = []; // { member, book, issueDate, dueDate, returnDate }
  }

  addMember(member) {
    this.members.push(member);
    this.notificationService.subscribe(member);
  }

  addBook(book) {
    this.books.push(book);
  }

  issueBook(memberId, isbn, issueDate = new Date()) {
    const member = this.members.find((m) => m.id === memberId);
    const book = this.books.find((b) => b.isbn === isbn);
    if (!member) throw new Error(`Unknown member: ${memberId}`);
    if (!book) throw new Error(`Unknown book: ${isbn}`);
    if (member.borrowedBooks.length >= member.maxBooks) {
      throw new Error(`${member.name} has reached their borrowing limit`);
    }

    book.markIssued();
    member.borrowedBooks.push(book);
    const loan = {
      member,
      book,
      issueDate,
      dueDate: addDays(issueDate, LOAN_PERIOD_DAYS),
      returnDate: null,
    };
    this.loans.push(loan);
    return loan;
  }

  returnBook(memberId, isbn, returnDate = new Date()) {
    const loan = this.loans.find(
      (l) => l.member.id === memberId && l.book.isbn === isbn && !l.returnDate
    );
    if (!loan) throw new Error(`No active loan for ${memberId} / ${isbn}`);

    loan.returnDate = returnDate;
    loan.book.markReturned();
    loan.member.borrowedBooks = loan.member.borrowedBooks.filter((b) => b.isbn !== isbn);

    const daysLate = Math.max(0, daysBetween(loan.dueDate, returnDate));
    loan.fine = this.fineStrategy.calculate(daysLate);
    return loan;
  }

  markOverdue(isbn) {
    const book = this.books.find((b) => b.isbn === isbn);
    if (!book) throw new Error(`Unknown book: ${isbn}`);
    this.notificationService.notifyOverdue(book);
  }
}
