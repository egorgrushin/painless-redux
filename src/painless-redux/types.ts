import { Selector } from 'reselect';
import { ActionCreator, AnyAction, Dictionary, Reducer, SameShaped, StrictDictionary } from '../system-types';
import { Dispatcher } from '../dispatcher/types';
import { SelectManager } from '../select-manager/types';

export enum SlotTypes {
    Entity,
    Workspace
}

export interface PainlessReduxSchema {
    name: string;
    entityDomainName: string;
    workspaceDomainName: string;
    selector: Selector<any, any>;
}

export type PainlessReduxRegister = StrictDictionary<SlotTypes, Dictionary<Reducer<any, AnyAction>>, SlotTypes>;

export type PainlessReduxState = Dictionary<any>;


export type PainlessRedux = {
    name: string;
    registerSlot<TState, TActionTypes, TActions extends { type: string }>(
        type: SlotTypes,
        name: string,
        reducer: Reducer<TState, TActions>,
        actionCreators: SameShaped<TActionTypes, ActionCreator<TActionTypes, TActions>>,
    ): {
        selector: Selector<PainlessReduxState, TState>;
        dispatcher: Dispatcher<TActionTypes, TActions>;
        selectManager: SelectManager;
    };
    getReducer(): Reducer<PainlessReduxState, AnyAction>;
}
