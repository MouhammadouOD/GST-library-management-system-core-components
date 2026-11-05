import assert from 'assert';
import { Book } from './src/models/Book.js';
import { Member, Student, Teacher } from './src/models/Member.js';
import { MemberFactory } from './src/factories/MemberFactory.js';
import { DailyFineStrategy, FlatFineStrategy } from './src/strategies/FineStrategy.js';
import { NotificationService } from './src/observers/NotificationService.js';
import { LibrarySystem } from './src/LibrarySystem.js';

const TOTAL_TESTS = 10;
let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`  ok - ${name}`);
}

console.log('Member / Factory');
{
  test('Member est abstraite : instanciation directe lève une erreur', () => {
    assert.throws(() => new Member('m1', 'Alice'), TypeError);
  });

  test('MemberFactory crée le bon sous-type selon le paramètre', () => {
    const student = MemberFactory.createMember('student', 's1', 'Alice');
    const teacher = MemberFactory.createMember('teacher', 't1', 'Bob');
    assert.ok(student instanceof Student);
    assert.ok(teacher instanceof Teacher);
    assert.strictEqual(student.maxBooks, 3);
    assert.strictEqual(teacher.maxBooks, 10);
  });
}

console.log('Book');
{
  test('markIssued() / markReturned() suivent bien Available -> Issued -> Available', () => {
    const book = new Book('ISBN-1', 'Clean Code', 'Robert C. Martin');
    assert.strictEqual(book.status, 'Available');
    book.markIssued();
    assert.strictEqual(book.status, 'Issued');
    assert.throws(() => book.markIssued());
    book.markReturned();
    assert.strictEqual(book.status, 'Available');
  });
}

console.log('FineStrategy (Strategy)');
{
  test('DailyFineStrategy et FlatFineStrategy donnent des résultats différents pour le même retard', () => {
    const daily = new DailyFineStrategy(2);
    const flat = new FlatFineStrategy(5);
    assert.strictEqual(daily.calculate(3), 6);
    assert.strictEqual(flat.calculate(3), 5);
    assert.strictEqual(daily.calculate(0), 0);
    assert.strictEqual(flat.calculate(0), 0);
  });
}

console.log('NotificationService (Observer)');
{
  test('notifyOverdue ne notifie que les membres qui ont réellement ce livre', () => {
    const notificationService = new NotificationService();
    const alice = MemberFactory.createMember('student', 's1', 'Alice');
    const bob = MemberFactory.createMember('student', 's2', 'Bob');
    const book = new Book('ISBN-1', 'Clean Code', 'Robert C. Martin');
    alice.borrowedBooks.push(book);
    notificationService.subscribe(alice);
    notificationService.subscribe(bob);

    notificationService.notifyOverdue(book);

    assert.ok(alice.lastNotification && alice.lastNotification.includes('Clean Code'));
    assert.strictEqual(bob.lastNotification, undefined);
  });
}

console.log('LibrarySystem (dependency injection)');
{
  test('issueBook/returnBook fonctionnent avec les dépendances injectées', () => {
    const library = new LibrarySystem(new NotificationService(), new DailyFineStrategy(1));
    const alice = MemberFactory.createMember('student', 's1', 'Alice');
    const book = new Book('ISBN-1', 'Clean Code', 'Robert C. Martin');
    library.addMember(alice);
    library.addBook(book);

    library.issueBook('s1', 'ISBN-1');
    assert.strictEqual(book.status, 'Issued');

    const loan = library.returnBook('s1', 'ISBN-1');
    assert.strictEqual(book.status, 'Available');
    assert.strictEqual(loan.fine, 0); // returned same day, no late fee
  });

  test('changer la FineStrategy injectée change réellement le montant de l\'amende (preuve de la DI)', () => {
    const flatLibrary = new LibrarySystem(new NotificationService(), new FlatFineStrategy(5));
    const alice = MemberFactory.createMember('student', 's1', 'Alice');
    const book = new Book('ISBN-1', 'Clean Code', 'Robert C. Martin');
    flatLibrary.addMember(alice);
    flatLibrary.addBook(book);

    const issueDate = new Date('2026-01-01');
    const lateReturnDate = new Date('2026-01-18'); // 3 days late on a 14-day loan
    flatLibrary.issueBook('s1', 'ISBN-1', issueDate);
    const loan = flatLibrary.returnBook('s1', 'ISBN-1', lateReturnDate);

    // Deliberately chosen so the two strategies DIVERGE for the same input:
    // DailyFineStrategy(1) would give 3 (3 days x 1), FlatFineStrategy(5) gives
    // 5 regardless of days late. If LibrarySystem silently ignored the injected
    // strategy and hardcoded DailyFineStrategy(1), this assertion would fail.
    assert.strictEqual(loan.fine, 5); // flat fee regardless of how many days late
  });

  test('emprunter un livre déjà emprunté échoue', () => {
    const library = new LibrarySystem(new NotificationService(), new DailyFineStrategy(1));
    const alice = MemberFactory.createMember('student', 's1', 'Alice');
    const bob = MemberFactory.createMember('student', 's2', 'Bob');
    const book = new Book('ISBN-1', 'Clean Code', 'Robert C. Martin');
    library.addMember(alice);
    library.addMember(bob);
    library.addBook(book);

    library.issueBook('s1', 'ISBN-1');
    assert.throws(() => library.issueBook('s2', 'ISBN-1'));
  });

  test('un Student ne peut pas dépasser sa limite de 3 livres', () => {
    const library = new LibrarySystem(new NotificationService(), new DailyFineStrategy(1));
    const alice = MemberFactory.createMember('student', 's1', 'Alice');
    library.addMember(alice);
    ['A', 'B', 'C', 'D'].forEach((isbn) => library.addBook(new Book(isbn, isbn, 'Author')));

    library.issueBook('s1', 'A');
    library.issueBook('s1', 'B');
    library.issueBook('s1', 'C');
    assert.throws(() => library.issueBook('s1', 'D'));
  });

  test('markOverdue déclenche bien une notification via le NotificationService injecté', () => {
    const library = new LibrarySystem(new NotificationService(), new DailyFineStrategy(1));
    const alice = MemberFactory.createMember('student', 's1', 'Alice');
    const book = new Book('ISBN-1', 'Clean Code', 'Robert C. Martin');
    library.addMember(alice);
    library.addBook(book);
    library.issueBook('s1', 'ISBN-1');

    library.markOverdue('ISBN-1');

    assert.ok(alice.lastNotification && alice.lastNotification.includes('Clean Code'));
  });
}

assert.strictEqual(passed, TOTAL_TESTS, `attendu ${TOTAL_TESTS}, ${passed} exécutés`);
console.log(`\n${passed}/${TOTAL_TESTS} tests passent`);
