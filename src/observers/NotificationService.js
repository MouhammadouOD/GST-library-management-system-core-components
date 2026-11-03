/**
 * Observer pattern: members subscribe, and are notified only when a book
 * they actually hold goes overdue. No direct coupling between LibrarySystem
 * and a specific member.
 */
export class NotificationService {
  constructor() {
    this.subscribers = new Set();
  }

  subscribe(member) {
    this.subscribers.add(member);
  }

  unsubscribe(member) {
    this.subscribers.delete(member);
  }

  notifyOverdue(book) {
    for (const member of this.subscribers) {
      const isBorrower = member.borrowedBooks.some((b) => b.isbn === book.isbn);
      if (isBorrower) {
        member.notify(`"${book.title}" is overdue`);
      }
    }
  }
}
