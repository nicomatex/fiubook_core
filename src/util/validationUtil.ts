import { createError } from '@errors/errorParser';

interface StringMap {
    [attr: string]: any;
}

const validateAttributeLimits = (
    entityName: string,
    entity: StringMap,
    limits: StringMap,
    limitNamesForAttributes: { attr: string; limit: string }[]
) => {
    limitNamesForAttributes.forEach(({ attr, limit }) => {
        const currentAttrLength = entity[attr]?.length;
        if (!currentAttrLength) return;

        const attrMaxLength = limits[limit];

        if (currentAttrLength >= attrMaxLength) {
            throw createError(
                400,
                `${entityName} ${attr} length must be lower than ${attrMaxLength} (current ${currentAttrLength})`
            );
        }
    });
};

export { validateAttributeLimits };
