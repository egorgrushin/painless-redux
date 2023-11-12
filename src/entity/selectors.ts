import { createSelector, Selector } from 'reselect';
import {
    ActualSelector,
    BaseEntitySelectors,
    DictionarySelector,
    EntityInstanceState,
    EntitySelectors,
    EntityState,
    EntityType,
    IdsSelector,
    ListSelector,
    LoadingStatesSelector,
    Page,
    PageSelector,
    PagesListSelector,
    PagesSelector,
} from './types';
import { PainlessReduxState } from '../painless-redux/types';
import { HashFn, Id, LoadingState } from '../system-types';
import { createLoadingStateSelector } from '../shared/loading-state/selectors';
import { LoadingStateSelector } from '../shared/loading-state/types';
import { isNil, values } from 'lodash';
import { getChangeableActual } from '../shared/change/selectors';

export const createDictionarySelector = <T>(
    selector: Selector<PainlessReduxState, EntityState<T>>,
): DictionarySelector<T> =>
    createSelector(selector, (s) => s.dictionary);

export const createIdsSelector = <T>(
    selector: Selector<PainlessReduxState, EntityState<T>>,
): IdsSelector<T> =>
    createSelector(selector, (s) => s.ids);

export const createPagesSelector = <T>(
    selector: Selector<PainlessReduxState, EntityState<T>>,
): PagesSelector<T> =>
    createSelector(selector, (s) => s.pages);

export const createLoadingStatesSelector = <T>(
    selector: Selector<PainlessReduxState, EntityState<T>>,
): LoadingStatesSelector<T> =>
    createSelector(selector, (s) => s.loadingStates);

const createCreateLoadingStateById = <T>(
    selector: LoadingStatesSelector<T>,
) => (id: Id) => createSelector(
    selector,
    (loadingStates) => loadingStates[id],
);
const createCreateLoadingStateByIds = <T>(
    selector: LoadingStatesSelector<T>,
) => (ids: Id[]) => createSelector(
    selector,
    (loadingStates) => ids.reduce((memo: LoadingState, id: Id) => {
        const loadingState = loadingStates[id];
        memo.isLoading = memo.isLoading || (loadingState?.isLoading ?? false);
        memo.error = memo.error || loadingState?.error;
        return memo;
    }, { isLoading: false }),
);

export const createBaseEntitySelectors = <T>(
    selector: Selector<PainlessReduxState, EntityState<T>>,
): BaseEntitySelectors<T> => {
    const ids = createIdsSelector(selector);
    const dictionary = createDictionarySelector(selector);
    const pages = createPagesSelector(selector);
    const loadingState = createLoadingStateSelector<EntityState<T>>(selector);
    const loadingStates = createLoadingStatesSelector(selector);
    const createLoadingStateById = createCreateLoadingStateById(loadingStates);
    const createLoadingStateByIds = createCreateLoadingStateByIds(loadingStates);

    return {
        ids,
        dictionary,
        pages,
        loadingState,
        loadingStates,
        createLoadingStateById,
        createLoadingStateByIds,
    };
};

const getActual = <T>(
    instance: EntityInstanceState<T> | undefined,
): EntityType<T> | undefined => {
    if (!instance || instance.removed) return undefined;
    return getChangeableActual(instance);
};

export const createCreateActualSelector = <T>(
    dictionarySelector: DictionarySelector<T>,
) => (
    id: Id,
): ActualSelector<T> => createSelector(
    dictionarySelector,
    (dictionary) => getActual(dictionary[id]),
);
export const createListSelectorFromPages = <T>(
    pagesSelector: PagesSelector<T>,
): PagesListSelector<T> => createSelector(
    pagesSelector,
    (pages) => values(pages),
);

export const createListSelector = <T>(
    dictionarySelector: DictionarySelector<T>,
) => (
    idsSelector: IdsSelector<T>,
): ListSelector<T> => createSelector(
    idsSelector,
    dictionarySelector,
    (ids, dict) => {
        if (!ids) return undefined;
        return ids.map(id => getActual(dict[id]))
            .filter((actual) => !isNil(actual)) as T[];
    },
);

export const createPageSelector = <T>(
    pagesSelector: PagesSelector<T>,
    hash: string,
): PageSelector<T> =>
    createSelector(pagesSelector, (pages) => pages[hash]);

export const createCreatePageIdsSelector = <T>(pagesSelector: PagesSelector<T>) => (
    hash: string,
): IdsSelector<T> => {
    const pageSelector = createPageSelector<T>(pagesSelector, hash);
    return createSelector(
        pageSelector,
        (page: Page | undefined) => {
            if (!page) return undefined;
            return page.ids;
        },
    );
};

export const createCreatePageIdsByConfigSelector = <T>(
    pagesSelector: PagesSelector<T>,
    hashFn: HashFn,
) => (
    config: unknown,
): IdsSelector<T> => {
    const hash = hashFn(config);
    return createCreatePageIdsSelector<T>(pagesSelector)(hash);
};

export const createCreatePageByConfigSelector = <T>(
    pagesSelector: PagesSelector<T>,
    hashFn: HashFn,
) => (
    config: unknown,
): PageSelector<T> => {
    const hash = hashFn(config);
    return createPageSelector<T>(pagesSelector, hash);
};

export const createCreatePageLoadingState = <T>(
    pagesSelector: PagesSelector<T>,
    hashFn: HashFn,
) => (
    config: unknown,
): LoadingStateSelector<EntityState<T>> => {
    const hash = hashFn(config);
    const pageSelector = createPageSelector<T>(pagesSelector, hash);
    return createSelector(
        pageSelector,
        (page) => page?.loadingState,
    );
};

// TODO(egorgrushin): refactor here
export const createEntitySelectors = <T>(
    selector: Selector<PainlessReduxState, EntityState<T>>,
    hashFn: HashFn,
): EntitySelectors<T> => {
    const {
        dictionary,
        loadingStates,
        loadingState,
        pages,
        ids,
        createLoadingStateById,
        createLoadingStateByIds,
    } = createBaseEntitySelectors<T>(selector);
    const createListSelectorByIds = createListSelector(dictionary);
    const all = createListSelectorByIds(ids);
    const allPages = createListSelectorFromPages(pages);

    const createActual = createCreateActualSelector(dictionary);
    const createPageIds = createCreatePageIdsSelector(pages);
    const createPageIdsByConfig = createCreatePageIdsByConfigSelector(pages, hashFn);
    const createPage = createCreatePageByConfigSelector(pages, hashFn);
    const createPageLoadingState = createCreatePageLoadingState(pages, hashFn);

    const createPageListByConfig = (config: unknown) => {
        const pageIdsSelector = createPageIdsByConfig(config);
        return createListSelectorByIds(pageIdsSelector);
    };

    return {
        dictionary,
        ids,
        pages,
        loadingStates,
        loadingState,
        all,
        createActual,
        createPageIds,
        createPageIdsByConfig,
        createListSelectorByIds,
        createPageListByConfig,
        createPage,
        createPageLoadingState,
        createLoadingStateById,
        createLoadingStateByIds,
        allPages,
    };
};
