/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
import React from 'react';
import PropTypes from 'prop-types';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import compose from 'recompose/compose';
import classnames from 'classnames';
import { withStyles } from 'material-ui/styles';

import Header from '../layout/Header';
import Title from '../layout/Title';
import DefaultPagination from './Pagination';
import DefaultBulkActions from './BulkActions';
import DefaultActions from './ListActions';
import { translate, CoreList } from 'react-admin-core';
import defaultTheme from '../defaultTheme';

const styles = {
    root: {},
    actions: {},
    header: {},
    noResults: { padding: 20 },
};

const sanitizeRestProps = ({
    children,
    classes,
    className,
    filters,
    pagination,
    actions,
    resource,
    hasCreate,
    hasEdit,
    hasDelete,
    hasList,
    hasShow,
    filter,
    filterValues,
    crudGetList,
    changeListParams,
    perPage,
    title,
    data,
    ids,
    total,
    isLoading,
    translate,
    version,
    push,
    history,
    locale,
    location,
    match,
    options,
    params,
    permissions,
    query: q,
    selectedIds,
    setSelectedIds,
    sort,
    theme,
    toggleItem,
    ...rest
}) => rest;

export const InnerList = ({
    actions = <DefaultActions />,
    basePath,
    bulkActions = <DefaultBulkActions />,
    children,
    className,
    classes = {},
    currentSort,
    data,
    defaultTitle,
    displayedFilters,
    filters,
    filterValues,
    hasCreate,
    hideFilter,
    ids,
    isLoading,
    onSelect,
    onToggleItem,
    onUnselectItems,
    page,
    pagination = <DefaultPagination />,
    perPage,
    refresh,
    resource,
    selectedIds,
    setFilters,
    setPage,
    setSort,
    showFilter,
    title,
    total,
    translate,
    version,
    ...rest
}) => {
    const titleElement = <Title title={title} defaultTitle={defaultTitle} />;

    return (
        <div
            className={classnames('list-page', classes.root, className)}
            {...sanitizeRestProps(rest)}
        >
            <Card style={{ opacity: isLoading ? 0.8 : 1 }}>
                <Header
                    className={classes.header}
                    title={titleElement}
                    actions={React.cloneElement(actions, {
                        className: classes.actions,
                    })}
                    actionProps={{
                        basePath,
                        bulkActions,
                        displayedFilters,
                        filters,
                        filterValues,
                        hasCreate,
                        onUnselectItems,
                        refresh,
                        resource,
                        selectedIds,
                        showFilter,
                    }}
                />
                {filters &&
                    React.cloneElement(filters, {
                        displayedFilters,
                        filterValues,
                        hideFilter,
                        resource,
                        setFilters,
                        context: 'form',
                    })}
                {isLoading || total > 0 ? (
                    <div key={version}>
                        {ids.length > 0 &&
                            children &&
                            React.cloneElement(children, {
                                basePath,
                                currentSort,
                                data,
                                hasBulkActions: !!bulkActions,
                                ids,
                                isLoading,
                                onSelect,
                                onToggleItem,
                                resource,
                                selectedIds,
                                setSort,
                            })}
                        {!isLoading &&
                            !ids.length && (
                                <CardContent style={styles.noResults}>
                                    <Typography variant="body1">
                                        {translate(
                                            'ra.navigation.no_more_results',
                                            {
                                                page,
                                            }
                                        )}
                                    </Typography>
                                </CardContent>
                            )}
                        {pagination &&
                            React.cloneElement(pagination, {
                                page,
                                perPage,
                                setPage,
                                total,
                            })}
                    </div>
                ) : (
                    <CardContent className={classes.noResults}>
                        <Typography variant="body1">
                            {translate('ra.navigation.no_results')}
                        </Typography>
                    </CardContent>
                )}
            </Card>
        </div>
    );
};

