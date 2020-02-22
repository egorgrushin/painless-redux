import { Selector } from 'reselect';
import { Observable } from 'rxjs';

export interface SelectManager {
    select$<T, R>(selector: Selector<T, R>, isAsap?: boolean): Observable<R>;
    snapshot<T, R>(selector: Selector<T, R>): R | undefined;
}
