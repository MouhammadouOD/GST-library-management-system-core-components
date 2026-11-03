import { Book } from './models/Book.js';
import { MemberFactory } from './factories/MemberFactory.js';
import { DailyFineStrategy } from './strategies/FineStrategy.js';
import { NotificationService } from './observers/NotificationService.js';
import { LibrarySystem } from './LibrarySystem.js';

// Composition root: wire the injected dependencies together.
const library = new LibrarySystem(new NotificationService(), new DailyFineStrategy(1));

const alice = MemberFactory.createMember('student', 's1', 'Alice');
library.addMember(alice);
library.addBook(new Book('ISBN-1', 'Clean Code', 'Robert C. Martin'));

library.issueBook('s1', 'ISBN-1');
console.log(library.books[0].status); // Issued

library.returnBook('s1', 'ISBN-1');
console.log(library.books[0].status); // Available
