import { LoadingState } from '../../system-types';
import { Selector } from 'reselect';

export interface LoadingStateState {
    loadingState?: LoadingState;
}

export interface LoadingStateSetOptions {

}

export interface LoadingStateActionTypes {
    SET_STATE: 'SET_STATE';
}

export type LoadingStateSelector<T> = Selector<T, LoadingState | undefined>


export interface LoadingStateSelectors<T> {
    loadingState: LoadingStateSelector<T>;
}

