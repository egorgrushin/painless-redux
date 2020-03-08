import { Id } from '../system-types';
import { Entity } from './types';
import { createEntity } from './entity';
import { PainlessRedux } from '../painless-redux/types';
import { createPainlessRedux } from '../painless-redux/painless-redux';
import { TestStore } from '../testing/store';
import { cold } from 'jest-marbles';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

type TestEntity = {
    id: Id;
    profile?: {
        image?: string;
        age?: number;
        name?: string;
    };
}

describe('[Integration] Entity', () => {

    let entity: Entity<TestEntity>;
    let pr: PainlessRedux;
    let store: TestStore;

    beforeEach(() => {
        store = new TestStore({}, (state) => state);
        pr = createPainlessRedux(store);
        entity = createEntity<TestEntity>(pr, { name: 'test' });
    });

    describe('#get$', () => {

        test('should emit created instance earlier', () => {
            // arrange
            const filter = null;
            const user: TestEntity = { id: 1, profile: { name: 'John' } };
            entity.create(user);
            const expected$ = cold('a', { a: [user] });
            // act
            const actual$ = entity.get$(filter);
            // assert
            expect(actual$).toBeObservable(expected$);
        });

        test('should emit instance after response', () => {
            // // arrange
            const filter = null;
            const user: TestEntity = { id: 1, profile: { name: 'John' } };
            const remote$ = of({ data: [user] }).pipe(delay(3000));
            // const expected$ = cold('a-b   ', { a: undefined, b: [user] });
            // // act
            const actual$ = entity.get$(filter, remote$).subscribe((values) => {
                console.log((values));
            });
            // assert
            // expect(actual$).toBeObservable(expected$);
        });

    });

});
