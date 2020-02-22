import { cold } from 'jest-marbles';
import { TestStore } from './store';
// @ts-ignore
import * as combineReducers from 'combine-reducers';
import { PainlessRedux } from '../painless-redux/types';


export const initStoreWithPr = (
    store: TestStore<any>,
    pr: PainlessRedux,
) => {
    const reducer = pr.getReducer();
    const globalReducer = combineReducers({ [pr.name]: reducer });
    const state = globalReducer({}, { type: 'any' });
    store.setState(state);
    return globalReducer;
};

export const getOrderedMarbleStream = (...items: any) => {
    const { marble, values } = items.reduce((
        memo: any,
        item: any,
        index: number,
    ) => {
        const isFrames = typeof item === 'string';
        const isArray = Array.isArray(item);
        let marblePart: string = index.toString();
        if (isFrames) {
            marblePart = item;
        }
        if (isArray) {
            marblePart = `(${item.map((
                subItem: any,
                subIndex: number,
            ) => `${index}${subIndex}`)})`;
        }
        memo.marble += marblePart;
        if (!isFrames) {
            if (isArray) {
                memo.values = item.reduce((
                    subMemo: any,
                    subItem: any,
                    subIndex: number,
                ) => {
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
