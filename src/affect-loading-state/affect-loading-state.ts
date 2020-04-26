import { EMPTY, Observable, of, OperatorFunction, throwError } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { AffectStateSetter } from './types';

export const affectLoadingStateOperatorFactory = <T, E>(
    setter: AffectStateSetter<T, E>,
    rethrow: boolean = true,
) => (
    ...pipes: Array<OperatorFunction<any, any>>
): OperatorFunction<any, any> => (
    source: Observable<T>,
) => {
    let stateCleared: boolean;
    return (source as any).pipe(
        tap((value: T) => {
            setter?.({ isLoading: true, error: undefined }, false, value);
            stateCleared = false;
        }),
        switchMap((value: T) => (of(value) as any).pipe(
            ...pipes,
            catchError((error: E) => {
                setter?.({ isLoading: false, error }, false, undefined);
                stateCleared = true;
                return rethrow ? throwError(error) : EMPTY;
            }),
        )),
        tap((value: T) => {
            setter?.({ isLoading: false }, false, value);
            stateCleared = true;
        }),
        finalize(() => {
            if (stateCleared) return;
            setter?.({ isLoading: false }, true, undefined);
        }),
    );
};

export const affectLoadingStateFactory = <T, E>(
    setter: AffectStateSetter<T, E>,
    rethrow: boolean = true,
) => (
    ...pipes: Array<OperatorFunction<any, any> | Observable<T>>
): OperatorFunction<T, T> => {
    const obs = pipes[0];
    const isObs = obs instanceof Observable;
    const operatorFactory = affectLoadingStateOperatorFactory<T, E>(setter, rethrow);
    if (!isObs) return operatorFactory(...pipes as OperatorFunction<T, T>[]);
    const operator = operatorFactory(switchMap(() => obs));
    return (of(undefined) as any).pipe(operator);
};
