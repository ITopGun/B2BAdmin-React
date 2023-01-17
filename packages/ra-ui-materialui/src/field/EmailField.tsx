import * as React from 'react';
import { memo, FC } from 'react';
import get from 'lodash/get';
import Typography from '@mui/material/Typography';
import { Link, LinkProps } from '@mui/material';
import { useRecordContext, useTranslate } from 'ra-core';

import { sanitizeFieldRestProps } from './sanitizeFieldRestProps';
import { PublicFieldProps, InjectedFieldProps, fieldPropTypes } from './types';

export const EmailField: FC<EmailFieldProps> = memo(props => {
    const { className, source, emptyText, ...rest } = props;
    const record = useRecordContext(props);
    const value = get(record, source);
    const translate = useTranslate();

    if (value == null) {
        return emptyText ? (
            <Typography
                component="span"
                variant="body2"
                className={className}
                {...sanitizeFieldRestProps(rest)}
            >
                {emptyText && translate(emptyText, { _: emptyText })}
            </Typography>
        ) : null;
    }

    return (
        <Link
            className={className}
            href={`mailto:${value}`}
            onClick={stopPropagation}
            variant="body2"
            {...sanitizeFieldRestProps(rest)}
        >
            {value}
        </Link>
    );
});

EmailField.propTypes = fieldPropTypes;
EmailField.displayName = 'EmailField';

export interface EmailFieldProps
    extends PublicFieldProps,
        InjectedFieldProps,
        Omit<LinkProps, 'textAlign'> {}

// useful to prevent click bubbling in a Datagrid with rowClick
const stopPropagation = e => e.stopPropagation();
