import { EntityActionTypes, EntitySchema, EntityState } from './types';
import { Reducer } from '../system-types';
import { combineReducers } from '../shared/utils';
import { createDictionaryReducer } from './reducers/dictionary';
import { createIdsReducer } from './reducers/ids';
import { createPagesReducer } from './reducers/pages';
import { createChange, createResolveChange, createSetLoadingState, EntityActions } from './actions';
import { createByIdLoadingStatesReducer } from './reducers/loading-states';
import { createEntityLoadingStateReducer } from './reducers/loading-state';
import { batchActionsReducerFactory } from '../shared/system/reducers';

const createBaseReducer = <T, TPageMetadata>(
    actionTypes: EntityActionTypes,
): Reducer<EntityState<T, TPageMetadata>, EntityActions> => combineReducers<EntityState<T, TPageMetadata>, EntityActions>({
    dictionary: createDictionaryReducer(actionTypes),
    ids: createIdsReducer(actionTypes),
    pages: createPagesReducer(actionTypes),
    loadingStates: createByIdLoadingStatesReducer(actionTypes),
    loadingState: createEntityLoadingStateReducer(actionTypes),
});

const createListReducer = <T, TPageMetadata>(
    actionTypes: EntityActionTypes,
    schema: EntitySchema<T>,
): Reducer<EntityState<T, TPageMetadata>, EntityActions> => {
    const baseReducer = createBaseReducer<T, TPageMetadata>(actionTypes);
    return (state: EntityState<T, TPageMetadata>, action: EntityActions) => {
        switch (action.type) {
            case actionTypes.CHANGE_LIST: {
                const actionCreator = createChange(actionTypes);
                const { payload: { patches, changeId }, options } = action;
                const actions = patches.map((patch) => actionCreator(
                    patch.id,
                    patch.patch,
                    changeId,
                    options,
                ));
                return actions.reduce(baseReducer, state);
            }
            case actionTypes.RESOLVE_CHANGE_LIST: {
                const actionCreator = createResolveChange(actionTypes);
                const { payload: { patches, changeId, success }, options } = action;
                const actions = patches.map((patch) => actionCreator(
                    patch.id,
                    changeId,
                    success,
                    patch.patch,
                    options,
                ));
                return actions.reduce(baseReducer, state);
            }
            case actionTypes.SET_LOADING_STATES: {
                const actionCreator = createSetLoadingState(actionTypes, schema);
                const { payload: { ids, state: loadingState }, options } = action;
                const actions = ids.map((id) => actionCreator(
                    loadingState,
                    undefined,
                    id,
                    undefined,
                    options,
                ));
                return actions.reduce(baseReducer, state);
            }
            default:
                return baseReducer(state, action);
        }
    };
};

export const createEntityReducer = <T, TPageMetadata>(
    actionTypes: EntityActionTypes,
    schema: EntitySchema<T>,
): Reducer<EntityState<T, TPageMetadata>, EntityActions> => {
    const listReducer = createListReducer<T, TPageMetadata>(actionTypes, schema);
    return batchActionsReducerFactory(actionTypes, listReducer);
};
