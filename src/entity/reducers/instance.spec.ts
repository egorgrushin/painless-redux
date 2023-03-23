import { createTestHelpers } from '../../testing/helpers';
import { createInstanceReducer } from './instance';
import { EntityChange, EntityInstanceState, EntityType } from '../types';

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
            const action = actionCreators.ADD(entity, undefined, { merge });
            const existChange = { stable: false, patch: {}, merge: false };
            const state: EntityInstanceState<any> = {
                actual: entity, changes: [existChange],
            };
            // act
            const actual = reducer(state, action);
            // assert
            const addChange: EntityChange<any> = { stable: true, patch: entity, merge };
            const expected = {
                actual: entity,
                changes: [existChange, addChange],
            };
            expect(actual).toEqual(expected);
        });
    });
});
