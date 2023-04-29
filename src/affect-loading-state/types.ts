import { LoadingState } from '../system-types';

export interface AffectStateSetter<T = any, E = any> {
    (
        loadingState: LoadingState<E>,
        isInterrupted: boolean,
        value: T | undefined,
    ): void;
}
