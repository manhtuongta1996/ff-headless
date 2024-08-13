import {
  FlatfileHook,
  FlatfileHookType,
} from '../types/flatfile_types';
import { FlatfileRecord } from '@flatfile/hooks';

export type FlatfileBooleanValueConfig = {
  sheetSlug: string;
  booleanFields: string[];
};

export function booleanValue(config: FlatfileBooleanValueConfig): FlatfileHook {
  return {
    type: FlatfileHookType.SINGLE,
    sheetSlug: config.sheetSlug,
    callback: async (record: FlatfileRecord): Promise<void> => {
      config.booleanFields.forEach(field => {
        const csvValue = record.get(field);
        const stringValue = csvValue?.toString();
        const booleanValue = stringValue?.trim();

        if (
          typeof booleanValue !== 'undefined' &&
          stringValue !== booleanValue
        ) {
          record.set(field, booleanValue);
        }

        if (!booleanValue) {
          return;
        }

        switch (booleanValue.toLowerCase()) {
          case 'true':
          case '1':
          case 'yes':
          case 'y':
            record.set(field, true);
            break;
          case 'false':
          case '0':
          case 'no':
          case 'n':
            record.set(field, false);
            break;
          default:
            record.addError(field, `"${csvValue}" is not a valid boolean type`);
        }
      });
    },
  };
}