/**
 * List page component
 *
 * The <List> component renders the list layout (title, buttons, filters, pagination),
 * and fetches the list of records from the REST API.
 * It then delegates the rendering of the list of records to its child component.
 * Usually, it's a <Datagrid>, responsible for displaying a table with one row for each post.
 *
 * In Redux terms, <List> is a connected component, and <Datagrid> is a dumb component.
 *
 * Props:
 *   - title
 *   - perPage
 *   - sort
 *   - filter (the permanent filter to apply to the query)
 *   - actions
 *   - filters (a React Element used to display the filter form)
 *   - pagination
 *
 * @example
 *     const PostFilter = (props) => (
 *         <Filter {...props}>
 *             <TextInput label="Search" source="q" alwaysOn />
 *             <TextInput label="Title" source="title" />
 *         </Filter>
 *     );
 *     export const PostList = (props) => (
 *         <List {...props}
 *             title="List of posts"
 *             sort={{ field: 'published_at' }}
 *             filter={{ is_published: true }}
 *             filters={<PostFilter />}
 *         >
 *             <Datagrid>
 *                 <TextField source="id" />
 *                 <TextField source="title" />
 *                 <EditButton />
 *             </Datagrid>
 *         </List>
 *     );
 */
export const List = ({
    actions = <DefaultActions />,
    bulkActions = <DefaultBulkActions />,
    children,
    classes = {},
    className,
    filter,
    filters,
    hasCreate,
    hasDelete,
    hasEdit,
    hasList,
    hasShow,
    location,
    match,
    pagination = <DefaultPagination />,
    perPage,
    resource,
    sort,
    title,
    translate,
    ...rest
}) => {
    return (
        <CoreList
            {...{
                filter,
                hasCreate,
                hasDelete,
                hasEdit,
                hasList,
                hasShow,
                location,
                match,
                perPage,
                resource,
                sort,
            }}
        >
            {({
                basePath,
                currentSort,
                data,
                defaultTitle,
                displayedFilters,
                filterValues,
                hideFilter,
                ids,
                isLoading,
                onSelect,
                onToggleItem,
                onUnselectItems,
                page,
                perPage,
                refresh,
                selectedIds,
                setFilters,
                setPage,
                setSort,
                showFilter,
                total,
                version,
            }) => (
                <InnerList
                    {...{
                        actions,
                        basePath,
                        bulkActions,
                        children,
                        className,
                        classes,
                        currentSort,
                        data,
                        defaultTitle,
                        displayedFilters,
                        filters,
                        filterValues,
                        hasCreate,
                        hideFilter,
                        ids,
                        isLoading,
                        onSelect,
                        onToggleItem,
                        onUnselectItems,
                        page,
                        pagination,
                        perPage,
                        refresh,
                        resource,
                        selectedIds,
                        setFilters,
                        setPage,
                        setSort,
                        showFilter,
                        title,
                        total,
                        translate,
                        version,
                        ...rest,
                    }}
                />
            )}
        </CoreList>
    );
};

List.propTypes = {
    // the props you can change
    actions: PropTypes.element,
    bulkActions: PropTypes.oneOfType([PropTypes.element, PropTypes.bool]),
    children: PropTypes.node,
    classes: PropTypes.object,
    className: PropTypes.string,
    filter: PropTypes.object,
    filters: PropTypes.element,
    pagination: PropTypes.element,
    perPage: PropTypes.number.isRequired,
    sort: PropTypes.shape({
        field: PropTypes.string,
        order: PropTypes.string,
    }),
    title: PropTypes.any,
    // the props managed by react-admin
    authProvider: PropTypes.func,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    filterValues: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    hasCreate: PropTypes.bool.isRequired,
    hasEdit: PropTypes.bool.isRequired,
    hasDelete: PropTypes.bool.isRequired,
    hasList: PropTypes.bool.isRequired,
    hasShow: PropTypes.bool.isRequired,
    ids: PropTypes.array,
    selectedIds: PropTypes.array,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    path: PropTypes.string,
    resource: PropTypes.string.isRequired,
    translate: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
};

List.defaultProps = {
    filter: {},
    filterValues: {},
    perPage: 10,
    theme: defaultTheme,
};

const EnhancedList = compose(translate, withStyles(styles));

export default EnhancedList(List);
