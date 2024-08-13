import {
  FlatfileHook,
  FlatfileHookType,
} from '../types/flatfile_types';
import { FlatfileRecord } from '@flatfile/hooks';

export type FlatfileTrimValueConfig = {
  sheetSlug: string;
  trimFields: string[];
};

export function trimValue(config: FlatfileTrimValueConfig): FlatfileHook {
  return {
    type: FlatfileHookType.SINGLE,
    sheetSlug: config.sheetSlug,
    callback: async (record: FlatfileRecord): Promise<void> => {
      config.trimFields.forEach(field => {
        const stringValue = record.get(field)?.toString();
        const trimmedValue = stringValue?.trim();

        if (
          typeof trimmedValue !== 'undefined' &&
          stringValue !== trimmedValue
        ) {
          record.set(field, trimmedValue);
        }
      });
    },
  };
}
