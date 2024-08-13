import { FlatfileRecord } from '@flatfile/hooks';
import { FlatfileEvent } from '@flatfile/listener';
import { Flatfile } from '@flatfile/api';
import {
  BulkRecordHookOptions,
  RecordHookOptions,
} from '@flatfile/plugin-record-hook';

export const enum FlatfileHookType {
  SINGLE = 'single',
  BULK = 'bulk',
}
interface FlatfileRecordHook {
  sheetSlug: string;
  callback: (
    record: FlatfileRecord,
    event?: FlatfileEvent
  ) => any | Promise<any>;
  options?: RecordHookOptions;
  type: FlatfileHookType.SINGLE;
}
interface FlatfileBulkRecordHook {
  sheetSlug: string;
  callback: (
    records: FlatfileRecord[],
    event?: FlatfileEvent
  ) => any | Promise<any>;
  options?: BulkRecordHookOptions;
  type: FlatfileHookType.BULK;
}
export type FlatfileHook = FlatfileRecordHook | FlatfileBulkRecordHook;

export type FlatfileFormatData = Flatfile.RecordData[] | null;
export type FlatfileFormatDataResource = Promise<FlatfileFormatData>;
export type FlatfileFormatDataSource =
  | FlatfileFormatData
  | FlatfileFormatDataResource;

export type FlatfilePlatformTemplate = {
  name: string;
  sourceSheetSlug: string;
  sheets: Flatfile.SheetConfig[];
  hooks?: FlatfileHook[];
  resourceDataSources?: {
    sheetSlug: string;
    dataSource: FlatfileFormatDataSource;
  }[];
};

export type FlatfilePlatformImportParams = {
  templateId: string;
  useNewEmployeeAPI: boolean;
  mountId?: string;
  onComplete?: ({}) => Promise<void>;
  businessId?: string;
  businessDomain?: string;
  userId?: string;
};

export function createImportParams(
  templateId: string,
  useNewEmployeeAPI: boolean
): FlatfilePlatformImportParams {
  return {
    templateId,
    useNewEmployeeAPI,
  };
}

export const FlatfilePrimaryWorkbookNamespace = 'primary';
