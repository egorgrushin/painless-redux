import { LoadingState } from '../system-types';
import { Observable, OperatorFunction } from 'rxjs';

export interface AffectStateSetter<T = any, E = any> {
    (
        loadingState: LoadingState<E>,
        isInterrupted: boolean,
        value: T | undefined,
    ): void;
}

export interface AffectLoadingStateFactory {
    <T>(...pipes: Array<OperatorFunction<any, any>>): OperatorFunction<T, T>;

    <T>(observable: Observable<T>): Observable<T>;

    <T>(...pipesOrObs: any): OperatorFunction<T, T> | Observable<T>;
}
