import { useEffect } from 'react';
// @ts-ignore
import { useDispatch, useSelector } from 'react-redux';
import get from 'lodash/get';

import { crudGetManyAccumulate } from '../../actions';
import { linkToRecord } from '../../util';
import { Record, ReduxState } from '../../types';

export type LinkToFunctionType = (record: Record, reference: string) => string;

type LinkToType = string | boolean | LinkToFunctionType;

interface Option {
    allowEmpty?: boolean;
    basePath: string;
    record?: Record;
    reference: string;
    resource: string;
    source: string;
    link: LinkToType;
    linkType?: LinkToType; // deprecated, use link instead
}

export interface UseReferenceProps {
    isLoading: boolean;
    referenceRecord: Record;
    resourceLinkPath: string | false;
}

/**
 * @typedef ReferenceProps
 * @type {Object}
 * @property {boolean} isLoading: boolean indicating if the reference has loaded
 * @property {Object} referenceRecord: the referenced record.
 * @property {string | false} resourceLinkPath link to the page of the related record (depends on link) (false is no link)
 */

/**
 * Fetch reference record, and return it when avaliable
 *
 * The reference prop sould be the name of one of the <Resource> components
 * added as <Admin> child.
 *
 * @example
 *
 * const { isLoading, referenceRecord, resourceLinkPath } = useReference({
 *     source: 'userId',
 *     reference: 'users',
 *     record: {
 *         userId: 7
 *     }
 * });
 *
 * @param {Object} option
 * @param {boolean} option.allowEmpty do we allow for no referenced record (default to false)
 * @param {string} option.basePath basepath to current resource
 * @param {string | false | LinkToFunctionType} option.link="edit" The link toward the referenced record. 'edit', 'show' or false for no link (default to edit). Alternatively a function that returns a string
 * @param {string | false | LinkToFunctionType} [option.linkType] DEPRECATED : old name for link
 * @param {Object} option.record The The current resource record
 * @param {string} option.reference The linked resource name
 * @param {string} option.resource The current resource name
 * @param {string} option.source The key of the linked resource identifier
 *
 * @returns {ReferenceProps} The reference props
 */
export const useReference = ({
    allowEmpty = false,
    basePath,
    link = 'edit',
    linkType,
    record = { id: '' },
    reference,
    resource,
    source,
}: Option): UseReferenceProps => {
    const sourceId = get(record, source);
    const referenceRecord = useSelector(
        getReferenceRecord(sourceId, reference)
    );
    const dispatch = useDispatch();
    useEffect(() => {
        if (sourceId !== null && typeof sourceId !== 'undefined') {
            dispatch(crudGetManyAccumulate(reference, [sourceId]));
        }
    }, [sourceId, reference]); // eslint-disable-line react-hooks/exhaustive-deps
    const rootPath = basePath.replace(resource, reference);
    // Backward compatibility: keep linkType but with warning
    const getResourceLinkPath = (linkTo: LinkToType) =>
        !linkTo
            ? false
            : typeof linkTo === 'function'
            ? linkTo(record, reference)
            : linkToRecord(rootPath, sourceId, linkTo as string);

    if (linkType !== undefined) {
        console.warn(
            "The 'linkType' prop is deprecated and should be named to 'link' in <ReferenceField />"
        );
    }

    const resourceLinkPath = getResourceLinkPath(
        linkType !== undefined ? linkType : link
    );

    return {
        isLoading: !referenceRecord && !allowEmpty,
        referenceRecord,
        resourceLinkPath,
    };
};

const getReferenceRecord = (sourceId, reference) => (state: ReduxState) =>
    state.admin.resources[reference] &&
    state.admin.resources[reference].data[sourceId];

export default useReference;