import { EntityActionTypes, EntityState } from './types';
import { Reducer } from '../system-types';
// @ts-ignore
import * as combineReducers from 'combine-reducers';

import { createDictionaryReducer } from './reducers/dictionary';
import { createIdsReducer } from './reducers/ids';
import { createPagesReducer } from './reducers/pages';
import { EntityActions } from './actions';
import { createByIdLoadingStatesReducer } from './reducers/loading-states';
import { createEntityLoadingStateReducer } from './reducers/loading-state';

export const createEntityReducer = <T>(
    actionTypes: EntityActionTypes,
): Reducer<EntityState<T>, EntityActions> => combineReducers<EntityState<T>, EntityActions>({
    dictionary: createDictionaryReducer(actionTypes),
    ids: createIdsReducer(actionTypes),
    pages: createPagesReducer(actionTypes),
    loadingStates: createByIdLoadingStatesReducer(actionTypes),
    loadingState: createEntityLoadingStateReducer(actionTypes),
});
