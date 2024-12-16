import { Entity, EntityActionTypes, EntitySchema, EntityState } from './types';
import { createEntitySelectors } from './selectors';
import { PainlessRedux, SlotTypes } from '../painless-redux/types';
import { createEntityActionTypes, createIdResolver, getFullEntitySchema } from './utils';
import { createEntityReducer } from './reducer';
import { EntityActions } from './actions';
import { createDispatchEntityMethods } from './methods/dispatch/dispatch';
import { createEntityActionCreators } from './action-creators';
import { createSelectEntityMethods } from './methods/select/select';
import { createMixedEntityMethods } from './methods/mixed/mixed';

export const createEntity = <T, TPageMetadata = void>(
    pr: PainlessRedux,
    schema?: Partial<EntitySchema<T>>,
): Entity<T, TPageMetadata> => {
    const fullSchema = getFullEntitySchema<T>(schema);
    const idResolver = createIdResolver<T>(fullSchema);
    const actionTypes = createEntityActionTypes(fullSchema.name);
    const actionCreators = createEntityActionCreators<T, TPageMetadata>(actionTypes, fullSchema);
    const reducer = createEntityReducer<T, TPageMetadata>(actionTypes, fullSchema);
    const {
        selector,
        dispatcher,
        selectManager,
    } = pr.registerSlot<EntityState<T, TPageMetadata>, EntityActionTypes, EntityActions>(
        SlotTypes.Entity,
        fullSchema.name,
        reducer,
        actionCreators,
    );
    const selectors = createEntitySelectors<T, TPageMetadata>(selector, fullSchema.hashFn);


    const selectMethods = createSelectEntityMethods<T, TPageMetadata>(selectManager, selectors);
    const dispatchMethods = createDispatchEntityMethods<T, TPageMetadata>(dispatcher, idResolver, selectMethods, fullSchema);
    const mixedMethods = createMixedEntityMethods<T, TPageMetadata>(dispatchMethods, selectMethods, fullSchema, pr.schema);

    const { changeWithId, resolveChange, ...publicDispatchMethods } = dispatchMethods;
    const { get$, getDictionary$, getById$, ...publicSelectMethods } = selectMethods;

    return {
        ...publicDispatchMethods,
        ...mixedMethods,
        ...publicSelectMethods,
        actionCreators,
    };
};
