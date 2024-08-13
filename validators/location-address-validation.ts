import { FlatfileRecord } from '@flatfile/hooks';
import {
  FlatfileHook,
  FlatfileHookType,
} from '../types/flatfile_types';

export type FlatfileLocationAddressValidationConfig = {
  sheetSlug: string;
};

export const requiresState = ['Australia', 'United States', 'Canada'];
export const requiresPostcode = [
  'Australia',
  'United States',
  'Canada',
  'New Zealand',
  'United Kingdom (Great Britain)',
];

type responseErrors = {
  field: string;
  message: string;
};

// Validates the address fields based on the country
export function locationAddressValidation(
  config: FlatfileLocationAddressValidationConfig
): FlatfileHook {
  return {
    type: FlatfileHookType.SINGLE,
    sheetSlug: config.sheetSlug,
    callback: async (record: FlatfileRecord): Promise<void> => {
      const country = record
        .get('country')
        ?.toString()
        .trim();
      const state = record
        .get('state')
        ?.toString()
        .trim();
      const postcode = record
        .get('postcode')
        ?.toString()
        .trim();

      const errors = validateAddressFields(country, state, postcode);
      errors.forEach(error => {
        record.addError(error.field, error.message);
      });
    },
  };
}

export function validateAddressFields(
  country: string | undefined,
  state: string | undefined,
  postcode: string | undefined
): responseErrors[] {
  const errors: responseErrors[] = [];

  if (country) {
    if (requiresState.includes(country) && !state) {
      errors.push({
        field: 'state',
        message: `State is required for ${country}`,
      });
    }

    if (requiresPostcode.includes(country) && !postcode) {
      errors.push({
        field: 'postcode',
        message: `Postcode is required for ${country}`,
      });
    }
  }
  return errors;
}
