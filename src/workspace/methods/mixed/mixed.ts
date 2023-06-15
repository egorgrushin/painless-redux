import { DeepPartial, LoadingState } from '../../../system-types';
import { Observable } from 'rxjs';
import { ChangeOptions, PatchRequest } from '../../../shared/change/types';
import { v4 } from 'uuid';
import { getPatchByOptions, getResolvePatchByOptions, normalizePatch } from '../../../shared/change/utils';
import { PainlessReduxSchema } from '../../../painless-redux/types';
import { getRemotePipe, guardIfLoading } from '../../../shared/utils';
import { SelectWorkspaceMethods } from '../select/types';
import { DispatchWorkspaceMethods } from '../dispatch/types';
import { MixedWorkspaceMethods } from './types';
import { typedDefaultsDeep } from '../../../utils';

export const createWorkspaceMixedMethods = <T>(
    prSchema: PainlessReduxSchema,
    selectMethods: SelectWorkspaceMethods<T>,
    dispatchMethods: DispatchWorkspaceMethods<T>,
): MixedWorkspaceMethods<T> => {

    const changeRemote$ = (
        patch: PatchRequest<T>,
        dataSource$: Observable<DeepPartial<T> | undefined>,
        label: string,
        options?: ChangeOptions,
    ): Observable<DeepPartial<T>> => {
        options = typedDefaultsDeep(options, { rethrow: true });
        const changeId = v4();
        const { changeWithId, resolveChange, setLoadingState } = dispatchMethods;
        const { getLoadingState$, get$ } = selectMethods;
        const normalizedPatch = normalizePatch(patch, get$());

        const sourcePipe = getRemotePipe<LoadingState | undefined, unknown, DeepPartial<T> | undefined, DeepPartial<T>>({
            options,
            remoteObsOrFactory: dataSource$,
            success: (
                response?: DeepPartial<T>,
            ) => {
                const patchToApply = getPatchByOptions(normalizedPatch, response, options) ?? {};
                return changeWithId(patchToApply, label, changeId, options);
            },
            emitOnSuccess: true,
            optimistic: options?.optimistic,
            optimisticResolve: (
                success: boolean,
                response?: DeepPartial<T>,
            ) => {
                const patchToApply = getResolvePatchByOptions(normalizedPatch, response, options);
                return resolveChange(label, changeId, success, patchToApply, options);
            },
            setLoadingState: (state) => setLoadingState(state),
        });
        const loadingState$ = getLoadingState$(prSchema.useAsapSchedulerInLoadingGuards);
        return guardIfLoading(loadingState$).pipe(sourcePipe);
    };

    return { changeRemote$ };

};
