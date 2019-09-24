import { PainlessRedux, Slot } from '../index';
import { cold } from 'jest-marbles';
import { TestStore } from './store';
import * as combineReducers from 'combine-reducers';

export const registerSlotsInStore = (store: TestStore<any>, slots: Slot[]) => {
	const painlessRedux = new PainlessRedux(store);
	painlessRedux.registerSlots(slots);
	const reducer = painlessRedux.getReducer();
	const globalReducer = combineReducers({ [painlessRedux.name]: reducer });
	const state = globalReducer({}, { type: 'any' });
	store.setState(state);
	return globalReducer;
};

export const getOrderedMarbleStream = (...items) => {
	const { marble, values } = items.reduce((memo, item, index: number) => {
		const isFrames = typeof item === 'string';
		const isArray = Array.isArray(item);
		let marblePart: string = index.toString();
		if (isFrames) {
			marblePart = item;
		}
		if (isArray) {
			marblePart = `(${item.map((subItem, subIndex) => `${index}${subIndex}`)})`;
		}
		memo.marble += marblePart;
		if (!isFrames) {
			if (isArray) {
				memo.values = item.reduce((subMemo, subItem, subIndex) => {
					subMemo[`${index}${subIndex}`] = subItem;
					return subMemo;
				}, memo.values);
			} else {
				memo.values[index] = item;
			}
		}
		return memo;
	}, { marble: '', values: {} });
	return cold(marble, values);
};
