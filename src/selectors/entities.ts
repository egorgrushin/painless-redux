import { Id, IDictionary } from '../types';
import { createSelector } from '@ngrx/store';

export const createByIdSelector = (dictionarySelector, id: Id) =>
	createSelector(dictionarySelector, (dictionary: IDictionary<any>) => dictionary[id]);
