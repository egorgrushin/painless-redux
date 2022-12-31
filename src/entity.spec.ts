import { Entity } from './entity';
import { cold, hot } from 'jest-marbles';
import { Id, ILoadingState, IPagination } from './types';
import { BehaviorSubject } from 'rxjs';
import { getOrderedMarbleStream, registerSlotsInStore } from './testing/helpers';
import { TestStore } from './testing/store';
import { tap } from 'rxjs/operators';

describe('Entity', () => {

	let entity: Entity;
	let store: TestStore<any>;
	let user: any;
	let user2: any;
	let user3: any;
	let initialState: any;
	let reducer: any;
	const setStateActionFactory = (state: ILoadingState, id?: Id) =>
		entity.actionCreators.setState(null, id || null, state, null);

	beforeEach(() => {
		entity = new Entity({ name: 'test', pageSize: 1 });
		store = new TestStore();
		reducer = registerSlotsInStore(store, [entity]);
		user = { id: 1, name: 'John' };
		user2 = { id: 2, name: 'Alex' };
		user3 = { id: 3, name: 'Frank' };
	});

	describe('#add', () => {
		test('should add entity', () => {
			// arrange
			const addAction = entity.actionCreators.add(user);
			const actions$ = getOrderedMarbleStream(addAction);
			// act
			entity.add(user);
			// assert
			expect(store.actions$).toBeObservable(actions$);
		});
	});

	describe('#addList', () => {
		test('should add entities', () => {
			// arrange
			const users = [user, user2];
			const addListAction = entity.actionCreators.addList(users);
			const actions$ = getOrderedMarbleStream(addListAction);
			// act
			entity.addList(users);
			// assert
			expect(store.actions$).toBeObservable(actions$);
		});
	});

	describe('#change', () => {
		test('should change entity', () => {
			// arrange
			const changeAction = entity.actionCreators.change(user.id, 'Frank', 'name');
			const actions$ = getOrderedMarbleStream(changeAction);
			// act
			entity.change(user.id, 'Frank', 'name');
			// assert
			expect(store.actions$).toBeObservable(actions$);
		});
	});

	describe('#remove', () => {
		test('should remove entity', () => {
			// arrange
			const removeAction = entity.actionCreators.remove(user.id);
			const actions$ = getOrderedMarbleStream(removeAction);
			// act
			entity.remove(user.id);
			// assert
			expect(store.actions$).toBeObservable(actions$);
		});

		// FIXME(yrgrushi): due to using of schedulers under the hood
		//  this test is broken
		test.skip('should remote remove entity', () => {
			// arrange
			const remoteObs = cold('--a|', { a: null });
			const removeAction = entity.actionCreators.remove(user.id);
			const actions$ = cold('a-(bc)', {
				a: setStateActionFactory({ isLoading: true }, user.id),
				b: setStateActionFactory({ isLoading: false }, user.id),
				c: removeAction,
			});
			// act
			const actual$ = entity.remove(user.id, remoteObs);
			// assert
			expect(actual$).toBeObservable(remoteObs);
			// expect(store.actions$).toBeObservable(actions$);
		});
	});

	describe('#create', () => {
		test('should create entity', () => {
			// arrange
			const createAction = entity.actionCreators.create(user);
			const actions$ = cold('a', { a: createAction });
			// act
			entity.create(user);
			// assert
			expect(store.actions$).toBeObservable(actions$);
		});

		test('should remote create entity', () => {
			// arrange
			const response = { data: user };
			const remoteObs = cold('--a|', { a: response });
			const createAction = entity.actionCreators.create(user);
			const actions$ = cold('a-(bc)', {
				a: setStateActionFactory({ isLoading: true }),
				b: createAction,
				c: setStateActionFactory({ isLoading: false }),
			});
			// act
			const actual = entity.create(user, null, remoteObs);
			// assert
			expect(actual).toBeObservable(remoteObs);
			expect(store.actions$).toBeObservable(actions$);
		});
	});

	describe('#getById$', () => {
		test('should return observable to entity', () => {
			// arrange
			const storeObs = cold('a', { a: undefined });
			// act
			const actual = entity.getById$(1);
			// assert
			expect(actual).toBeObservable(storeObs);
		});

		test('should load entity', () => {
			// arrange
			const remoteObs = cold('--a|', { a: { data: user } });
			const addAction = entity.actionCreators.add(user);
			const actions$ = cold('a-(bc)', {
				a: setStateActionFactory({ isLoading: true }, user.id),
				b: addAction,
				c: setStateActionFactory({ isLoading: false }, user.id),
			});
			// act
			entity.getById$(user.id, remoteObs).subscribe();
			// assert
			expect(store.actions$).toBeObservable(actions$);
		});

		test('should load entity with tuple id', () => {
			// arrange
			const data = { objectId: '23a4123', type: 5, title: 'Some object 1' };
			const remoteObs = cold('--a|', {
				a: { data },
			});
			const id = [data.objectId, data.type];
			const addAction = entity.actionCreators.add({ id, ...data });
			const actions$ = cold('a-(bc)', {
				a: setStateActionFactory({ isLoading: true }, id),
				b: addAction,
				c: setStateActionFactory({ isLoading: false }, id),
			});
			// act
			entity.getById$(id, remoteObs).subscribe();
			// assert
			expect(store.actions$).toBeObservable(actions$);
		});
	});

	describe('#get$', () => {
		test('should return observable to entity', () => {
			// arrange
			const storeObs = cold('a', { a: undefined });
			// act
			const actual = entity.get$();
			// assert
			expect(actual).toBeObservable(storeObs);
		});

		test('should load entities', () => {
			// arrange
			const users = [user];
			const remoteObs = cold('--a|', { a: { data: users } });
			const addAction = entity.actionCreators.addList(users, null, true, true);
			const actions$ = cold('a-(bc)', {
				a: setStateActionFactory({ isLoading: true }),
				b: addAction,
				c: setStateActionFactory({ isLoading: false }),
			});
			// act
			entity.get$(null, remoteObs).subscribe();
			// assert
			expect(store.actions$).toBeObservable(actions$);
		});

		// FIXME(yrgrushi): due to using of schedulers under the hood
		//  this test is broken
		test.skip('should page entities', () => {
			// arrange
			const remoteMarble = '    --a|   --a|   --a|   --a|  ';
			const paginationMarble = '-------a------b------b-----';
			const actionsMarble = '   a-(bc)-a-(ec)-a-(bc)-a-(bc)';
			const users1 = [user];
			const users2 = [user2, user3];
			const remoteObs = (value: IPagination) => cold('--a|', { a: { data: value.index ? users2 : users1 } });
			const addAction = entity.actionCreators.addList(users1, null, true, true);
			const addAction2 = entity.actionCreators.addList(users2, null, false, false);
			const paginator = new BehaviorSubject<boolean>(true);
			const setStateTrueAction = setStateActionFactory({ isLoading: true });
			const setStateFalseAction = setStateActionFactory({ isLoading: false });

			hot(paginationMarble, { a: true, b: false })
				.subscribe((value) => {

					initialState = reducer(initialState, addAction);
					store.setState(initialState);

					paginator.next(value);
				});
			const actions$ = cold(actionsMarble, {
				a: setStateTrueAction,
				c: setStateFalseAction,
				b: addAction,
				e: addAction2,
			});
			// act
			entity.get$(null, remoteObs, null, paginator).subscribe();
			// assert
			expect(store.actions$).toBeObservable(actions$);
		});
	});

	describe('#get', () => {
		beforeEach(() => {
			entity.create(user);
			const createAction = entity.actionCreators.create(user);
			const stateWithUser = reducer(initialState, createAction);
			store.setState(stateWithUser);
		});

		test('should return entity', () => {
			// act
			const actual = entity.get(user.id);
			// assert
			const expected = user;
			expect(actual).toEqual(expected);
		});

		test('should return entities', () => {
			// act
			const actual = entity.get();
			// assert
			const expected = [user];
			expect(actual).toEqual(expected);
		});

		test('should return entities for config', () => {
			// arrange
			const config = { managers: true };
			entity.create(user2);
			const createAction = entity.actionCreators.create(user2, config);
			const stateWithUser = reducer(initialState, createAction);
			store.setState(stateWithUser);
			// act
			const actual = entity.get(null, config);
			// assert
			const expected = [user2];
			expect(actual).toEqual(expected);
		});

		test('should return entities as dict', () => {
			// act
			const actual = entity.get(null, null, true);
			// assert
			const expected = { [user.id]: user };
			expect(actual).toEqual(expected);
		});
	});

});
