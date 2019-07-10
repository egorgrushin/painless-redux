import { createLoadingStatesByIdReducer } from './loadingStateByIdFactory';
import { createLoadingStateReducer } from './loadingStateFactory';
import { combineReducers } from '@ngrx/store';
import { IStoreLoadingStateActionTypes } from '../types';

export const createLoadingStatesReducer = (types: IStoreLoadingStateActionTypes) => combineReducers({
	global: createLoadingStateReducer(types),
	byId: createLoadingStatesByIdReducer(types),
});
