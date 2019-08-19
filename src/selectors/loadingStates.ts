import { createSelector } from 'reselect';
import { Id, IDictionary, ILoadingState, IPage } from '../types';
import { createPageDomainSelector } from './pages';

export const createLoadingStateSelector = selector =>
	createSelector(selector, (slot: any) => slot.loadingState);

export const createLoadingStatesGlobalSelector = selector =>
	createSelector(selector, (s: any) => s.loadingStates.global || {});

export const createLoadingStatesByIdsSelector = selector =>
	createSelector(selector, (s: any) => s.loadingStates.byId);

export const createLoadingStateByKeySelector = (selector, key: string) =>
	createSelector(selector, (loadingState: ILoadingState) => (loadingState.byKeys || {})[key]);

export const createLoadingStatesByIdSelector = (loadingStatesByIdsSelector, id: Id) =>
	createSelector(loadingStatesByIdsSelector, (byIds: IDictionary<any>) => byIds[id] || {});

export const createPageLoadingStateSelector = (pagesSelector, hash: string) =>
	createSelector(createPageDomainSelector(pagesSelector, hash), (page: IPage) => {
		if (!page) return undefined;
		return page.loadingState || {};
	});
