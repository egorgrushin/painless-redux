# painless-redux
Reducers-actions-selectors free reactive state management in redux-way

# Overview
This package allows you to use CRUD (Create, Read, Update and Delete) manipulations with entities and workspaces. Underhood it uses [@ngrx/store](https://github.com/ngrx/platform) (redux like + rxjs), but with this library you don't have to create boilerplate code (e.g. reducers, actions, selectors, action creators etc.). It provides several simple methods such as get, create, remove, change etc. for using on Entity instance. It also provides loading state management (i.e. isLoading and error). For working with Angular it provides connector.

# How to use

1. install using npm: 
	
	`npm install -S painless-redux`

2. create an entity:
	```typescript
	export interface ISomeEntity {
		id: string;
		count: number;
	}
	export const SomeEntity = new Entity<ISomeEntity>({ name: 'some-entity' });
	```

3. import connecting module (this step required because Entity must get Store (from @ngrx/store) and StoreLib instance:
	```typescript
	import { SomeEntity } from './some-entity';
	import { StoreConnectionsModule } from 'painless-redux';

	@NgModule({
		imports: [
			StoreConnectionsModule.forChild([SomeEntity]);
		],
	})
	class SomeModule {}
	```

4. use SomeEntity const everywhere it's needed:
	```typescript
	import { SomeEntity } from './some-entity';

	class SomeService {
		get$(): Observable<ISomeEntity[]> {
			return SomeEntity.get$();
		}
	}
	```

