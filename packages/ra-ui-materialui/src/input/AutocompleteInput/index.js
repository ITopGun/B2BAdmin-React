import React, { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { makeStyles } from '@material-ui/core/styles';
import Downshift from 'downshift';
import { useTranslate, useInput } from 'ra-core';

import AutocompleteInputTextField from './AutocompleteInputTextField';
import AutocompleteSuggestionList from './AutocompleteSuggestionList';
import getSuggestionsFactory from './getSuggestions';
import { InputHelperText } from '..';

const useStyles = makeStyles({
    container: {
        flexGrow: 1,
        position: 'relative',
    },
    root: {},
    suggestionsContainer: {
        zIndex: 2,
    },
    suggestionsPaper: {
        maxHeight: '50vh',
        overflowY: 'auto',
    },
    suggestionsList: {
        margin: 0,
        padding: 0,
        listStyleType: 'none',
    },
});

/**
 * An Input component for an autocomplete field, using an array of objects for the options
 *
 * Pass possible options as an array of objects in the 'choices' attribute.
 *
 * By default, the options are built from:
 *  - the 'id' property as the option value,
 *  - the 'name' property an the option text
 * @example
 * const choices = [
 *    { id: 'M', name: 'Male' },
 *    { id: 'F', name: 'Female' },
 * ];
 * <AutocompleteInput source="gender" choices={choices} />
 *
 * You can also customize the properties to use for the option name and value,
 * thanks to the 'optionText' and 'optionValue' attributes.
 * @example
 * const choices = [
 *    { _id: 123, full_name: 'Leo Tolstoi', sex: 'M' },
 *    { _id: 456, full_name: 'Jane Austen', sex: 'F' },
 * ];
 * <AutocompleteInput source="author_id" choices={choices} optionText="full_name" optionValue="_id" />
 *
 * `optionText` also accepts a function, so you can shape the option text at will:
 * @example
 * const choices = [
 *    { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
 *    { id: 456, first_name: 'Jane', last_name: 'Austen' },
 * ];
 * const optionRenderer = choice => `${choice.first_name} ${choice.last_name}`;
 * <AutocompleteInput source="author_id" choices={choices} optionText={optionRenderer} />
 *
 * The choices are translated by default, so you can use translation identifiers as choices:
 * @example
 * const choices = [
 *    { id: 'M', name: 'myroot.gender.male' },
 *    { id: 'F', name: 'myroot.gender.female' },
 * ];
 *
 * However, in some cases (e.g. inside a `<ReferenceInput>`), you may not want
 * the choice to be translated. In that case, set the `translateChoice` prop to false.
 * @example
 * <AutocompleteInput source="gender" choices={choices} translateChoice={false}/>
 *
 * The object passed as `options` props is passed to the material-ui <AutoComplete> component
 *
 * @example
 * <AutocompleteInput source="author_id" options={{ fullWidth: true }} />
 */
const AutocompleteInput = ({
    classes: classesOverride,
    allowEmpty,
    choices,
    fullWidth,
    helperText,
    // id may have been initialized before (from ReferenceInput for example)
    id: idOverride,
    // input may have been initialized before (from ReferenceInput for example)
    input: inputOverride,
    // isRequired may have been initialized before (from ReferenceInput for example)
    isRequired: isRequiredOverride,
    label,
    limitChoicesToValue,
    // input may have been initialized before (from ReferenceInput for example)
    meta: metaOverride,
    onBlur,
    onChange,
    onFocus,
    options,
    optionText,
    optionValue,
    pagination,
    resource,
    setFilter,
    setPagination,
    setSort,
    shouldRenderSuggestions: shouldRenderSuggestionsOverride,
    sort,
    source,
    suggestionComponent,
    translateChoice,
    validate,
    ...rest
}) => {
    const translate = useTranslate();
    const classes = useStyles({ classes: classesOverride });
    const {
        id,
        input,
        isRequired,
        meta: { touched, error },
    } = useInput({
        id: idOverride,
        input: inputOverride,
        isRequired: isRequiredOverride,
        meta: metaOverride,
        onBlur,
        onChange,
        onFocus,
        resource,
        source,
        type: 'checkbox',
        validate,
        ...rest,
    });

    let inputEl = useRef();
    let anchorEl = useRef();

    const updateFilter = useCallback(
        value => {
            if (setFilter) {
                setFilter(value);
            }
        },
        [setFilter]
    );

    // We must reset the filter every time the value change to ensures we
    // display at least some choices even if the input has a value.
    // Otherwise, it would only display the currently selected one and the user
    // would have to first clear the input before seeing any other choices
    useEffect(() => {
        updateFilter('');
    }, [input.value, updateFilter]);

    const getSuggestionValue = useCallback(
        suggestion => get(suggestion, optionValue),
        [optionValue]
    );

    const getSuggestionFromValue = useCallback(
        value => choices.find(choice => get(choice, optionValue) === value),
        [choices, optionValue]
    );

    const getSuggestionText = useCallback(
        suggestion => {
            if (!suggestion) return '';

            const suggestionLabel =
                typeof optionText === 'function'
                    ? optionText(suggestion)
                    : get(suggestion, optionText, '');

            // We explicitly call toString here because AutoSuggest expect a string
            return translateChoice
                ? translate(suggestionLabel, { _: suggestionLabel }).toString()
                : suggestionLabel.toString();
        },
        [optionText, translate, translateChoice]
    );

    const handleSuggestionSelected = useCallback(
        suggestion => {
            input.onChange(getSuggestionValue(suggestion));
        },
        [getSuggestionValue, input]
    );

    const updateAnchorEl = () => {
        if (!inputEl.current) {
            return;
        }

        const inputPosition = inputEl.current.getBoundingClientRect();

        if (!anchorEl.current) {
            anchorEl.current = { getBoundingClientRect: () => inputPosition };
        } else {
            const anchorPosition = anchorEl.current.getBoundingClientRect();

            if (
                anchorPosition.x !== inputPosition.x ||
                anchorPosition.y !== inputPosition.y
            ) {
                anchorEl.current = {
                    getBoundingClientRect: () => inputPosition,
                };
            }
        }
    };

    const shouldRenderSuggestions = val => {
        if (
            shouldRenderSuggestionsOverride !== undefined &&
            typeof shouldRenderSuggestionsOverride === 'function'
        ) {
            return shouldRenderSuggestionsOverride(val);
        }

        return true;
    };

    const storeInputRef = input => {
        inputEl.current = input;
        updateAnchorEl();
    };

    const initialSelectedItem = getSuggestionFromValue(input.value);

    const getSuggestions = useCallback(
        getSuggestionsFactory({
            choices,
            allowEmpty,
            optionText,
            optionValue,
            limitChoicesToValue,
            getSuggestionText,
            initialSelectedItem: initialSelectedItem,
        }),
        [
            choices,
            allowEmpty,
            optionText,
            optionValue,
            limitChoicesToValue,
            getSuggestionText,
            input,
        ]
    );

    // Override the blur event handling to automatically select
    // the only choice available if any
    const handleBlur = useCallback(
        (suggestionFilter, selectItem) => event => {
            const possibleSuggestions = getSuggestions(
                suggestionFilter,
                input.value
            );

            let suggestionToSelect;

            if (possibleSuggestions.length === 2 && allowEmpty) {
                if (input.value === null) {
                    return input.onBlur(event);
                }

                if (suggestionFilter === '') {
                    suggestionToSelect = possibleSuggestions.find(
                        suggestion => suggestion.id === null
                    );
                } else {
                    suggestionToSelect = possibleSuggestions.find(
                        suggestion => suggestion.id !== null
                    );
                }
            }

            if (possibleSuggestions.length === 1) {
                suggestionToSelect = possibleSuggestions.find(
                    suggestion => suggestion.id !== null
                );
            }

            if (possibleSuggestions.length === 0) {
                suggestionToSelect = choices.find(
                    choice => getSuggestionValue(choice) === input.value
                );
            }

            if (suggestionToSelect) {
                selectItem(suggestionToSelect);
            }

            return input.onBlur(event);
        },
        [allowEmpty, choices, getSuggestionValue, getSuggestions, input]
    );

    const handleFocus = useCallback(
        openMenu => event => {
            openMenu(event);
            input.onFocus(event);
        },
        [input]
    );

    return (
        <Downshift
            id={id}
            onChange={handleSuggestionSelected}
            initialSelectedItem={initialSelectedItem}
            itemToString={item => getSuggestionText(item)}
            {...rest}
        >
            {({
                getInputProps,
                getLabelProps,
                getItemProps,
                getMenuProps,
                highlightedIndex,
                isOpen,
                inputValue: suggestionFilter,
                selectItem,
                selectedItem,
                openMenu,
            }) => {
                const isMenuOpen = isOpen && shouldRenderSuggestions();
                return (
                    <div className={classes.container}>
                        <AutocompleteInputTextField
                            id={id}
                            fullWidth={fullWidth}
                            labelProps={getLabelProps({ label })}
                            InputProps={getInputProps({
                                id,
                                name: input.name,
                                onBlur: handleBlur(
                                    suggestionFilter,
                                    selectItem
                                ),
                                onFocus: handleFocus(openMenu),
                            })}
                            inputRef={storeInputRef}
                            source={source}
                            resource={resource}
                            isRequired={isRequired}
                            handleChange={updateFilter}
                            helperText={
                                <InputHelperText
                                    touched={touched}
                                    error={error}
                                    helperText={helperText}
                                />
                            }
                            error={!!(touched && error)}
                        />
                        <AutocompleteSuggestionList
                            isOpen={isMenuOpen}
                            menuProps={getMenuProps(
                                {},
                                { suppressRefError: true }
                            )}
                            inputEl={inputEl.current}
                            suggestions={getSuggestions(suggestionFilter)}
                            getSuggestionText={getSuggestionText}
                            getSuggestionValue={getSuggestionValue}
                            highlightedIndex={highlightedIndex}
                            inputValue={suggestionFilter}
                            getItemProps={getItemProps}
                            suggestionComponent={suggestionComponent}
                            suggestionsContainerProps={
                                options.suggestionsContainerProps
                            }
                            selectedItem={selectedItem}
                        />
                    </div>
                );
            }}
        </Downshift>
    );
};

AutocompleteInput.propTypes = {
    allowEmpty: PropTypes.bool,
    alwaysRenderSuggestions: PropTypes.bool, // used only for unit tests
    choices: PropTypes.arrayOf(PropTypes.object),
    classes: PropTypes.object,
    className: PropTypes.string,
    InputProps: PropTypes.object,
    label: PropTypes.string,
    limitChoicesToValue: PropTypes.bool,
    options: PropTypes.object,
    optionText: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
        .isRequired,
    optionValue: PropTypes.string.isRequired,
    resource: PropTypes.string,
    setFilter: PropTypes.func,
    shouldRenderSuggestions: PropTypes.func,
    source: PropTypes.string,
    suggestionComponent: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.func,
    ]),
    translateChoice: PropTypes.bool.isRequired,
};

AutocompleteInput.defaultProps = {
    choices: [],
    options: {},
    optionText: 'name',
    optionValue: 'id',
    limitChoicesToValue: false,
    translateChoice: true,
};

export default AutocompleteInput;
