import {
  FlatfileHook,
  FlatfileHookType,
} from '../types/flatfile_types';
import { FlatfileRecord } from '@flatfile/hooks';

export type FlatfileNumberValueConfig = {
  sheetSlug: string;
  numberFields: string[];
};

export function isNumber(value: string | number): boolean {
  if (typeof value === 'number') {
    return true;
  }

  const flt = parseFloat(value);

  return !isNaN(flt) && isFinite(flt);
}

export function numberValue(config: FlatfileNumberValueConfig): FlatfileHook {
  return {
    type: FlatfileHookType.SINGLE,
    sheetSlug: config.sheetSlug,
    callback: async (record: FlatfileRecord): Promise<void> => {
      config.numberFields.forEach(field => {
        const csvValue = record.get(field);
        if (typeof csvValue?.valueOf() === 'number') {
          // already a number, nothing to do here
          return;
        }

        const stringValue = csvValue?.toString();
        const trimmedValue = stringValue?.trim();

        if (
          typeof trimmedValue !== 'undefined' &&
          stringValue !== trimmedValue
        ) {
          record.set(field, trimmedValue);
        }

        if (!trimmedValue) {
          return;
        }

        if (!isNumber(trimmedValue)) {
          record.addError(field, `"${csvValue}" is not a valid number type`);
        }
      });
    },
  };
}
