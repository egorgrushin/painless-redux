# painless-redux
Reducers-actions-selectors free reactive state management in redux-way

# Overview
This package allows you to use CRUD (Create, Read, Update and Delete) manipulations with entities and workspaces.

General features:
- It provides several simple methods such as get, create, remove, change etc. for using on Entity instance.
- It provides loading state management (i.e. isLoading and error).
- Underhood it uses any redux-like library you want to (e.g. [@ngrx/store](https://github.com/ngrx/platform)), so it means you can use [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=ru) but with this library you don't have to create boilerplate code (e.g. reducers, actions, selectors, action creators etc.).
- All methods working with outer data sources (e.g. requests passed to `get$` method) are [RxJS](https://github.com/ReactiveX/rxjs) powered.
- It supports optimistic change, remove, add
- It provides Workspace (documentation will be ready soon) which allows you store filter, sorting, ui states etc.

# Requirements
1. To be familiar with [redux](https://github.com/reduxjs/redux)
2. To be familiar with [RxJS](https://github.com/ReactiveX/rxjs)

# Plain use

1. install using npm:
	`npm i painless-redux`

2. create an store:
    ```typescript
	import { createPainlessRedux, RxStore } from 'painless-redux';
	const store: RxStore = <use any implementation you want>;
    export const PAINLESS_REDUX_STORE = createPainlessRedux(store);
    ```

3. create an entity:
	```typescript
	import { createEntity } from 'painless-redux';
	import { PAINLESS_REDUX_STORE } from './store';
	export interface Painter {
		id: number | string;
		fullName: string;
		born: number;
	}
	const PaintersEntity = createEntity<Painter>({ name: 'painters' });
	PAINLESS_REDUX_STORE.registerSlot(PaintersEntity);
	export PaintersEntity;
	```

4. add new entity
    ```typescript
   PaintersEntity.add({ id: 1, fullName: 'Vincent van Gogh', born: 1853 });
    ```
5. get entity or all entities
    ```typescript
    PaintersEntity.getById$(1).subscribe((painter: Painter) => {});
    PaintersEntity.get$().subscribe((painters: Painter[]) => {});
    ```
   
# Use with Angular

[This adapter](https://github.com/egorgrushin/ngx-painless-redux) will help you to connect `painless-redux` to your angular project, who uses [@ngrx/store](https://github.com/ngrx/platform).

# Common use

This part can be difficult to understand, but this is main feature of this library.
Commonly you need to load some entities from outer source (e.g. your backend api) with given filter. To achieve this you need to prepare your data source using RxJS's observable and use `Entity.get$` method like this:


```typescript
    import { Observable, of } from 'rxjs';
    import { PaintersEntity } from './painters';

    const init = () => {
        const config = {};
        getPainters$(config).subscribe((painters: Painter[]) => {
            // emits:
            // 1. undefined immediately
            // 2. painters array when getPaintersFromApi$'s observable emits.
        });
    }

    const getPainters$ = (config: unknown): Observable<Painter[]> {
        const dataSource$ = getPaintersFromApi$(config);
        return PaintersEntity.get$(config, dataSource$);
    }

    const getPaintersFromApi$ = (config: unknown): Observable<Painter[]> => {
        // use can use any data source you need, this is for demo purposes.
        const painters: Painter[] = [
           { id: 1, fullName: 'Leonardo da Vinci', born: 1452 },
           { id: 2, fullName: 'Vincent van Gogh', born: 1853 },
           { id: 3, fullName: 'Pablo Picasso', born: 1881 },
        ];
        return of(painters);
    }
```

Using `Entity.get$` method with provided `filterObj` and `dataSource$` the library follows next steps:
1. It reserves place in store and places with key equals `filterObj`'s MD5 hash using [object-hash](https://github.com/puleos/object-hash/) library (use [crypto-js](https://github.com/brix/crypto-js) in cases when filterObj is string)
2. It creates selector for reserved place in store
3. It immediately return Observable that listen to reserved place using selector. It means you will get:
   1. undefined in case of new `filterObj`'s hash
   2. previously stored array of entities associated with given `filterObj`
   3. updated array of entities, which will be resolving from next steps (TL;DR: entities will be resolved from `dataSource`)
4. It sets loadingState (will be described later) to `{ isLoading: true, error: null }`
5. It subscribes to given `dataSource`
6. When given `dataSource` emits value, `Entity` will store this result at reserved place.
7. It sets loadingState to `{ isLoading: false, error: null }`
8. In case of error from given `dataSource` `Entity` will set loadingState to `{ isLoading: false, error: <error from dataSource.error> }`
9. It will emit updated array
10. From this point, returned `Observable` will emit actual entity array if it is changed from other places even if some entity is changed by its id (using `Entity.change`)

The algorithm you can always see in Redux DevTools panel.

# Pagination

`Entity.get$` method supports pagination. For this you have to pass `paginator` BehaviorSubject as the last argument:

```typescript
    import { Observable, of, BehaviorSubject } from 'rxjs';
    import { Pagination } from 'painless-redux';
    import { PaintersEntity } from './painters';

    const init = () => {
        const paginator = new BehaviorSubject(false);
        const config = {};
        getPainters$(config, paginator).subscribe((painters: Painter[]) => {
            // emits:
            // 1. undefined immediately
            // 2. painters array when getPaintersFromApi$'s observable emits.
            // idle 3000ms
            // 3. painters array from second emit merged with another getPaintersFromApi$'s observable emits.
        });

        setTimeout(() => {
            paginator.next(true);
        }, 3000)
    }

    const getPainters$ = (config: unknown, paginator: BehaviorSubject<boolean>): Observable<Painter[]> {
        const dataSource = ({ from, to, size, index }: Pagination) => getPaintersFromApi$(config, from, to);
        return PaintersEntity.get$(config, dataSource, null, paginator);
    }

    const getPaintersFromApi$ = (config: unknown, from: number, to: number): Observable<Painter[]> => {
        // use can use any data source you need, this is for demo purposes.
        const painters: Painter[] = [
           { id: 1, fullName: 'Leonardo da Vinci', born: 1452 },
           { id: 2, fullName: 'Vincent van Gogh', born: 1853 },
           { id: 3, fullName: 'Pablo Picasso', born: 1881 },
        ].slice(from, to);
        return of(painters);
    }

