import * as React from 'react';
import { FieldTitle, useResourceContext } from 'ra-core';
import { Switch, Typography } from '@mui/material';
import DragIcon from '@mui/icons-material/DragIndicator';
import { styled } from '@mui/material/styles';

/**
 * UI to enable/disable a field
 */
export const FieldToggle = props => {
    const { selected, label, onToggle, onMove, source, index } = props;
    const resource = useResourceContext();
    const dropIndex = React.useRef<number>(null);

    const handleDrag = event => {
        // imperative DOM manipulations using the native Drag API
        const selectedItem = event.target;
        selectedItem.classList.add('drag-active');
        const list = selectedItem.parentNode;
        const x = event.clientX;
        const y = event.clientY;
        let dropItem =
            document.elementFromPoint(x, y) === null
                ? selectedItem
                : document.elementFromPoint(x, y);
        if (dropItem.classList.contains('dragIcon')) {
            dropItem = dropItem.parentNode;
        }
        if (dropItem === selectedItem) {
            return;
        }
        if (list === dropItem.parentNode) {
            dropIndex.current = dropItem.dataset.index;
            if (dropItem === selectedItem.nextSibling) {
                dropItem = dropItem.nextSibling;
            }
            list.insertBefore(selectedItem, dropItem);
        }
    };

    const handleDragEnd = event => {
        const selectedItem = event.target;
        onMove(selectedItem.dataset.index, dropIndex.current);
        selectedItem.classList.remove('drag-active');
    };

    const handleDragOver = event => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    return (
        <Root
            key={source}
            draggable={onMove ? 'true' : undefined}
            onDrag={onMove ? handleDrag : undefined}
            onDragEnd={onMove ? handleDragEnd : undefined}
            onDragOver={onMove ? handleDragOver : undefined}
            data-index={index}
        >
            <label htmlFor={`switch_${index}`}>
                <Switch
                    checked={selected}
                    onChange={onToggle}
                    name={index}
                    id={`switch_${index}`}
                    size="small"
                    sx={{ mr: 0.5, ml: -0.5 }}
                />
                <Typography variant="body2" component="span">
                    <FieldTitle
                        label={label}
                        source={source}
                        resource={resource}
                    />
                </Typography>
            </label>
            {onMove && (
                <DragIcon
                    className="dragIcon"
                    color="disabled"
                    fontSize="small"
                />
            )}
        </Root>
    );
};

const Root = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    '& svg': {
        cursor: 'move',
    },
    '&.drag-active': {
        background: 'transparent',
        color: 'transparent',
        outline: `1px solid ${theme.palette.action.selected}`,
        '& .MuiSwitch-root, & svg': {
            visibility: 'hidden',
        },
    },
}));
