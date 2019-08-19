import { createLoadingStatesByIdReducer } from './loadingStateByIdFactory';
import { createLoadingStateReducer } from './loadingStateFactory';
import * as combineReducers  from 'combine-reducers';
import { IStoreLoadingStateActionTypes } from '../types';

export const createLoadingStatesReducer = (types: IStoreLoadingStateActionTypes) => combineReducers({
	global: createLoadingStateReducer(types),
	byId: createLoadingStatesByIdReducer(types),
});
