import { Flatfile } from "@flatfile/api";
import {fetchCountryStatesTimezones} from "./webapp/location-bulk-settings"
export type DeputyResourceToFlatFileTemplateFieldMap = {
    [key: string]: string;
  };

function logger(message: string, params: any): void {
    console.error(message, params);
}
export async function getTimezones(
    fieldMap: DeputyResourceToFlatFileTemplateFieldMap
  ): Promise<Flatfile.RecordData[] | null> {
    const { timezone } = await fetchCountryStatesTimezones(['timezone']);
  
    if (!timezone) {
      const errorMessage = 'Failed to fetch timezones';
      console.error(errorMessage);
      logger(errorMessage, [fieldMap, timezone]);
      return null;
    }
  
    return timezone.map((timezone: string) => {
      const obj: Flatfile.RecordData = {};
      Object.keys(fieldMap).forEach(key => {
        obj[fieldMap[key]] = { value: timezone };
      });
  
      return obj;
    });
  }