/**
 * JS has no interfaces, so this abstract base class plays that role:
 * blocks direct instantiation and forces subclasses to implement maxBooks.
 */
export class Member {
  constructor(id, name) {
    if (new.target === Member) {
      throw new TypeError('Member is abstract and cannot be instantiated directly');
    }
    this.id = id;
    this.name = name;
    this.borrowedBooks = [];
  }

  get maxBooks() {
    throw new Error('maxBooks must be implemented by subclass');
  }

  // Observer pattern hook: called by NotificationService.
  notify(message) {
    this.lastNotification = message;
  }
}

export class Student extends Member {
  get maxBooks() {
    return 3;
  }
}

export class Teacher extends Member {
  get maxBooks() {
    return 10;
  }
}
