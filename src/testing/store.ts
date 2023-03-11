import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { RxStore } from '../system-types';

export class TestStore<T> extends BehaviorSubject<T> implements RxStore<T> {
	actions$: ReplaySubject<T> = new ReplaySubject();

	constructor(initialValue?: any) {
		super(initialValue)
	}

	setState(data: T) {
		this.next(data);
	}

	dispatch(action: any) {
		this.actions$.next(action);
	}

	addReducer(key: string, reducer: any) {}
}
