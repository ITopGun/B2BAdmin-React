---
layout: default
title: "The ReferenceOneField Component"
---

# `<ReferenceOneField>`

This field fetches a one-to-one relationship, e.g. the details of a book, when using a foreign key on the distant resource.

```
┌──────────────┐       ┌──────────────┐
│ books        │       │ book_details │
│--------------│       │--------------│
│ id           │───┐   │ id           │
│ title        │   └──╼│ book_id      │
│ published_at │       │ genre        │
└──────────────┘       │ ISBN         │
                       └──────────────┘
```

`<ReferenceOneField>` behaves like `<ReferenceManyField>`: it uses the current `record` (a book in this example) to build a filter for the book details with the foreign key (`book_id`). Then, it uses `dataProvider.getManyReference('book_details', { target: 'book_id', id: book.id })` to fetch the related details, and takes the first one.

`<ReferenceOneField>` renders the [`recordRepresentation`](./Resource.md#recordrepresentation) of the related record. It also creates a `RecordContext` with the reference record, so you can use any component relying on this context (`<TextField>`, `<SimpleShowLayout>`, etc.) as child.

For the inverse relationships (the book linked to a book_detail), you can use a [`<ReferenceField>`](./ReferenceField.md).

## Usage

Here is how to render a field of the `book_details` resource inside a Show view for the `books` resource:

```jsx
const BookShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="title" />
            <DateField source="published_at" />
            <ReferenceOneField label="Genre" reference="book_details" target="book_id">
                <TextField source="genre" />
            </ReferenceOneField>
            <ReferenceOneField label="ISBN" reference="book_details" target="book_id">
                <TextField source="ISBN" />
            </ReferenceOneField>
        </SimpleShowLayout>
    </Show>
);
```

**Tip**: As with `<ReferenceField>`, you can call `<ReferenceOneField>` as many times as you need in the same component, react-admin will only make one call to `dataProvider.getManyReference()` per reference.

**Tip**: `<ReferenceOneField>` can also be used to display one record of a one-to-many relationship. Use `sort` and/or `filter` props to select the appropriate record to display. The first record will be displayed.

{% raw %}
```jsx
const BookShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="title" />
            <DateField source="published_at" />
            <ReferenceOneField
                label="Latest cool review"
                reference="book_reviews"
                target="book_id"
                sort={{ field: "createdAt", order: "DESC" }}
                filter={{ rating: 5 }}
            >
                <TextField source="title" />
            </ReferenceOneField>
        </SimpleShowLayout>
    </Show>
);
```
{% endraw %}

## Properties

| Prop           | Required | Type               | Default                          | Description                                                                                                  |
| -------------- | -------- | ------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| `reference`    | Required | `string`                                    | -                                | The name of the resource for the referenced records, e.g. 'book_details'            |
| `target`       | Required | string                                      | -                                | Target field carrying the relationship on the referenced resource, e.g. 'book_id'   |
| `children`     | Optional | `Element`                                   | -                                | The Field element used to render the referenced record                              |
| `filter`       | Optional | `Object`                                    | `{}`                             | Used to filter referenced records                                                   |
| `link`         | Optional | `string | Function`                         | `edit`                           | Target of the link wrapping the rendered child. Set to `false` to disable the link. |
| `queryOptions` | Optional | [`UseQueryOptions`](https://tanstack.com/query/v4/docs/reference/useQuery?from=reactQueryV3&original=https://react-query-v3.tanstack.com/reference/useQuery) | `{}` | `react-query` client options |
| `sort`         | Optional | `{ field: String, order: 'ASC' or 'DESC' }` | `{ field: 'id', order: 'ASC' }`  | Used to order referenced records                                                    |

`<ReferenceOneField>` also accepts the [common field props](./Fields.md#common-field-props), except `emptyText` (use the child `empty` prop instead).
