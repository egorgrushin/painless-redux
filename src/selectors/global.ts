import { createSelector } from 'reselect';

export const createSlotSelector = (domainSelector, slotName) =>
	createSelector(domainSelector, (s: any) => s[slotName]);

export const createDomainSelector = (selector, domainName) =>
	createSelector(selector, (s: any) => s[domainName]);

export const createIdsSelector = slotSelector =>
	createSelector(slotSelector, (s: any) => s.ids);

export const createDictionarySelector = slotSelector =>
	createSelector(slotSelector, (s: any) => s.dictionary);

export const createPagesSelector = slotSelector =>
	createSelector(slotSelector, (s: any) => s.pages);
