import React from 'react';
import { cleanup } from 'react-testing-library';
import omit from 'lodash/omit';

import renderWithRedux from '../../util/renderWithRedux';
import ReferenceInputController from './ReferenceInputController';

describe('<ReferenceInputController />', () => {
    const defaultProps = {
        basePath: '/comments',
        children: jest.fn(),
        input: { value: undefined } as any,
        onChange: jest.fn(),
        reference: 'posts',
        resource: 'comments',
        source: 'post_id',
    };

    afterEach(cleanup);

    it('should fetch reference matchingReferences, and provide filter pagination and sort', () => {
        const children = jest.fn().mockReturnValue(<p>child</p>);
        const { dispatch } = renderWithRedux(
            <ReferenceInputController
                {...{
                    ...defaultProps,
                    input: { value: 1 } as any,
                    loading: true,
                }}
            >
                {children}
            </ReferenceInputController>,
            {
                admin: {
                    resources: { posts: { data: { 1: { id: 1 } } } },
                    references: {
                        possibleValues: { 'comments@post_id': [2, 1] },
                    },
                },
            }
        );

        expect(
            omit(children.mock.calls[0][0], [
                'onChange',
                'setPagination',
                'setFilter',
                'setSort',
            ])
        ).toEqual({
            choices: [{ id: 1 }],
            error: null,
            filter: { q: '' },
            loading: false,
            pagination: { page: 1, perPage: 25 },
            sort: { field: 'id', order: 'DESC' },
            warning: null,
        });

        expect(dispatch).toBeCalledTimes(2);
        expect(dispatch.mock.calls[0][0].type).toBe(
            'RA/CRUD_GET_MATCHING_ACCUMULATE'
        );
        expect(dispatch.mock.calls[1][0].type).toBe(
            'RA/CRUD_GET_MANY_ACCUMULATE'
        );
    });
});
