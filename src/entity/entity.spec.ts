import { Id, LoadingState } from '../system-types';
import { getOrderedMarbleStream, initStoreWithPr } from '../testing/helpers';
import { cold } from 'jest-marbles';
import { TestStore } from '../testing/store';
import { createEntity } from './entity';
import { createPainlessRedux } from '../painless-redux/painless-redux';
import { PainlessRedux } from '../painless-redux/types';
import { Entity, EntityChangeOptions, Pagination } from './types';
import { BehaviorSubject } from 'rxjs';
import { mocked } from 'ts-jest/utils';
import * as uuid from 'uuid';

jest.mock('uuid');

interface TestEntity {
    name: string;
}

describe('Entity', () => {

    let entity: Entity<TestEntity>;
    let pr: PainlessRedux;
    let store: TestStore<any>;
    let user: any;
    let user2: any;
    let user3: any;
    let reducer: any;
    let idFn = jest.fn((data) => data.id);

    const setStateActionFactory = <E>(
        state: LoadingState<E>,
        id?: Id,
    ) => entity.actionCreators.SET_STATE(state, undefined, id);

    beforeEach(() => {
        store = new TestStore(undefined, (state) => state);
        pr = createPainlessRedux(store, { useAsapSchedulerInLoadingGuards: false });
        entity = createEntity<TestEntity>(pr, {
            name: 'test',
            pageSize: 2,
            id: idFn,
        });
        reducer = initStoreWithPr(store, pr);
        user = { id: 1, name: 'John' };
        user2 = { id: 2, name: 'Alex' };
        user3 = { id: 3, name: 'Frank' };
    });

    describe('#add', () => {
        test('should add entity', () => {
            // arrange
            const addAction = entity.actionCreators.ADD(user);
            const actions$ = getOrderedMarbleStream(addAction);
            // act
            entity.add(user);
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });

        test('should resolve id from schema.id fn and add entity', () => {
            // arrange
            mocked(idFn).mockImplementationOnce((data): string | number => `$${data.name}`);
            const userWithoutId = { name: user.name };
            const addAction = entity.actionCreators.ADD({
                ...userWithoutId,
                id: `$${userWithoutId.name}`,
            });
            const actions$ = getOrderedMarbleStream(addAction);
            // act
            entity.add(userWithoutId);
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });

        test('should resolve id if it does not exist and add entity', () => {
            // arrange
            const randomId = 'adav3r2brh35';
            mocked(idFn).mockReturnValueOnce(undefined);
            mocked(uuid.v4).mockReturnValueOnce(randomId);
            const userWithoutId = { name: user.name };
            const addAction = entity.actionCreators.ADD({
                ...userWithoutId,
                id: randomId,
            });
            const actions$ = getOrderedMarbleStream(addAction);
            // act
            entity.add(userWithoutId);
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });
    });

    describe('#addList', () => {
        test('should add entities', () => {
            // arrange
            const users = [user, user2];
            const addListAction = entity.actionCreators.ADD_LIST(users);
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
            const patch = { name: 'Frank' };

            const changeAction = entity.actionCreators.CHANGE(user.id, patch);
            const actions$ = getOrderedMarbleStream(changeAction);
            // act
            entity.change(user.id, patch);
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });
    });

    describe('#changeRemote', () => {
        const patch = { name: 'Frank' };
        const responsePatch = { name: 'Alice' };
        const changeId = 'vn3n5k';
        mocked(uuid.v4).mockReturnValue(changeId);

        test.each`
             useResponsePatch
             ${false}
             ${true}
             `('should change entity remotely with useResponsePatch: $useResponsePatch', ({ useResponsePatch }) => {
            // arrange
            const options: EntityChangeOptions = { useResponsePatch };
            const id = user.id;
            const remote$ = cold(' --a| ', { a: responsePatch });
            const resolvePatch = useResponsePatch ? responsePatch : patch;
            const changeAction = entity.actionCreators.CHANGE(id, resolvePatch, changeId, options);
            const actions$ = cold('a-(bc)', {
                a: setStateActionFactory({ isLoading: true }, id),
                b: changeAction,
                c: setStateActionFactory({ isLoading: false }, id),
            });
            // act
            entity.changeRemote$(id, patch, remote$, options).subscribe();
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });

        describe('#optimistic', () => {
            test.each`
	        	useResponsePatch
		        ${false}
		        ${true}
	            `('should change entity remotely with useResponsePatch: $useResponsePatch', ({ useResponsePatch }) => {
                const options: EntityChangeOptions = { optimistic: true, useResponsePatch };
                const remote$ = cold(' --a| ', { a: responsePatch });
                const id = user.id;
                const changeAction = entity.actionCreators.CHANGE(id, patch, changeId, options);
                const resolvePatch = useResponsePatch ? responsePatch : undefined;
                const resolveChangeAction = entity.actionCreators.RESOLVE_CHANGE(id, changeId, true, resolvePatch, options);
                const actions$ = cold('a-b', {
                    a: changeAction,
                    b: resolveChangeAction,
                });
                // act
                entity.changeRemote$(id, patch, remote$, options).subscribe();
                // assert
                expect(store.actions$).toBeObservable(actions$);
            });

            test('should resolve unsuccessfully if response failed', () => {
                const options: EntityChangeOptions = { optimistic: true };
                const error = new Error();
                const failedRemote$ = cold(' --#|', undefined, error);
                const id = user.id;
                const changeAction = entity.actionCreators.CHANGE(id, patch, changeId, options);
                const resolveChangeAction = entity.actionCreators.RESOLVE_CHANGE(id, changeId, false, undefined, options);
                const actions$ = cold('a-(bc)', {
                    a: changeAction,
                    b: resolveChangeAction,
                    c: setStateActionFactory({ isLoading: false, error }, id),
                });
                // act
                entity.changeRemote$(id, patch, failedRemote$, options).subscribe();
                // assert
                expect(store.actions$).toBeObservable(actions$);
            });
        });

    });

    describe('#remove', () => {
        test('should remove entity', () => {
            // arrange
            const removeAction = entity.actionCreators.REMOVE(user.id);
            const actions$ = getOrderedMarbleStream(removeAction);
            // act
            entity.remove(user.id);
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });

        test('should remote remove entity', () => {
            // arrange
            const removeAction = entity.actionCreators.REMOVE(user.id);
            const remote$ = cold(' --a| ', { a: null });
            const actions$ = cold('a-(bc)', {
                a: setStateActionFactory({ isLoading: true }, user.id),
                b: setStateActionFactory({ isLoading: false }, user.id),
                c: removeAction,
            });
            // act
            entity.removeRemote$(user.id, remote$).subscribe();
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });

        test('should optimistic remove entity', () => {
            // arrange
            const options = { optimistic: true };
            const removeAction = entity.actionCreators.REMOVE(user.id, options);
            const remote$ = cold(' --a| ', { a: null });
            const actions$ = cold('a', {
                a: removeAction,
            });
            // act
            entity.removeRemote$(user.id, remote$, options).subscribe();
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });

        xtest('should optimistic undo if failed', () => {
            // arrange
            const options = { optimistic: true };
            const error = new Error('Failed');
            const removeAction = entity.actionCreators.REMOVE(user.id, options);
            const undoAction = { type: '[Store] Undo', payload: { action: removeAction }, options: {} };
            const remote$ = cold(' --#| ', undefined, error);
            const actions$ = cold('a-(bc)', {
                a: removeAction,
                b: undoAction,
                c: setStateActionFactory<Error>({ isLoading: false, error }, user.id),
            });
            // act
            entity.removeRemote$(user.id, remote$, options).subscribe();
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });

    });

    describe('#create', () => {
        test('should create entity', () => {
            // arrange
            const createAction = entity.actionCreators.CREATE(user);
            const actions$ = cold('a', { a: createAction });
            // act
            entity.create(user);
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });

        test('should remote create entity', () => {
            // arrange
            const remote$ = cold('--a|', { a: user });
            const createAction = entity.actionCreators.CREATE(user);
            const actions$ = cold('a-(bc)', {
                a: setStateActionFactory({ isLoading: true }),
                b: createAction,
                c: setStateActionFactory({ isLoading: false }),
            });
            // act
            const actual = entity.createRemote$(undefined, remote$);
            // assert
            expect(actual).toBeObservable(remote$);
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
            const remote$ = cold('--a|', { a: user });
            const addAction = entity.actionCreators.ADD(user);
            const actions$ = cold('a-(bc)', {
                a: setStateActionFactory({ isLoading: true }, user.id),
                b: addAction,
                c: setStateActionFactory({ isLoading: false }, user.id),
            });
            // act
            entity.getById$(user.id, remote$).subscribe();
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });

        test('should load entity with tuple id', () => {
            // arrange
            const data = { objectId: '23a4123', type: 5, title: 'Some object 1' };
            const remote$ = cold('--a|', { a: data });
            const id = [data.objectId, data.type].toString();
            const addAction = entity.actionCreators.ADD({ id, ...data });
            const actions$ = cold('a-(bc)', {
                a: setStateActionFactory({ isLoading: true }, id),
                b: addAction,
                c: setStateActionFactory({ isLoading: false }, id),
            });
            // act
            entity.getById$(id, remote$).subscribe();
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });
    });

    describe('#get$', () => {

        test('should return observable to entity', () => {
            // arrange
            const storeObs = cold('a', { a: undefined });
            // act
            const actual = entity.get$(null);
            // assert
            expect(actual).toBeObservable(storeObs);
        });

        test('should load entities', () => {
            // arrange
            const users = [user];
            const remote$ = cold('--a|', { a: users });
            const filter = null;
            const addAction = entity.actionCreators.ADD_LIST(users, filter, true, false);
            const actions$ = cold('a-(bc)', {
                a: setStateActionFactory({ isLoading: true }),
                b: addAction,
                c: setStateActionFactory({ isLoading: false }),
            });
            // act
            entity.get$(filter, remote$).subscribe();
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });

        xtest('should log if observable source throws error', () => {
            // arrange
            const error = new Error('Some error');
            const remote$ = cold('#|', null, error);
            global.console.error = jest.fn();
            // act
            entity.get$(null, remote$).subscribe();
            // assert
            expect(global.console.error).toBeCalled();
        });

        test('should set error if observable source throws error', () => {
            // arrange
            const error = new Error('Some error');
            const remote$ = cold('--#|', null, error);
            const actions$ = cold('a-b', {
                a: setStateActionFactory({ isLoading: true }),
                b: setStateActionFactory<Error>({ isLoading: false, error }),
            });
            // act
            entity.get$(null, remote$).subscribe();
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });

        test('should page entities', () => {
            // arrange
            const remoteMarble = '    --a|   --a|   --a|   --a|  ';
            const paginationMarble = '-------a------b------b-----';
            const actionsMarble = '   a-(bc)-a-(ec)-a-(bc)-a-(bc)';
            const filter = null;
            const options = undefined;
            const users1 = [user, user2];
            const users2 = [user3];
            const remote$ = (value: Pagination) => {
                const users = value.index ? users2 : users1;
                return cold('--a|', { a: users });
            };
            const addAction = entity.actionCreators.ADD_LIST(users1, filter, true, true);
            const addAction2 = entity.actionCreators.ADD_LIST(users2, filter);
            const paginator = new BehaviorSubject<boolean>(true);
            const setStateTrueAction = setStateActionFactory({ isLoading: true });
            const setStateFalseAction = setStateActionFactory({ isLoading: false });

            cold(paginationMarble, {
                a: true,
                b: false,
            }).subscribe((value) => {
                paginator.next(value);
            });

            const actions$ = cold(actionsMarble, {
                a: setStateTrueAction,
                b: addAction,
                c: setStateFalseAction,
                e: addAction2,
            });
            // act
            entity.get$(filter, remote$, options, paginator).subscribe();
            // assert
            expect(store.actions$).toBeObservable(actions$);
        });
    });

    describe('#getDictionary$', () => {
        test('should return page as dictionary observable', () => {
            // arrange
            const storeObs = cold('a', { a: {} });
            // act
            const actual = entity.getDictionary$(undefined);
            // assert
            expect(actual).toBeObservable(storeObs);
        });
    });

});
