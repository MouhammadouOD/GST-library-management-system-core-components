# Library Management System - Core Components (JS)

GoMyCode checkpoint — *Low Level Design: Introduction to Low-Level Design*.

Core components of a Library Management System in JavaScript (ES modules), demonstrating modularity, reusability, and three design patterns with dependency injection for testability.

## Project structure

| File | Role |
|---|---|
| `src/models/Book.js` | `Book` — state machine Available → Issued → Available |
| `src/models/Member.js` | `Member` (abstract, interface-like via `new.target` guard), `Student` (max 3 books), `Teacher` (max 10) |
| `src/factories/MemberFactory.js` | **Factory Pattern** — `MemberFactory.createMember(type, id, name)` |
| `src/strategies/FineStrategy.js` | **Strategy Pattern** — abstract `FineStrategy`, `DailyFineStrategy`, `FlatFineStrategy` |
| `src/observers/NotificationService.js` | **Observer Pattern** — members subscribe, notified only if they hold the overdue book |
| `src/LibrarySystem.js` | Orchestrates everything; **Dependency Injection** — `NotificationService` and `FineStrategy` are passed into the constructor, not hardcoded |
| `src/utils/dateUtils.js` | Reusable utility module (`addDays`, `daysBetween`), no dependency on the rest of the project |
| `src/index.js` | Composition root — small runnable demo wiring the injected dependencies together |
| `tests.js` | 10 tests covering every pattern above |

## How to run

```bash
npm start   # runs the demo
npm test    # runs the test suite
```

## Résultats

```
10/10 tests passent
```
Exécution réelle vérifiée le 03/11/2026. Test de mutation effectué (la dépendance `fineStrategy` injectée est ignorée, `loan.fine` forcé à 0) : le test "changer la FineStrategy injectée change réellement le montant de l'amende" échoue bien dans ce cas, confirmant que la DI est réellement exercée par les tests et pas seulement déclarée.

## Choix d'implémentation

- **ES modules** partout (`"type": "module"` dans `package.json`), chaque composant dans son propre fichier.
- **Interface-like abstraction** : `Member` et `FineStrategy` sont des classes abstraites (lèvent une erreur si on tente de les instancier/appeler directement), le plus proche équivalent d'une interface en JS.
- **Dependency Injection** : `LibrarySystem` ne construit jamais lui-même son `NotificationService` ni sa `FineStrategy` — ils sont injectés au constructeur, ce qui permet de les remplacer dans les tests (prouvé par le test de mutation ci-dessus) sans toucher à `LibrarySystem`.
