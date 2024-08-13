import { FlatfileRecord, TPrimitive } from '@flatfile/hooks';
import {
  FlatfileHook,
  FlatfileHookType,
} from '../types/flatfile_types';

export type FlatfileDefaultValueConfig = {
  sheetSlug: string;
  fieldSlug: string;
  defaultValue: TPrimitive;
};

// Sets the default value for the target field if it's empty, a fillback for the absent "default" attribute in blueprint
export function defaultValue(config: FlatfileDefaultValueConfig): FlatfileHook {
  return {
    type: FlatfileHookType.SINGLE,
    sheetSlug: config.sheetSlug,
    callback: async (record: FlatfileRecord): Promise<void> => {
      if (record.get(config.fieldSlug) === null) {
        record.set(config.fieldSlug, config.defaultValue);
        return;
      }
    },
  };
}
