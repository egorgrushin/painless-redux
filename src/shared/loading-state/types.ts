import { LoadingState } from '../../system-types';
import { Selector } from 'reselect';

export interface LoadingStateState {
    loadingState?: LoadingState;
}

export interface LoadingStateSetOptions {

}

export interface LoadingStateActionTypes {
    SET_LOADING_STATE: 'SET_LOADING_STATE';
}

export type LoadingStateSelector<T> = Selector<T, LoadingState | undefined>

export interface LoadingStateSelectors<T> {
    loadingState: LoadingStateSelector<T>;
}

