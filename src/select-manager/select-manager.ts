import { RxStore } from '../system-types';
import { asapScheduler, Observable } from 'rxjs';
import { subscribeOn } from 'rxjs/operators';
import { Selector } from 'reselect';
import { select, snapshot } from '../utils';
import { SelectManager } from './types';

export const createSelectManager = (rxStore: RxStore): SelectManager => {

    const select$ = <T, R>(
        selector: Selector<T, R>,
        isAsap: boolean = false,
    ): Observable<R> => {
        const selectObs = rxStore.pipe(select(selector));
        if (!isAsap) return selectObs;
        return selectObs.pipe(subscribeOn(asapScheduler));
    };

    const snapshotFn = <T, R>(
        selector: Selector<T, R>,
    ): R | undefined => {
        const source$ = select$<T, R>(selector);
        return snapshot<R>(source$);
    };

    return {
        select$,
        snapshot: snapshotFn,
    };

};
