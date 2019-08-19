import { createSelector } from 'reselect';
import { IPage } from '../types';

export const createPageDomainSelector = (pagesSelector, hash: string) =>
	createSelector(pagesSelector, (pages: any) => pages[hash]);

export const createPageIdsSelector = (pagesSelector, hash: string) =>
	createSelector(createPageDomainSelector(pagesSelector, hash), (page: IPage) => {
		if (!page) return undefined;
		return page.ids;
	});
