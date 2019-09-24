import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { IRxStore } from '../index';

export class TestStore<T> extends BehaviorSubject<T> implements IRxStore<T> {
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
