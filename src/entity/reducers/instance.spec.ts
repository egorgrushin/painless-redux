import { createTestHelpers } from '../../testing/helpers';
import { createInstanceReducer } from './instance';
import { EntityInstanceState, EntityType, IdEntityPair } from '../types';
import { Change } from '../../shared/change/types';

const {
    reducer,
    actionCreators,
} = createTestHelpers(createInstanceReducer);

describe('instance', () => {

    test('should return default state', () => {
        // act
        const actual = reducer(undefined, { type: 'INIT' } as any);
        // assert
        expect(actual).toEqual(undefined);
    });

    describe('#ADD', () => {
        test.each`
            merge
            ${true}
            ${false}
        `('should add entity as stable change (without id) and merge=$merge if there are changes', ({ merge }) => {
            // arrange
            const entity: EntityType<any> = { id: 1 };
            const pair: IdEntityPair<any> = { entity, id: entity.id };
            const action = actionCreators.ADD(pair, undefined, undefined, { merge });
            const existChange = { stable: false, patch: {}, merge: false };
            const state: EntityInstanceState<any> = {
                actual: entity, changes: [existChange],
            };
            // act
            const actual = reducer(state, action);
            // assert
            const addChange: Change<any> = { stable: true, patch: entity, merge };
            const expected = {
                actual: entity,
                changes: [existChange, addChange],
            };
            expect(actual).toEqual(expected);
        });
    });
});
