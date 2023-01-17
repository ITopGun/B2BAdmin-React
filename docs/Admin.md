---
layout: default
title: "The Admin Component"
---

# The `<Admin>` Component

The `<Admin>` component creates an application with its own state, routing, and controller logic. `<Admin>` requires only a `dataProvider` prop, and at least one child `<Resource>` to work:

```jsx
// in src/App.js
import * as React from "react";

import { Admin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

import { PostList } from './posts';

const App = () => (
    <Admin dataProvider={simpleRestProvider('http://path.to.my.api')}>
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;
```

`<Admin>` children can be [`<Resource>`](./Resource.md) and [`<CustomRoutes>`](./CustomRoutes.md) elements.

Here are all the props accepted by the component:

- [`dataProvider`](#dataprovider)
- [`authProvider`](#authprovider)
- [`i18nProvider`](#i18nprovider)
- [`queryClient`](#queryclient)
- [`title`](#title)
- [`dashboard`](#dashboard)
- [`disableTelemetry`](#disabletelemetry)
- [`catchAll`](#catchall)
- [`menu`](#menu)
- [`theme`](#theme)
- [`layout`](#layout)
- [`loginPage`](#loginpage)
- [`authCallbackPage`](#authcallbackpage)
- [`history`](#history)
- [`basename`](#basename)
- [`ready`](#ready)
- [`requireAuth`](#requireauth)
- [`store`](#store)
- [`notification`](#notification)

## `dataProvider`

The only required prop, it must be an object with the following methods returning a promise:

```jsx
const dataProvider = {
    getList:    (resource, params) => Promise,
    getOne:     (resource, params) => Promise,
    getMany:    (resource, params) => Promise,
    getManyReference: (resource, params) => Promise,
    create:     (resource, params) => Promise,
    update:     (resource, params) => Promise,
    updateMany: (resource, params) => Promise,
    delete:     (resource, params) => Promise,
    deleteMany: (resource, params) => Promise,
}
```

Check [the Data Provider documentation](./DataProviderIntroduction.md) for more details.

The `dataProvider` is also the ideal place to add custom HTTP headers, authentication, etc. The [Data Providers Backends ](./DataProviderList.md) chapters lists available data providers, and you can learn how to build your own in the [Writing a Data Provider](./DataProviderWriting.md) chapter.

## `authProvider`

The `authProvider` prop expect an object with 6 methods, each returning a Promise, to control the authentication strategy:

```jsx
const authProvider = {
    login: params => Promise.resolve(),
    logout: params => Promise.resolve(),
    checkAuth: params => Promise.resolve(),
    checkError: error => Promise.resolve(),
    getIdentity: params => Promise.resolve(),
    getPermissions: params => Promise.resolve(),
};

const App = () => (
    <Admin authProvider={authProvider} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        ...
    </Admin>
);
```

The [Auth Provider documentation](./Authentication.md) explains how to implement these functions in detail.

## `i18nProvider`

The `i18nProvider` props let you translate the GUI. For instance, to switch the UI to French instead of the default English:

```jsx
// in src/i18nProvider.js
import polyglotI18nProvider from 'ra-i18n-polyglot';
import fr from 'ra-language-french';

export const i18nProvider = polyglotI18nProvider(() => fr, 'fr');

// in src/App.js
import { i18nProvider } from './i18nProvider';

const App = () => (
    <Admin 
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
    >
        {/* ... */}
    </Admin>
);
```

The [Translation Documentation](./Translation.md) details this process.

## `queryClient`

React-admin uses [react-query](https://react-query-v3.tanstack.com/) to fetch, cache and update data. Internally, the `<Admin>` component creates a react-query [`QueryClient`](https://react-query-v3.tanstack.com/reference/QueryClient) on mount, using [react-query's "aggressive but sane" defaults](https://react-query-v3.tanstack.com/guides/important-defaults):

* Queries consider cached data as stale
* Stale queries are refetched automatically in the background when:
  * New instances of the query mount
  * The window is refocused
  * The network is reconnected
  * The query is optionally configured with a refetch interval
* Query results that are no longer used in the current page are labeled as "inactive" and remain in the cache in case they are used again at a later time.
* By default, "inactive" queries are garbage collected after 5 minutes.
* Queries that fail are silently retried 3 times, with exponential backoff delay before capturing and displaying an error to the UI.
* Query results by default are structurally shared to detect if data has actually changed and if not, the data reference remains unchanged to better help with value stabilization with regards to `useMemo` and `useCallback`. 

If you want to override the react-query default query and mutation default options, or use a specific client or mutation cache, you can create your own `QueryClient` instance and pass it to the `<Admin queryClient>` prop:

```jsx
import { Admin } from 'react-admin';
import { QueryClient } from 'react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            structuralSharing: false,
        },
        mutations: {
            retryDelay: 10000,
        },
    },
});

const App = () => (
    <Admin queryClient={queryClient} dataProvider={...}>
        ...
    </Admin>
);
```

To know which options you can pass to the `QueryClient` constructor, check the [react-query documentation](https://react-query-v3.tanstack.com/reference/QueryClient) and the [query options](https://react-query-v3.tanstack.com/reference/useQuery) and [mutation options](https://react-query-v3.tanstack.com/reference/useMutation) sections.

The common settings that react-admin developers often overwrite are:

```jsx
import { QueryClient } from 'react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            /**
             * The time in milliseconds after data is considered stale.
             * If set to `Infinity`, the data will never be considered stale.
             */
            staleTime: 10000,
            /**
             * If `false`, failed queries will not retry by default.
             * If `true`, failed queries will retry infinitely., failureCount: num
             * If set to an integer number, e.g. 3, failed queries will retry until the failed query count meets that number.
             * If set to a function `(failureCount, error) => boolean` failed queries will retry until the function returns false.
             */
            retry: false,
            /**
             * If set to `true`, the query will refetch on window focus if the data is stale.
             * If set to `false`, the query will not refetch on window focus.
             * If set to `'always'`, the query will always refetch on window focus.
             * If set to a function, the function will be executed with the latest data and query to compute the value.
             * Defaults to `true`.
             */
            refetchOnWindowFocus: false,
        },
    },
});
```

## `title`

On error pages, the header of an admin app uses 'React Admin' as the main app title. Use the `title` to customize it.

```jsx
const App = () => (
    <Admin title="My Custom Admin" dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

## `dashboard`

By default, the homepage of an admin app is the `list` of the first child `<Resource>`. But you can also specify a custom component instead. To fit in the general design, use MUI's `<Card>` component, and react-admin's `<Title>` component to set the title in the AppBar:

```jsx
// in src/Dashboard.js
import * as React from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Title } from 'react-admin';
export default () => (
    <Card>
        <Title title="Welcome to the administration" />
        <CardContent>Lorem ipsum sic dolor amet...</CardContent>
    </Card>
);
```

```jsx
// in src/App.js
import * as React from "react";
import { Admin } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

import Dashboard from './Dashboard';

const App = () => (
    <Admin dashboard={Dashboard} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

![Custom home page](./img/dashboard.png)

## `disableTelemetry`

In production, react-admin applications send an anonymous request on mount to a telemetry server operated by marmelab. You can see this request by looking at the Network tab of your browser DevTools:

`https://react-admin-telemetry.marmelab.com/react-admin-telemetry`

The only data sent to the telemetry server is the admin domain (e.g. "example.com") - no personal data is ever sent, and no cookie is included in the response. The react-admin team uses these domains to track the usage of the framework.

You can opt out of telemetry by simply adding `disableTelemetry` to the `<Admin>` component:

```jsx
// in src/App.js
import * as React from "react";
import { Admin } from 'react-admin';

const App = () => (
    <Admin disableTelemetry>
        // ...
    </Admin>
);
```

## `catchAll`

When users type URLs that don't match any of the children `<Resource>` components, they see a default "Not Found" page.

![Not Found](./img/not-found.png)

You can customize this page to use the component of your choice by passing it as the `catchAll` prop. To fit in the general design, use MUI's `<Card>` component, and react-admin's `<Title>` component:

```jsx
// in src/NotFound.js
import * as React from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Title } from 'react-admin';

export default () => (
    <Card>
        <Title title="Not Found" />
        <CardContent>
            <h1>404: Page not found</h1>
        </CardContent>
    </Card>
);
```

```jsx
// in src/App.js
import * as React from "react";
import { Admin } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

import NotFound from './NotFound';

const App = () => (
    <Admin catchAll={NotFound} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

**Tip**: If your custom `catchAll` component contains react-router `<Route>` components, this allows you to register new routes displayed within the react-admin layout easily. Note that these routes will match *after* all the react-admin resource routes have been tested. To add custom routes *before* the react-admin ones, and therefore override the default resource routes, see the [`custom pages`](./CustomRoutes.md) section instead.

## ~~`menu`~~

**Tip**: This prop is deprecated. To override the menu component, use a [custom layout](#layout) instead.

React-admin uses the list of `<Resource>` components passed as children of `<Admin>` to build a menu to each resource with a `<List>` component.

If you want to add or remove menu items, for instance to link to non-resources pages, you can create your own menu component:

```jsx
// in src/MyMenu.js
import * as React from 'react';
import { createElement } from 'react';
import { useMediaQuery } from '@mui/material';
import { Menu, useResourceDefinitions } from 'react-admin';
import LabelIcon from '@mui/icons-material/Label';

export const MyMenu = () => {
    const isXSmall = useMediaQuery(theme => theme.breakpoints.down('xs'));
    const resources = useResourceDefinitions();
    
    return (
        <Menu>
            {Object.keys(resources).map(name => (
                <Menu.Item
                    key={name}
                    to={`/${name}`}
                    primaryText={resources[name].options && resources[name].options.label || name}
                    leftIcon={createElement(resources[name].icon)}
                />
            ))}
            <Menu.Item to="/custom-route" primaryText="Miscellaneous" leftIcon={<LabelIcon />} />
        </Menu>
    );
};
```

**Tip**: `<Menu.Item>` must be used to avoid unwanted side effects in mobile views. It supports a custom text and icon (which must be a MUI `<SvgIcon>`).

Then, pass it to the `<Admin>` component as the `menu` prop:

```jsx
// in src/App.js
import { MyMenu } from './Menu';

const App = () => (
    <Admin menu={MyMenu} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

See the [Theming documentation](./Theming.md#using-a-custom-menu) for more details.

## `theme`

MUI supports [theming](https://mui.com/customization/themes). This lets you customize the look and feel of an admin by overriding fonts, colors, and spacing. You can provide a custom MUI theme by using the `theme` prop:

```jsx
import { defaultTheme } from 'react-admin';

const theme = {
    ...defaultTheme,
    palette: {
        mode: 'dark', // Switching the dark mode on is a single property value change.
    },
};

const App = () => (
    <Admin theme={theme} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

![Dark theme](./img/dark-theme.png)

For more details on predefined themes and custom themes, refer to [the Theming chapter](./Theming.md#global-theme-overrides) of the react-admin documentation.

## `layout`

If you want to deeply customize the app header, the menu, or the notifications, the best way is to provide a custom layout component. It must contain a `{children}` placeholder, where react-admin will render the resources. 

React-admin offers predefined layouts for you to use:

- [`<Layout>`](./Layout.md): The default layout. It renders a top app bar and the navigation menu in a side bar.
- [`<ContainerLayout>`](./ContainerLayout.md): A centered layout with horizontal navigation.

```jsx
import { Admin } from 'react-admin';
import { ContainerLayout } from '@react-admin/ra-navigation';

export const App = () => (
    <Admin dataProvider={dataProvider} layout={ContainerLayout}>
        // ...
    </Admin>
);
```

These layouts can be customized by passing props to them. For instance, you can pass a custom `appBar` prop to `<Layout>` to override the default app bar:

```jsx
// in src/MyLayout.js
import { Layout } from 'react-admin';
import MyAppBar from './MyAppBar';

export const MyLayout = (props) => <Layout {...props} appBar={MyAppBar} />;
```

Then, pass it to the `<Admin>` component as the `layout` prop:

```jsx
// in src/App.js
import { Admin } from 'react-admin';
import { MyLayout } from './MyLayout';

const App = () => (
    <Admin dataProvider={dataProvider} layout={MyLayout}>
        // ...
    </Admin>
);
```

Refer to each component documentation to understand the props it accepts.

Finally, you can also pass a custom component as the `layout` prop. It must contain a `{children}` placeholder, where react-admin will render the content. Use the [default `<Layout>`](https://github.com/marmelab/react-admin/blob/master/packages/ra-ui-materialui/src/layout/Layout.tsx) as a starting point, and check [the Theming documentation](./Theming.md#using-a-custom-layout) for examples.

## `loginPage`

If you want to customize the Login page, or switch to another authentication strategy than a username/password form, pass a component of your own as the `loginPage` prop. React-admin will display this component whenever the `/login` route is called.

```jsx
import MyLoginPage from './MyLoginPage';

const App = () => (
    <Admin loginPage={MyLoginPage}>
        ...
    </Admin>
);
```

You can also disable it completely along with the `/login` route by passing `false` to this prop.

See The [Authentication documentation](./Authentication.md#customizing-the-login-component) for more details.

**Tip**: Before considering writing your own login page component, please take a look at how to change the default [background image](./Theming.md#using-a-custom-login-page) or the [MUI theme](#theme). See the [Authentication documentation](./Authentication.md#customizing-the-login-component) for more details.

## `authCallbackPage`

React-admin apps contain a special route called `/auth-callback` to let external authentication providers (like Auth0, Cognito, OIDC servers) redirect users after login. This route renders the `AuthCallback` component by default, which in turn calls `authProvider.handleCallback`. 

If you need a different behavior for this route, you can render a custom component by passing it as the `authCallbackPage` prop.

```jsx
import MyAuthCallbackPage from './MyAuthCallbackPage';

const App = () => (
    <Admin authCallbackPage={MyAuthCallbackPage}>
        ...
    </Admin>
);
```

**Note**: You should seldom use this option, even when using an external authentication provider. Since you can already define the `/auth-callback` route controller via `authProvider.handleCallback`, the `authCallbackPage` prop is only useful when you need the user's feedback after they logged in.

You can also disable the `/auth-callback` route altogether by passing `authCallbackPage={false}`.

See The [Authentication documentation](./Authentication.md#using-external-authentication-providers) for more details.

## ~~`history`~~

**Note**: This prop is deprecated. Check [the Routing chapter](./Routing.md) to see how to use a different router.

By default, react-admin creates URLs using a hash sign (e.g. "myadmin.acme.com/#/posts/123"). The hash portion of the URL (i.e. `#/posts/123` in the example) contains the main application route. This strategy has the benefit of working without a server, and with legacy web browsers. But you may want to use another routing strategy, e.g. to allow server-side rendering.

You can create your own `history` function (compatible with [the `history` npm package](https://github.com/reacttraining/history)), and pass it to the `<Admin>` component to override the default history strategy. For instance, to use `browserHistory`:

```jsx
import * as React from "react";
import { createBrowserHistory as createHistory } from 'history';

const history = createHistory();

const App = () => (
    <Admin history={history}>
        ...
    </Admin>
);
```

## `basename`

Use this prop to make all routes and links in your Admin relative to a "base" portion of the URL pathname that they all share. This is required when using the [`BrowserHistory`](https://github.com/remix-run/history/blob/main/docs/api-reference.md#createbrowserhistory) to serve the application under a sub-path of your domain (for example https://marmelab.com/ra-enterprise-demo), or when embedding react-admin inside a single-page app with its own routing.

```jsx
import { Admin } from 'react-admin';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();
const App = () => (
    <Admin basename="/admin" history={history}>
        ...
    </Admin>
);
```

See [Using React-Admin In A Sub Path](./Routing.md#using-react-admin-in-a-sub-path) for more usage examples.

## `ready`

When you run an `<Admin>` with no child `<Resource>` nor `<CustomRoutes>`, react-admin displays a "ready" screen:

![Empty Admin](./img/tutorial_empty.png)

You can replace that "ready" screen by passing a custom component as the `ready` prop:

```jsx
import * as React from 'react';
import { Admin } from 'react-admin';

const Ready = () => (
    <div>
        <h1>Admin ready</h1>
        <p>You can now add resources</p>
    </div>
)

const App = () => (
    <Admin ready={Ready}>
        ...
    </Admin>
);
```

## `requireAuth`

Some pages in react-admin apps may allow anonymous access. For that reason, react-admin starts rendering the page layout before knowing if the user is logged in. If all the pages require authentication, this default behaviour creates an unwanted "flash of UI" for users who never logged in, before the `authProvider` redirects them to the login page.

If you know your app will never accept anonymous access, you can force the app to wait for the `authProvider.checkAuth()` to resolve before rendering the page layout, by setting the `<Admin requireAuth>` prop.

```jsx
const App = () => (
    <Admin dataProvider={dataProvider} authProvider={authProvider} requireAuth>
        <Resource name="posts" list={PostList} />
    </Admin>
);
```

## `store`

The `<Admin>` component initializes a [Store](./Store.md) using `localStorage` as the storage engine. You can override this by passing a custom `store` prop:

```jsx
import { Admin, Resource, memoryStore } from 'react-admin';

const App = () => (
    <Admin dataProvider={dataProvider} store={memoryStore()}>
        <Resource name="posts" />
    </Admin>
);
```

## `notification`

You can override the notification component, for instance to change the notification duration. A common use case is to change the `autoHideDuration`, and force the notification to remain on screen longer than the default 4 seconds. For instance, to create a custom Notification component with a 5 seconds default:

```jsx
// in src/MyNotification.js
import { Notification } from 'react-admin';

const MyNotification = () => <Notification autoHideDuration={5000} />;

export default MyNotification;
```

To use this custom notification component, pass it to the `<Admin>` component as the `notification` prop:

```jsx
// in src/App.js
import MyNotification from './MyNotification';
import dataProvider from './dataProvider';

const App = () => (
    <Admin notification={MyNotification} dataProvider={dataProvider}>
        // ...
    </Admin>
);
```

## Declaring resources at runtime

You might want to dynamically define the resources when the app starts. To do so, you have two options: using a function as `<Admin>` child, or unplugging it to use a combination of `AdminContext` and `<AdminUI>` instead.

### Using a Function As `<Admin>` Child

The `<Admin>` component accepts a function as one of its children and this function can return a Promise. If you also defined an `authProvider`, the child function will receive the result of a call to `authProvider.getPermissions()` (you can read more about this in the [Auth Provider](./Authentication.md#enabling-auth-features) chapter).

For instance, getting the resource from an API might look like:

```jsx
import * as React from "react";
import { Admin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

import { PostList } from './posts';
import { CommentList } from './comments';

const knownResources = [
    <Resource name="posts" list={PostList} />,
    <Resource name="comments" list={CommentList} />,
];

const fetchResources = permissions =>
    fetch('https://myapi/resources', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(permissions),
    })
    .then(response => response.json())
    .then(json => knownResources.filter(resource => json.resources.includes(resource.props.name)));

const App = () => (
    <Admin dataProvider={simpleRestProvider('http://path.to.my.api')}>
        {fetchResources}
    </Admin>
);
```

### Unplugging the `<Admin>` using `<AdminContext>` and `<AdminUI>`

Setting Resources dynamically using the children-as-function syntax may not be enough in all cases, because this function can't execute hooks.

So it's impossible, for instance, to have a dynamic list of resources based on a call to the `dataProvider` (since the `dataProvider` is only defined after the `<Admin>` component renders).

To overcome this limitation, you can build your own `<Admin>` component using two lower-level components: `<AdminContext>` (responsible for putting the providers in contexts) and `<AdminUI>` (responsible for displaying the UI). Through this approach you'll have to bring your own i18n provider and store. Luckily react-admin provides easy to use defaults for you. Here is an example:

``` jsx
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
    AdminContext,
    AdminUI,
    defaultI18nProvider,
    localStorageStore,
    Resource,
    ListGuesser,
    Loading,
    useDataProvider,
} from 'react-admin';

const store = localStorageStore();

function App() {
    return (
        <AdminContext dataProvider={myDataProvider} i18nProvider={defaultI18nProvider} store={store}>
            <AsyncResources />
        </AdminContext>
    );
}

function AsyncResources() {
    const [resources, setResources] = useState([]);
    const dataProvider = useDataProvider();

    useEffect(() => {
        // Note that the `getResources` is not provided by react-admin. You have to implement your own custom verb.
        dataProvider.getResources().then(r => setResources(r));
    }, []);

    return (
        <AdminUI ready={Loading}>
            {resources.map(resource => (
                <Resource name={resource.name} key={resource.key} list={ListGuesser} />
            ))}
        </AdminUI>
    );
}
```

In this example, we override the `<AdminUI ready>` component to prevent the admin from displaying [the ready screen](#ready) in development while the list of resources is empty.
