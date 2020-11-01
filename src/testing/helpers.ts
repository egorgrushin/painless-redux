import { cold } from 'jest-marbles';
import { TestStore } from './store';
// @ts-ignore
import * as combineReducers from 'combine-reducers';
import { PainlessRedux } from '../painless-redux/types';
import { EntityActionTypes } from '../entity/types';
import { createEntityActionCreators } from '../entity/action-creators';
import { Reducer } from '../system-types';
import { EntityActions } from '../entity/actions';

export const initStoreWithPr = (
    store: TestStore<any>,
    pr: PainlessRedux,
) => {
    const reducer = pr.getReducer();
    const globalReducer = combineReducers<any>({ [pr.name]: reducer });
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

export const createTestHelpers = <T>(
    reducerFactory: <T>(types: EntityActionTypes) => Reducer<any, EntityActions>,
) => {
    const types: EntityActionTypes = {
        ADD: 'ADD',
        RESOLVE_ADD: 'RESOLVE_ADD',
        ADD_LIST: 'ADD_LIST',
        SET_LOADING_STATE: 'SET_LOADING_STATE',
        CHANGE: 'CHANGE',
        RESOLVE_CHANGE: 'RESOLVE_CHANGE',
        REMOVE: 'REMOVE',
        RESOLVE_REMOVE: 'RESOLVE_REMOVE',
        RESTORE_REMOVED: 'RESTORE_REMOVED',
        REMOVE_LIST: 'REMOVE_LIST',
        RESTORE_REMOVED_LIST: 'RESTORE_REMOVED_LIST',
        CLEAR: 'CLEAR',
        CLEAR_ALL: 'CLEAR_ALL',
        BATCH: 'BATCH',
        SET_LOADING_STATES: 'SET_LOADING_STATES',
        CHANGE_LIST: 'CHANGE_LIST',
        RESOLVE_CHANGE_LIST: 'RESOLVE_CHANGE_LIST',
    };

    const actionCreators = createEntityActionCreators<T>(types);
    const reducer = reducerFactory<T>(types);
    return { actionCreators, reducer };
};
