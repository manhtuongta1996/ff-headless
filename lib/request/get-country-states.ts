import { Flatfile } from '@flatfile/api';
import { getCountryList } from '../../locations/requests/getCountryList';

function logger(message: string, params: string[]): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore

  console.error(message, params);
}

interface Location {
  id: number;
  code: string;
  name: string;
}

interface Country {
  id: number;
  code: string;
  name: string;
  states: Location[];
}

interface Response {
  countries: Country[];
  success: boolean;
}

let cachedCountriesWithStates: ReturnType<typeof getCountryList> | null = null;

export async function getCachedCountryList(): Promise<Response> {
  if (!cachedCountriesWithStates) {
    cachedCountriesWithStates = await getCountryList();
  }
  return cachedCountriesWithStates;
}

export async function getFlatFileMappedCountryList(): Promise<
  Flatfile.RecordData[] | null
> {
  const countriesWithStates = await getCachedCountryList();

  if (!countriesWithStates?.countries) {
    logger('Failed to fetch countries', ['getFlatFileMappedCountryList']);
    return null;
  }

  return countriesWithStates?.countries?.map(
    ({ id, name, code }: Location) => ({
      Id: { value: id },
      Name: { value: name },
      Code: { value: code },
    })
  );
}

export async function getFlatFileMappedStateList(): Promise<
  Flatfile.RecordData[] | null
> {
  const countriesWithStates = await getCachedCountryList();
  if (!countriesWithStates.countries) {
    logger('Failed to fetch states', ['getFlatFileMappedStateList']);
    return null;
  }

  return countriesWithStates.countries.flatMap((country: Country) =>
    country.states.map((state: Location) => ({
      StateId: { value: state.id },
      StateName: { value: state.name },
      StateCode: { value: state.code },
      CountryName: { value: country.name },
      CountryId: { value: country.id },
      CountryCode: { value: country.code },
    }))
  );
}
