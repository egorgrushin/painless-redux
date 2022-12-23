import { Id, IDictionary } from '../types';
import { createSelector } from 'reselect';

export const createByIdSelector = (dictionarySelector, id: Id) =>
	createSelector(dictionarySelector, (dictionary: IDictionary<any>) => dictionary[id]);
