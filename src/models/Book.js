export class Book {
  constructor(isbn, title, author) {
    this.isbn = isbn;
    this.title = title;
    this.author = author;
    this.status = 'Available';
  }

  markIssued() {
    if (this.status !== 'Available') {
      throw new Error(`Cannot issue a book with status "${this.status}"`);
    }
    this.status = 'Issued';
  }

  markReturned() {
    if (this.status !== 'Issued') {
      throw new Error(`Cannot return a book with status "${this.status}"`);
    }
    this.status = 'Available';
  }
}
