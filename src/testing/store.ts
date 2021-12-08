import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { AnyAction, Reducer, RxStore } from '../system-types';
import { combineReducers } from '../shared/utils';

export class TestStore<T = any> extends BehaviorSubject<T> implements RxStore<T> {
    actions$: ReplaySubject<AnyAction> = new ReplaySubject();
    state: T;

    constructor(
        private initialState: T,
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
        this.reducer = combineReducers<any, AnyAction>({ [key]: reducer });
        this.performDispatch({ type: 'ADD_REDUCER' });
    }

    clear() {
        this.performDispatch({ type: 'TEST_CLEAR' }, this.initialState);
    }

    private performDispatch(
        action: AnyAction,
        state = this.state,
    ) {
        this.state = this.reducer(state, action);
        this.setState(this.state);
    }
}
