# React-Admin

A frontend Framework for building data-driven applications running in the browser on top of REST/GraphQL APIs, using ES6, [React](https://facebook.github.io/react/) and [Material Design](https://material.io/). Open sourced and maintained by [ITopGun](https://github.com/ITopGun).


## Features

* 🔌 **Backend Agnostic**: Connects to any API (REST or GraphQL, see the [list of more than 45 adapters](https://marmelab.com/react-admin/DataProviderList.html))

* 🧩 **All The Building Blocks You Need**: Provides hooks and components for authentication, routing, forms & validation, datagrid, search & filter, relationships, validation, roles & permissions, rich text editor, i18n, notifications, menus, theming, caching, etc.

* 🪡 **High Quality**: Accessibility, responsive, secure, fast, testable

* 💻 **Great Developer Experience**: Complete documentation, IDE autocompletion, type safety, storybook, demo apps with source code, modular architecture, declarative API

* 👑 **Great User Experience**: Optimistic rendering, filter-as-you-type, undo, preferences, saved queries

* 🛠 **Complete Customization**: Replace any component with your own

* ☂️ **Opt-In Types**: Develop either in TypeScript or JavaScript

* 👨‍👩‍👧‍👦 Powered by [MUI](https://mui.com/), [react-hook-form](https://react-hook-form.com), [react-router](https://reacttraining.com/react-router/), [react-query](https://react-query-v3.tanstack.com/), [TypeScript](https://www.typescriptlang.org/) and a few more

## Installation

React-admin is available from npm. You can install it (and its required dependencies)
using:

```sh
npm install react-admin
#or
yarn add react-admin
```

## Documentation

Read the [Tutorial](https://marmelab.com/react-admin/Tutorial.html) for a 30 minutes introduction. After that, head to the [Documentation](https://marmelab.com/react-admin/Readme.html), or checkout the [source code of the demo](https://github.com/marmelab/react-admin-demo) for an example usage.

## At a Glance

```jsx
// in app.js
import * as React from "react";
import { render } from 'react-dom';
import { Admin, Resource } from 'react-admin';
import restProvider from 'ra-data-simple-rest';

import { PostList, PostEdit, PostCreate, PostIcon } from './posts';

render(
    <Admin dataProvider={restProvider('http://localhost:3000')}>
        <Resource name="posts" list={PostList} edit={PostEdit} create={PostCreate} icon={PostIcon} />
    </Admin>,
    document.getElementById('root')
);
```

The `<Resource>` component is a configuration component that allows to define sub components for each of the admin view: `list`, `edit`, and `create`. These components use MUI and custom components from react-admin:

```jsx
// in posts.js
import * as React from "react";
import { List, Datagrid, Edit, Create, SimpleForm, DateField, TextField, EditButton, TextInput, DateInput, useRecordContext } from 'react-admin';
import BookIcon from '@mui/icons-material/Book';
export const PostIcon = BookIcon;

export const PostList = () => (
    <List>
        <Datagrid>
            <TextField source="id" />
            <TextField source="title" />
            <DateField source="published_at" />
            <TextField source="average_note" />
            <TextField source="views" />
            <EditButton />
        </Datagrid>
    </List>
);

const PostTitle = () => {
    const record = useRecordContext();
    return <span>Post {record ? `"${record.title}"` : ''}</span>;
};

export const PostEdit = () => (
    <Edit title={<PostTitle />}>
        <SimpleForm>
            <TextInput disabled source="id" />
            <TextInput source="title" />
            <TextInput source="teaser" options={{ multiline: true }} />
            <TextInput multiline source="body" />
            <DateInput label="Publication date" source="published_at" />
            <TextInput source="average_note" />
            <TextInput disabled label="Nb views" source="views" />
        </SimpleForm>
    </Edit>
);

export const PostCreate = () => (
    <Create title="Create a Post">
        <SimpleForm>
            <TextInput source="title" />
            <TextInput source="teaser" options={{ multiline: true }} />
            <TextInput multiline source="body" />
            <TextInput label="Publication date" source="published_at" />
            <TextInput source="average_note" />
        </SimpleForm>
    </Create>
);
```

## Does It Work With My API?

Yes.

React-admin uses an adapter approach, with a concept called *Data Providers*. Existing providers can be used as a blueprint to design your API, or you can write your own Data Provider to query an existing API. Writing a custom Data Provider is a matter of hours.

![Data Provider architecture](https://marmelab.com/react-admin/img/data-provider.png)

See the [Data Providers documentation](https://marmelab.com/react-admin/DataProviders.html) for details.

## Batteries Included But Removable

React-admin is designed as a library of loosely coupled React components and hooks exposing reusable controller logic. It is very easy to replace any part of react-admin with your own, e.g. to use a custom datagrid, GraphQL instead of REST, or Bootstrap instead of Material Design.

## Examples

There are several examples inside the `examples` folder:

* `simple` ([CodeSandbox](https://codesandbox.io/s/github/marmelab/react-admin/tree/master/examples/simple), [StackBlitz](https://stackblitz.com/github/marmelab/react-admin/tree/master/examples/simple?file=src%2Findex.tsx)): a simple blog with posts, comments and users that we use for our e2e tests.
* `e-commerce`: ([demo](https://marmelab.com/react-admin-demo/), [source](https://github.com/marmelab/react-admin/tree/master/examples/demo)) A fictional poster shop admin, serving as the official react-admin demo.
* `CRM`: ([demo](https://marmelab.com/react-admin-crm/), [source](https://github.com/marmelab/react-admin/tree/master/examples/crm)) A customer relationship management application
* `tutorial` ([CodeSandbox](https://codesandbox.io/s/github/marmelab/react-admin/tree/master/examples/tutorial)): the application built while following the [tutorial](https://marmelab.com/react-admin/Tutorial.html).

You can run those example applications by calling:

```sh
# At the react-admin project root
make install
# or
yarn install

# Run the simple application
make run-simple

# Run the tutorial application
make build
make run-tutorial

# Run the demo application
make build
make run-demo
```

And then browse to the URL displayed in your console.


### Setup

Clone this repository and run `make install` to grab the dependencies, then `make build` to compile the sources from TypeScript to JS.

### Online one-click Setup

You can use Gitpod(An Online Open Source VS Code like IDE which is free for Open Source) for working on issues and making PRs. With a single click it will launch a workspace and automatically clone the repo, run `make install` and `make start` so that you can start straight away.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/from-referrer/)


### Testing Your Changes In Your App

Using `yarn link`, you can have your project use a local checkout of the react-admin package instead of npm. This allows you to test react-admin changes in your app: 

```sh
# Register your local react-admin as a linkable package
$ cd /code/path/to/react-admin/packages/react-admin && yarn link

# Replace the npm-installed version with a symlink to your local version 
$ cd /code/path/to/myapp/ && yarn link react-admin

# If you run into issues with React red-screen, then you need to register your app's version of React as a linkable package 

$ cd /code/path/to/myapp/node_modules/react && yarn link
# And then replace the npm-installed version of React with a symlink to your app's node_modules version
$ cd /code/path/to/react-admin/ && yarn link react

# Rebuild the packages with the same version of React
$ cd /code/path/to/react-admin/ && make build

# Return to your app and ensure all dependencies have resolved 
$ cd /code/path/to/myapp/ && yarn install

# Start your app
$ yarn start
```

### Automated Tests

Automated tests are also crucial in our development process. You can run all the tests (linting, unit and functional tests) by calling:

```sh
make test
```

Unit tests use `jest`, so you should be able to run a subset of tests, or run tests continuously on change, by passing options to 

```sh
yarn jest
```

Besides, tests related to the modified files are run automatically at commit using a git pre-commit hook. This means you won't be able to commit your changes if they break the tests. 

When working on the end-to-end tests, you can leverage [cypress](https://www.cypress.io/) runner by starting the simple example yourself (`make run-simple` or `yarn run-simple`) and starting cypress in another terminal (`make test-e2e-local` or `yarn test-e2e-local`).

### Coding Standards

If you have coding standards problems, you can fix them automatically using `prettier` by calling

```sh
make prettier
```

However, these commands are run automatically at each commit so you shouldn't have to worry about them.

### Documentation

If you want to contribute to the documentation, install [jekyll](https://jekyllrb.com/docs/home/), then call

```sh
make doc
```

And then browse to [http://localhost:4000/](http://localhost:4000/)

## License

React-admin is licensed under the [MIT License](https://github.com/marmelab/react-admin/blob/master/LICENSE.md), sponsored and supported by [marmelab](https://marmelab.com).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmarmelab%2Freact-admin.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fmarmelab%2Freact-admin?ref=badge_large)

<<<<<<< HEAD
## Donate

This library is free to use, even for commercial purpose. If you want to give back, please talk about it, [help newcomers](https://stackoverflow.com/questions/tagged/react-admin), or contribute code. But the best way to give back is to **donate to a charity**. We recommend [Doctors Without Borders](https://www.doctorswithoutborders.org/).
=======
- [✔️React Material Admin](https://github.com/ITopGun/React-MUI-Admin) - React Material Admin — Material-UI Dashboard
- [🚀 React Native Starter](https://github.com/ITopGun/React-Native-Starter) - A powerful react native starter template that bootstraps development of your mobile application
- [🔥 React Dashboard](https://github.com/ITopGun/React-Dashboard.git) - React Dashboard - isomorphic admin dashboard template with GraphQL
- [❤️ Saleor Commerce](https://github.com/ITopGun/Saleore-combyPGDR.git) - A modular, high performance, headless e-commerce platform built with Python, GraphQL, Django, and React.
- [💥 Ant Design](https://github.com/ITopGun/ant-design.git) - An enterprise-class UI design language and React UI library.
- [🎧 RadioWanjy](https://github.com/ITopGun/RadioWanjy.git) - Radios from 471 Arabic and foreign radios.
>>>>>>> 5f74df4912e742c40f82d61e2a4ff0143e1b55b3
