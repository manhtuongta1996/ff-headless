import {
    FlatfileFormatData,
    FlatfileHook,
    FlatfileHookType,
  } from '../types/flatfile_types';
  import { FlatfileRecord } from '@flatfile/hooks';
  
  export type FlatFileStateCountryCheckConfig = {
    sheetSlug: string;
    stateField: string;
    countryField: string;
    referenceData: FlatfileFormatData;
  };
  
  export function stateCountryCheck(
    config: FlatFileStateCountryCheckConfig
  ): FlatfileHook {
    return {
      type: FlatfileHookType.SINGLE,
      sheetSlug: config.sheetSlug,
      callback: async (record: FlatfileRecord): Promise<void> => {
        if (!record.get(config.stateField) || !record.get(config.countryField)) {
          // The target field is empty, so we don't need to check anything else
          return;
        }
  
        let stateName = record.get(config.stateField)?.toString();
        let countryName = record.get(config.countryField)?.toString();
  
        if (stateName && countryName && config.referenceData) {
          stateName = stateName.trim().toLowerCase();
          countryName = countryName.trim().toLowerCase();
  
          const found = config.referenceData.filter(
            stateRecord =>
              String(stateRecord['StateName'].value)
                .trim()
                .toLowerCase() == stateName &&
              String(stateRecord['CountryName'].value)
                .trim()
                .toLowerCase() === countryName
          );
  
          if (!found.length) {
            record.addError(
              config.stateField,
              `state "${stateName}" is not valid for country "${countryName}"`
            );
          }
        }
      },
    };
  }
  