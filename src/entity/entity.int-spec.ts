import { Id } from '../system-types';
import { Entity, EntityAddOptions, EntityRemoveOptions } from './types';
import { createEntity } from './entity';
import { PainlessRedux } from '../painless-redux/types';
import { createPainlessRedux } from '../painless-redux/painless-redux';
import { TestStore } from '../testing/store';
import { cold } from 'jest-marbles';
import { switchMap } from 'rxjs/operators';
import { mocked } from 'ts-jest/utils';
import * as uuid from 'uuid';

jest.mock('uuid');

type TestEntity = {
    id: Id;
    image?: string;
    age?: number;
    name?: string;
}

describe('[Integration] Entity', () => {

    let entity: Entity<TestEntity>;
    let pr: PainlessRedux;
    let store: TestStore;
    const filter = null;
    const user: TestEntity = { id: 1, name: 'John' };

    beforeEach(() => {
        store = new TestStore({}, (state) => state);
        pr = createPainlessRedux(store, { useAsapSchedulerInLoadingGuards: false });
        entity = createEntity<TestEntity>(pr, { name: 'test' });
    });

    describe('#get$', () => {

        test('should emit created earlier instance ', () => {
            // arrange
            entity.add(user);
            const expected$ = cold('a', { a: [user] });
            // act
            const actual$ = entity.get$(filter);
            // assert
            expect(actual$).toBeObservable(expected$);
        });

        test('should emit instance after response', () => {
            // arrange
            const remote$ = cold('  --a', { a: [user] });
            const expected$ = cold('a-b   ', { a: undefined, b: [user] });
            // act
            const actual$ = entity.get$(filter, remote$);
            // assert
            expect(actual$).toBeObservable(expected$);
        });

        test('should not load instance if exist with single option ', () => {
            // arrange
            entity.add(user);
            const remote$ = cold('  --a', { a: [user] });
            const expected$ = cold('a   ', { a: [user] });
            // act
            const actual$ = entity.get$(filter, remote$, { single: true });
            // assert
            expect(actual$).toBeObservable(expected$);
        });

        test('should not subscribe to remote$ if exist with single option ', () => {
            // arrange
            entity.add(user);
            const remote$ = cold('  --a', { a: [user] });
            // act
            entity.get$(filter, remote$, { single: true }).subscribe();
            // assert
            expect(remote$).toHaveNoSubscriptions();
        });
    });

    describe('getById$', () => {

        test('should emit created earlier instance ', () => {
            // arrange
            entity.add(user);
            const expected$ = cold('a', { a: user });
            // act
            const actual$ = entity.getById$(user.id);
            // assert
            expect(actual$).toBeObservable(expected$);
        });

        test('should emit instance after response', () => {
            // arrange
            const remote$ = cold('  --a', { a: user });
            const expected$ = cold('a-b   ', { a: undefined, b: user });
            // act
            const actual$ = entity.getById$(user.id, remote$);
            // assert
            expect(actual$).toBeObservable(expected$);
        });

        test('should not load instance if exist with single option ', () => {
            // arrange
            entity.add(user);
            const remote$ = cold('  --a', { a: user });
            const expected$ = cold('a   ', { a: user });
            // act
            const actual$ = entity.getById$(user.id, remote$, { single: true });
            // assert
            expect(actual$).toBeObservable(expected$);
        });

        test('should not subscribe to remote$ if exist with single option ', () => {
            // arrange
            entity.add(user);
            const remote$ = cold('  --a', { a: user });
            // act
            entity.getById$(user.id, remote$, { single: true }).subscribe();
            // assert
            expect(remote$).toHaveNoSubscriptions();
        });
    });

    describe('getLoadingState$', () => {
        test('should return loading state', () => {
            // act
            const actual$ = entity.getLoadingState$();
            // assert
            const expected$ = cold('a', { a: { isLoading: false } });
            expect(actual$).toBeObservable(expected$);
        });

        test.each`
            actionName         | action
            ${'get$'}          | ${(remote$: any) => entity.get$(filter, remote$)}
            ${'getById$'}      | ${(remote$: any) => entity.getById$(user.id, remote$)}
            ${'addRemote$'}    | ${(remote$: any) => entity.addRemote$(user, user.id, remote$)}
            ${'changeRemote$'} | ${(remote$: any) => entity.changeRemote$(user.id, {}, remote$)}
            ${'removeRemote$'} | ${(remote$: any) => entity.removeRemote$(user.id, remote$)}
        `('should set loading state during remote$ for entity.$actionName', ({ action }) => {
            // arrange
            const remoteMarble = '      --a';
            const loadingStateMarble = 'a-b';
            const remote$ = cold(remoteMarble, { a: undefined });
            // act
            const actual$ = entity.getLoadingState$();
            action(remote$).subscribe();
            // assert
            const expected$ = cold(loadingStateMarble, {
                a: { isLoading: true },
                b: { isLoading: false },
            });
            expect(actual$).toBeObservable(expected$);
        });
    });

    describe('getLoadingStates$', () => {
        test('should return loading states', () => {
            // act
            const actual$ = entity.getLoadingStates$();
            // assert
            const expected$ = cold('a', { a: {} });
            expect(actual$).toBeObservable(expected$);
        });

        test.each`
            actionName         | action
            ${'getById$'}      | ${(remote$: any) => entity.getById$(user.id, remote$)}
            ${'changeRemote$'} | ${(remote$: any) => entity.changeRemote$(user.id, {}, remote$)}
        `('should set loading state during remote$ for entity.$actionName', ({ action }) => {
            // arrange
            const remoteMarble = '      --a';
            const loadingStateMarble = 'a-b';
            const remote$ = cold(remoteMarble, { a: undefined });
            // act
            const actual$ = entity.getLoadingStates$();
            action(remote$).subscribe();
            // assert
            const expected$ = cold(loadingStateMarble, {
                a: { [user.id]: { isLoading: true } },
                b: { [user.id]: { isLoading: false } },
            });
            expect(actual$).toBeObservable(expected$);
        });

        test('should set and then remove loading state for entity.removeRemote$', () => {
            // arrange
            const remoteMarble = '      --a';
            const loadingStateMarble = 'a-(bc)';
            const remote$ = cold(remoteMarble, { a: undefined });
            // act
            const actual$ = entity.getLoadingStates$();
            entity.removeRemote$(user.id, remote$).subscribe();
            // assert
            const expected$ = cold(loadingStateMarble, {
                a: { [user.id]: { isLoading: true } },
                b: { [user.id]: { isLoading: false } },
                c: {},
            });
            expect(actual$).toBeObservable(expected$);
        });
    });

    describe('#changeRemote$', () => {
        const patch = { name: 'Alice' };
        const remotePatch = { name: 'Mike' };

        beforeEach(() => {
            entity.add(user);
        });

        test.each`
            useResponsePatch
            ${false}
            ${true}
        `(
            'should apply either patch or remotePatch after response based on useResponsePatch: $useResponsePatch',
            ({ useResponsePatch }) => {
                // arrange
                const resultPatch = useResponsePatch ? remotePatch : patch;
                const remote$ = cold('  --a', { a: remotePatch });
                const expected$ = cold('a-b   ', { a: [user], b: [{ ...user, ...resultPatch }] });
                const actual$ = entity.get$(filter);
                const options = { useResponsePatch };
                // act
                entity.changeRemote$(user.id, patch, remote$, options).subscribe();
                // assert
                expect(actual$).toBeObservable(expected$);
            },
        );

        test('should ignore in case of response fail', () => {
            // arrange
            const remote$ = cold('  --#');
            const expected$ = cold('a', { a: [user] });
            const actual$ = entity.get$(filter);
            // act
            entity.changeRemote$(user.id, patch, remote$).subscribe();
            // assert
            expect(actual$).toBeObservable(expected$);
        });

        test.each`
            useResponsePatch
            ${false}
            ${true}
        `(
            'should apply patch immediately and based on useResponsePatch: $useResponsePatch apply remotePatch',
            ({ useResponsePatch }) => {
                // arrange
                const remoteMarble = '    --a';
                const expectedMarble = 'a-b-c';
                const actMarble = '     --a';
                const remote$ = cold(remoteMarble, { a: remotePatch });
                const patched = { ...user, ...patch };
                const resultPatched = useResponsePatch ? { ...patched, ...remotePatch } : patched;
                const expected$ = cold(expectedMarble, {
                    a: [user],
                    b: [patched],
                    c: [resultPatched],
                });
                const actual$ = entity.get$(filter);
                const options = { optimistic: true, useResponsePatch };
                // act
                cold(actMarble).pipe(
                    switchMap(() => entity.changeRemote$(user.id, patch, remote$, options)),
                ).subscribe();
                // assert
                expect(actual$).toBeObservable(expected$);
            },
        );

    });

    describe('#removeRemote', () => {
        beforeEach(() => {
            entity.add(user);
        });

        test.each`
            remoteMarble | expectedMarble
            ${'--a'}     | ${'a-b-b'}
            ${'--#'}     | ${'a-b-a'}
        `('should optimistic remove or undo for $remoteMarble', ({ remoteMarble, expectedMarble }) => {
            // arrange
            const remote$ = cold(remoteMarble);
            const expected$ = cold(expectedMarble, { a: [user], b: [] });
            const actual$ = entity.get$(filter);
            const options: EntityRemoveOptions = { optimistic: true };
            // act
            cold('--a', { a: null }).pipe(
                switchMap(() => entity.removeRemote$(user.id, remote$, options)),
            ).subscribe();
            // assert
            expect(actual$).toBeObservable(expected$);
        });
    });

    describe('#addRemote', () => {
        test.each`
            remoteMarble | expectedMarble
            ${'--a'}     | ${'a-b-c'}
            ${'--#'}     | ${'a-b-d'}
        `('should optimistic add with response.id or undo for $remoteMarble', ({ remoteMarble, expectedMarble }) => {
            // arrange
            const newId = '999';
            const tempId = '666';
            mocked(uuid.v4).mockReturnValueOnce(tempId);
            const response = { id: newId };
            const remote$ = cold(remoteMarble, { a: response });
            const expected$ = cold(expectedMarble, {
                a: undefined,
                b: [{ ...user, id: tempId }],
                c: [{ ...user, id: newId }],
                d: [],
            });
            const actual$ = entity.get$(filter);
            const options: EntityAddOptions = { optimistic: true };
            // act
            cold('--a').pipe(
                switchMap(() => entity.addRemote$(user, filter, remote$, options)),
            ).subscribe();
            // assert
            expect(actual$).toBeObservable(expected$);
        });
    });

    describe('#getAll$', () => {
        test('should return all entities', () => {
            // arrange
            const user1 = { id: 1, name: 'User 1' };
            const user2 = { id: 2, name: 'User 2' };
            const actual$ = entity.getAll$();
            const actMarble = '     -a-b';
            const expectedMarble = 'ab-c';
            const expected$ = cold(expectedMarble, { a: [], b: [user1], c: [user1, user2] });
            // act
            cold(actMarble, { a: user1, b: user2 }).subscribe((value) => {
                entity.add(value, Math.random());
            });
            // assert
            expect(actual$).toBeObservable(expected$);
        });
    });

    describe('#clearAll', () => {
        test('should clear all entities', () => {
            // arrange
            const user1 = { id: 1, name: 'User 1' };
            const user2 = { id: 2, name: 'User 2' };
            entity.add(user1, Math.random());
            entity.add(user2, Math.random());
            const actual$ = entity.getAll$();
            const actMarble = '     --a';
            const expectedMarble = 'a-b';
            const expected$ = cold(expectedMarble, { a: [user1, user2], b: [] });
            // act
            cold(actMarble).subscribe(() => {
                entity.clearAll();
            });
            // assert
            expect(actual$).toBeObservable(expected$);
        });
    });

});
