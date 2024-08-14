import { Flatfile } from '@flatfile/api';
import {
  FlatfileHook,
  FlatfilePlatformTemplate,
} from '../types/flatfile_types';
// import {
//   getDeputyResourceAsFFPlatformMap,
//   getTimezones,
// } from '@/lib/request/svc/integrations/flatfile-platform-deputy-resource-get';
import { defaultValue } from '../modifiers/default-value';
import { booleanValue } from '../modifiers/boolean-value';
import { trimValue } from '../modifiers/trim-value';
import { locationAddressValidation } from '../validators/location-address-validation';
import { stateCountryCheck } from '../validators/state-country-check';
import {getFlatFileMappedStateList} from "../lib/request/get-country-states"
// import {
//   getFlatFileMappedCountryList,
//   getFlatFileMappedStateList,
// } from '@/lib/request/svc/integrations/get-country-states';

export async function createLocationEnterpriseTemplate(): Promise<
  FlatfilePlatformTemplate
> {
  // const isAddressVerificationEnabledInFF = checkFF(
  //   'prf-138-flatfile-locations-validate-address'
  // );

  // const isCountryStatesListEnabledInFF = checkFF(
  //   'prf-170-flatfile-countries-states-list'
  // );

  let stateRows: Flatfile.RecordData[] | null;
  let countryRows: Flatfile.RecordData[] | null;

  
  // stateRows = await getDeputyResourceAsFFPlatformMap(
  //     'State',
  //     {
  //     Id: 'StateId',
  //     State: 'StateName',
  //     Code: 'StateCode',
  //     'CountryObject.Country': 'Country',
  //     'CountryObject.Id': 'CountryId',
  //     'CountryObject.Code': 'CountryCode',
  //     },
  //     {
  //     search: [
  //         { field: 'Active', type: 'eq', data: true },
  //         {
  //         field: 'Active',
  //         type: 'eq',
  //         data: true,
  //         join: 'CountryObject',
  //         },
  //     ],
  //     join: ['CountryObject'],
  //     }
  // );

  // countryRows = await getDeputyResourceAsFFPlatformMap(
  //     'Country',
  //     {
  //     Id: 'Id',
  //     Country: 'Name',
  //     Code: 'Code',
  //     },
  //     {
  //     search: [{ field: 'Active', type: 'eq', data: true }],
  //     }
  // );
  // if FF isCountryStatesListEnabledInFF enabled then
  try {
    stateRows = await getFlatFileMappedStateList();

  } catch (err){
    console.error('======State rows failed=======', err)

  }
  console.log('======State rows success=======', stateRows)

  // countryRows = await getFlatFileMappedCountryList();
    

  const locationEnterpriseHooks: FlatfileHook[] = [
    defaultValue({
      sheetSlug: 'locations',
      fieldSlug: 'isWorkplace',
      defaultValue: true,
    }),
    defaultValue({
      sheetSlug: 'locations',
      fieldSlug: 'isPayrollEntity',
      defaultValue: true,
    }),
    booleanValue({
      sheetSlug: 'locations',
      booleanFields: ['isWorkplace', 'isPayrollEntity'],
    }),
    // stateCountryCheck({
    //   sheetSlug: 'locations',
    //   stateField: 'state',
    //   countryField: 'country',
    //   referenceData: stateRows,
    // }),
    trimValue({
      sheetSlug: 'locations',
      trimFields: [
        'locationName',
        'locationCode',
        'street',
        'city',
        'postcode',
        'addressNotes',
        'timezone',
        'parentLocationName',
        'payrollExportCode',
        'businessNumber',
      ],
    }),
  ];

  
  locationEnterpriseHooks.push(
    locationAddressValidation({
      sheetSlug: 'locations',
    })
  );


  return {
    name: 'Enterprise Location Sync',
    sourceSheetSlug: 'locations',
    sheets: [
      {
        name: 'Locations',
        slug: 'locations',
        allowAdditionalFields: false,
        access: [Flatfile.SheetAccess.All],
        fields: [
          {
            key: 'locationName',
            type: 'string',
            label: 'Location Name',
            constraints: [{ type: 'required' }],
          },
          {
            key: 'locationCode',
            type: 'string',
            label: 'Location Code',
          },
          {
            key: 'deputyId',
            type: 'number',
            label: 'Deputy Id',
          },
          {
            key: 'street',
            type: 'string',
            label: 'Street',
          },
          {
            key: 'city',
            type: 'string',
            label: 'City',
          },
          {
            key: 'postcode',
            type: 'string',
            label: 'Postcode',
          },
          {
            key: 'state',
            type: 'reference',
            label: 'State',
            config: {
              ref: 'states',
              key: 'StateName',
              relationship: Flatfile.ReferencePropertyRelationship.HasOne,
            },
          },
          {
            key: 'country',
            type: 'reference',
            label: 'Country',
            config: {
              ref: 'countries',
              key: 'Name',
              relationship: Flatfile.ReferencePropertyRelationship.HasOne,
            },
          },
          {
            key: 'addressNotes',
            type: 'string',
            label: 'Address Notes',
          },
          {
            key: 'timezone',
            type: 'reference',
            label: 'Timezone',
            config: {
              ref: 'timezones',
              key: 'Name',
              relationship: Flatfile.ReferencePropertyRelationship.HasOne,
            },
            constraints: [{ type: 'required' }],
          },
          {
            key: 'isWorkplace',
            type: 'boolean',
            label: 'Is Workplace?',
          },
          {
            key: 'parentLocationName',
            type: 'string',
            label: 'Parent Location Name',
          },
          {
            key: 'isPayrollEntity',
            type: 'boolean',
            label: 'Is Payroll Entity?',
          },
          {
            key: 'payrollExportCode',
            type: 'string',
            label: 'Payroll Export Code',
          },
          {
            key: 'businessNumber',
            type: 'string',
            label: 'Business Number',
          },
        ],
      },
      {
        name: 'Countries',
        slug: 'countries',
        allowAdditionalFields: false,
        access: [],
        fields: [
          {
            key: 'Id',
            type: 'number',
            label: 'Deputy ID',
          },
          {
            key: 'Name',
            type: 'string',
            label: 'Name',
          },
          {
            key: 'Code',
            type: 'string',
            label: 'Code',
            config: {
              size: Flatfile.StringConfigOptions.Tiny,
            },
          },
        ],
      },
      {
        name: 'States',
        slug: 'states',
        allowAdditionalFields: false,
        access: [],
        fields: [
          {
            key: 'StateId',
            type: 'number',
            label: 'State ID',
          },
          {
            key: 'StateName',
            type: 'string',
            label: 'State Name',
          },
          {
            key: 'StateCode',
            type: 'string',
            label: 'State Code',
            config: {
              size: Flatfile.StringConfigOptions.Tiny,
            },
          },
          {
            key: 'CountryId',
            type: 'number',
            label: 'Country ID',
          },
          {
            key: 'CountryName',
            type: 'string',
            label: 'Country Name',
          },
          {
            key: 'CountryCode',
            type: 'string',
            label: 'Country Code',
            config: {
              size: Flatfile.StringConfigOptions.Tiny,
            },
          },
        ],
      },
      {
        name: 'Timezones',
        slug: 'timezones',
        allowAdditionalFields: false,
        access: [],
        fields: [
          {
            key: 'Name',
            type: 'string',
            label: 'Name',
          },
        ],
      },
    ],
    hooks: locationEnterpriseHooks,
    resourceDataSources: [
      {
        sheetSlug: 'countries',
        dataSource: countryRows,
      },
      {
        sheetSlug: 'states',
        dataSource: stateRows,
      },
      {
        sheetSlug: 'timezones',
        // dataSource: await getTimezones({
        //   Timezone: 'Name',
        // }),
        dataSource: [{Name:{value:"Sydney"}}],
      },
    ],
  };
}
