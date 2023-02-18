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
import { isNil, values } from 'lodash-es';
import { getChangeableActual } from '../shared/change/selectors';

export const createDictionarySelector = <T, TPageMetadata>(
    selector: Selector<PainlessReduxState, EntityState<T, TPageMetadata>>,
): DictionarySelector<T, TPageMetadata> =>
    createSelector(selector, (s) => s.dictionary);

export const createIdsSelector = <T, TPageMetadata>(
    selector: Selector<PainlessReduxState, EntityState<T, TPageMetadata>>,
): IdsSelector<T, TPageMetadata> =>
    createSelector(selector, (s) => s.ids);

export const createPagesSelector = <T, TPageMetadata>(
    selector: Selector<PainlessReduxState, EntityState<T, TPageMetadata>>,
): PagesSelector<T, TPageMetadata> =>
    createSelector(selector, (s) => s.pages);

export const createLoadingStatesSelector = <T, TPageMetadata>(
    selector: Selector<PainlessReduxState, EntityState<T, TPageMetadata>>,
): LoadingStatesSelector<T, TPageMetadata> =>
    createSelector(selector, (s) => s.loadingStates);

const createCreateLoadingStateById = <T, TPageMetadata>(
    selector: LoadingStatesSelector<T, TPageMetadata>,
) => (id: Id) => createSelector(
    selector,
    (loadingStates) => loadingStates[id],
);
const createCreateLoadingStateByIds = <T, TPageMetadata>(
    selector: LoadingStatesSelector<T, TPageMetadata>,
) => (ids: Id[]) => createSelector(
    selector,
    (loadingStates) => ids.reduce((memo: LoadingState, id: Id) => {
        const loadingState = loadingStates[id];
        memo.isLoading = memo.isLoading || (loadingState?.isLoading ?? false);
        memo.error = memo.error || loadingState?.error;
        return memo;
    }, { isLoading: false }),
);

export const createBaseEntitySelectors = <T, TPageMetadata>(
    selector: Selector<PainlessReduxState, EntityState<T, TPageMetadata>>,
): BaseEntitySelectors<T, TPageMetadata> => {
    const ids = createIdsSelector(selector);
    const dictionary = createDictionarySelector(selector);
    const pages = createPagesSelector(selector);
    const loadingState = createLoadingStateSelector<EntityState<T, TPageMetadata>>(selector);
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

export const createCreateActualSelector = <T, TPageMetadata>(
    dictionarySelector: DictionarySelector<T, TPageMetadata>,
) => (
    id: Id,
): ActualSelector<T, TPageMetadata> => createSelector(
    dictionarySelector,
    (dictionary) => getActual(dictionary[id]),
);
export const createListSelectorFromPages = <T, TPageMetadata>(
    pagesSelector: PagesSelector<T, TPageMetadata>,
): PagesListSelector<T, TPageMetadata> => createSelector(
    pagesSelector,
    (pages) => values(pages),
);

export const createListSelector = <T, TPageMetadata>(
    dictionarySelector: DictionarySelector<T, TPageMetadata>,
) => (
    idsSelector: IdsSelector<T, TPageMetadata>,
): ListSelector<T, TPageMetadata> => createSelector(
    idsSelector,
    dictionarySelector,
    (ids, dict) => {
        if (!ids) return undefined;
        return ids.map(id => getActual(dict[id]))
            .filter((actual) => !isNil(actual)) as T[];
    },
);

export const createPageSelector = <T, TPageMetadata>(
    pagesSelector: PagesSelector<T, TPageMetadata>,
    hash: string,
): PageSelector<T, TPageMetadata> =>
    createSelector(pagesSelector, (pages) => pages[hash]);

export const createCreatePageIdsSelector = <T, TPageMetadata>(pagesSelector: PagesSelector<T, TPageMetadata>) => (
    hash: string,
): IdsSelector<T, TPageMetadata> => {
    const pageSelector = createPageSelector<T, TPageMetadata>(pagesSelector, hash);
    return createSelector(
        pageSelector,
        (page: Page<TPageMetadata> | undefined) => {
            if (!page) return undefined;
            return page.ids;
        },
    );
};

export const createCreatePageIdsByConfigSelector = <T, TPageMetadata>(
    pagesSelector: PagesSelector<T, TPageMetadata>,
    hashFn: HashFn,
) => (
    config: unknown,
): IdsSelector<T, TPageMetadata> => {
    const hash = hashFn(config);
    return createCreatePageIdsSelector<T, TPageMetadata>(pagesSelector)(hash);
};

export const createCreatePageByConfigSelector = <T, TPageMetadata>(
    pagesSelector: PagesSelector<T, TPageMetadata>,
    hashFn: HashFn,
) => (
    config: unknown,
): PageSelector<T, TPageMetadata> => {
    const hash = hashFn(config);
    return createPageSelector<T, TPageMetadata>(pagesSelector, hash);
};

export const createCreatePageLoadingState = <T, TPageMetadata>(
    pagesSelector: PagesSelector<T, TPageMetadata>,
    hashFn: HashFn,
) => (
    config: unknown,
): LoadingStateSelector<EntityState<T, TPageMetadata>> => {
    const hash = hashFn(config);
    const pageSelector = createPageSelector<T, TPageMetadata>(pagesSelector, hash);
    return createSelector(
        pageSelector,
        (page) => page?.loadingState,
    );
};

// TODO(egorgrushin): refactor here
export const createEntitySelectors = <T, TPageMetadata>(
    selector: Selector<PainlessReduxState, EntityState<T, TPageMetadata>>,
    hashFn: HashFn,
): EntitySelectors<T, TPageMetadata> => {
    const {
        dictionary,
        loadingStates,
        loadingState,
        pages,
        ids,
        createLoadingStateById,
        createLoadingStateByIds,
    } = createBaseEntitySelectors<T, TPageMetadata>(selector);
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
