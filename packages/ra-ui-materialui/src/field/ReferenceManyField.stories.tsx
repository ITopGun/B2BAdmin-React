import * as React from 'react';

import {
    CoreAdminContext,
    RecordContextProvider,
    ResourceContextProvider,
} from 'ra-core';
import { ThemeProvider, Box } from '@mui/material';
import { createTheme } from '@mui/material/styles';

import { TextField } from '../field';
import { ReferenceManyField } from './ReferenceManyField';
import { Datagrid } from '../list/datagrid/Datagrid';
import { Notification } from '../layout/Notification';

export default { title: 'ra-ui-materialui/fields/ReferenceManyField' };

const author = { id: 1, name: 'Leo Tolstoi' };
let books = [
    { id: 1, title: 'War and Peace', author_id: 1 },
    { id: 2, title: 'Les Misérables', author_id: 2 },
    { id: 3, title: 'Anna Karenina', author_id: 1 },
    { id: 4, title: 'The Count of Monte Cristo', author_id: 3 },
    { id: 5, title: 'Resurrection', author_id: 1 },
];

const defaultDataProvider = {
    getManyReference: (resource, params) => {
        const result = books.filter(book => book.author_id === params.id);
        return Promise.resolve({
            data: result,
            total: result.length,
        });
    },
    deleteMany: (resource, params) => {
        const ids = params.ids;
        books = books.filter(book => !ids.includes(book.id));
        return Promise.resolve({ data: ids });
    },
} as any;

const Wrapper = ({
    children,
    dataProvider = defaultDataProvider,
    record = author,
}: any) => (
    <ThemeProvider theme={createTheme()}>
        <CoreAdminContext dataProvider={dataProvider}>
            <ResourceContextProvider value="authors">
                <RecordContextProvider value={record}>
                    <Box mx={2} mt={7}>
                        {children}
                    </Box>
                </RecordContextProvider>
            </ResourceContextProvider>
            <Notification />
        </CoreAdminContext>
    </ThemeProvider>
);

export const Basic = () => (
    <Wrapper>
        <ReferenceManyField reference="books" target="author_id">
            <Datagrid>
                <TextField source="title" />
            </Datagrid>
        </ReferenceManyField>
    </Wrapper>
);
