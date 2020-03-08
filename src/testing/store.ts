import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { AnyAction, Reducer, RxStore } from '../system-types';
// @ts-ignore
import * as combineReducers from 'combine-reducers';

export class TestStore<T = any> extends BehaviorSubject<T> implements RxStore<T> {
    actions$: ReplaySubject<AnyAction> = new ReplaySubject();
    state: T;

    constructor(
        initialState: T,
        private reducer: Reducer<T, AnyAction>,
    ) {
        super(initialState);
        this.state = initialState;
    }

    setState(data: T) {
        this.next(data);
    }

    dispatch(
        action: AnyAction,
    ) {
        this.actions$.next(action);
        this.performDispatch(action);
    }

    addReducer(
        key: string,
        reducer: any,
    ) {
        this.reducer = combineReducers({ [key]: reducer });
        this.performDispatch({ type: 'ADD_REDUCER' });
    }

    private performDispatch(
        action: AnyAction,
    ) {
        this.state = this.reducer(this.state, action);
        this.setState(this.state);
    }
}
