import { Id } from '../system-types';
import { Entity } from './types';
import { createEntity } from './entity';
import { PainlessRedux } from '../painless-redux/types';
import { createPainlessRedux } from '../painless-redux/painless-redux';
import { TestStore } from '../testing/store';
import { cold } from 'jest-marbles';
import { switchMap } from 'rxjs/operators';

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

        test('should emit created instance earlier', () => {
            // arrange
            entity.create(user);
            const expected$ = cold('a', { a: [user] });
            // act
            const actual$ = entity.get$(filter);
            // assert
            expect(actual$).toBeObservable(expected$);
        });

        test('should emit instance after response', () => {
            // arrange
            const remote$ = cold('  --a', { a: { data: [user] } });
            const expected$ = cold('a-b   ', { a: undefined, b: [user] });
            // act
            const actual$ = entity.get$(filter, remote$);
            // assert
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
                const remote$ = cold('  --a', { a: { data: remotePatch } });
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
                const remote$ = cold(remoteMarble, { a: { data: remotePatch } });
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

});
