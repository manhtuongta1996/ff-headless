import api, {Flatfile, FlatfileError, FlatfileTimeoutError,} from '@flatfile/api'
import { FlatfileEvent,FlatfileListener } from '@flatfile/listener'
import {createLocationEnterpriseTemplate} from "../templates/location"
import {FlatfileFormatDataSource} from "../types/flatfile_types"
import catcherRetryer from "../lib/request/catcher-retryer"

// Define the regex pattern to function mapping
const LOCATION_ENTERPRISE_TEMPLATE = "LOCATION"

const filePatternMapping: { [pattern: string]: string } = {
    '^.*_location\\.csv$': LOCATION_ENTERPRISE_TEMPLATE
};

const minRetrySleepMs = 654;
const maxRetries = 10;

function getTemplate(fileName: string): string | undefined {
    for (const pattern in filePatternMapping) {
        const regex = new RegExp(pattern);
        console.log('pattern', pattern, regex)

        if (regex.test(fileName)) {
            return filePatternMapping[pattern];
        }
    }
    return undefined;
}
function isPromise<T>(value: any): value is Promise<T> {
    return value && typeof value.then === 'function';
  }
  function flatfileClientShouldRetry(err: any): boolean {
    const logParams: {
      [key: string]: any;
    } = {
      provider: 'FlatFile',
      version: 'Platform',
    };
    let logMessage = '';
  
    if (err instanceof FlatfileError) {
      logMessage = 'FlatFile Platform Client Error - FlatfileError';
      if (err.statusCode) {
        logParams.statusCode = err.statusCode;
      }
      if (err.body) {
        logParams.Body = err.body;
      }
      if (err.message) {
        logParams.Message = err.message;
      }
    } else if (err instanceof FlatfileTimeoutError) {
      logMessage = 'FlatFile Platform Client Error - FlatfileTimeoutError';
    } else {
      logMessage = 'Unknown FlatFile Error';
    }
  
    console.warn(logMessage, logParams);
  
    return true;
  }
  async function getWorkbook(
    workbookId: string
  ): Promise<Flatfile.WorkbookResponse | null> {
    return await catcherRetryer<
      Flatfile.WorkbookResponse,
      Flatfile.WorkbookResponse
    >(
      async () => await api.workbooks.get(workbookId),
      e => flatfileClientShouldRetry(e),
      response => response,
      maxRetries,
      minRetrySleepMs
    );
  }
  
  async function getSheetId(
    workbookId: string,
    sheetSlug: string
  ): Promise<string | null> {
    const workbook = await getWorkbook(workbookId);
    const sheets = workbook?.data?.sheets ?? [];
    if (!sheets) {
      console.error('No sheets found in the workbook', workbook);
      return null;
    }
  
    const targetSheet = sheets.find(s => s.config.slug === sheetSlug);
    if (targetSheet) {
      return targetSheet.id;
    } else {
      console.error("FlatFile Platform Error - Sheet not found")
      return null;
    }
  }
  function flatten(set: Map<string, Set<string>>): string[] {
    const arr: string[] = [];
    set.forEach((value, key) => {
      arr.push(`${key} => ${value.size}`);
    });
    return arr;
  }
  
  function logger(message: string, params: any): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.error(message, params);
  }
export default function flatfileEventListener(listener:FlatfileListener) {
  listener.on('**', (event: FlatfileEvent) => {
    //console.log('Event Received: ' + JSON.stringify(event, null, 4));
    console.log('Event Received: ' + event.topic);

  })

  listener.on("job:ready", { job: "space:configure" }, async (event) => {
    console.log("---------- configuring space -----------", event)
  })
  listener.on("file:created", async (event) => {
    const {fileId, spaceId, environmentId} = event.context
    const {context} = event
    const file = await api.files.get(fileId)
    const fileName = file?.data.name
    if (!fileName) {
        throw new Error('File does not have the name')
    }
    const templateIdentifer = getTemplate(fileName)
    if (templateIdentifer === undefined){
        throw new Error('Does not have template for this file')
    }
    let template;
    switch(templateIdentifer){
        case LOCATION_ENTERPRISE_TEMPLATE:
            template = await createLocationEnterpriseTemplate();
            break;
        
        default:
            template = null;
            break;
    }
    if (!template){
        console.log("Dumaaaaa NO Template")

    }
    console.log("DUmAAaaaaaaaaaaaaaaa",event.context, fileId, file.data.name, template)

    //const template = await templateHandler()
    console.log('this is file', file.data.name)
    
    // Create workbook template based on file name
    const workbook = await api.workbooks.create({
        spaceId,
        environmentId,
        name:`${fileId}_${template.name}`,
        sheets: template.sheets,
    });
    const workbookId = workbook.data.id
    console.log("DUmAAaaaaaaaaaaaaaaa WORKBOOOK",workbookId)

    //Load data into workbook lookup table
    try {
        async function loadSheetData(
          sheetSlug: string,
          dataSource: FlatfileFormatDataSource
        ): Promise<void> {
          
          const sheetId = await getSheetId(workbookId, sheetSlug);
          if (sheetId) {
            try {
              const rows = isPromise(dataSource)
                ? await dataSource
                : dataSource;
              if (!rows) {
                logger('Error - Failed to Extract Resource Data', {
                    rows,
                  context: context,
                  provider: 'FlatFile',
                  version: 'Platform',
                  sheetSlug: sheetSlug,
                });
                return;
              }

              await catcherRetryer<
                Flatfile.RecordsResponse,
                Flatfile.RecordsResponse
              >(
                async () =>
                  await api.records.insert(
                    sheetId,
                    rows as Flatfile.RecordData[]
                  ),
                e => flatfileClientShouldRetry(e),
                response => response,
                maxRetries,
                minRetrySleepMs
              );

            } catch (error) {
              logger('Error - Failed to Insert Reference Data', {
                context: context,
                provider: 'FlatFile',
                version: 'Platform',
                error: error,
                sheetSlug: sheetSlug,
              });
            }
          } else {
            logger('Error - Failed to Find SheetId', {
              context: context,
              provider: 'FlatFile',
              version: 'Platform',
              sheetSlug: sheetSlug,
            });
          }
        }
        console.log('template.resourceDataSources', template)
        const dataSourcesToResolve = template.resourceDataSources?.map(
          resourceDataSource =>
            loadSheetData(
              resourceDataSource.sheetSlug,
              resourceDataSource.dataSource
            )
        );

        console.log(
          'Sources ready to load: ' + dataSourcesToResolve?.length ?? '0'
        );

        console.log(
          'Sources ready to load: ' + dataSourcesToResolve?.length ?? '0'
        );

        console.log('Workbook data loading');
        if (dataSourcesToResolve) {
          await Promise.all(dataSourcesToResolve);
        } else {
          console.error('Error - Failed to Resolve Data Sources', {
            context: context,
            provider: 'FlatFile',
            version: 'Platform',
          });
        }
        // Data to lookup table is load, let extract and mapping the file

    } catch (error) {
        console.error(error)
    }
    try {
        await catcherRetryer<Flatfile.JobResponse, Flatfile.JobResponse>(
          async () =>
            await api.jobs.create({
              type: 'file',
              operation: 'extractingData',
              trigger: 'immediate',
              source: fileId,
              mode: 'foreground',
            }),
          e => flatfileClientShouldRetry(e),
          response => response,
          maxRetries,
          minRetrySleepMs
        );
      } catch (error) {
        logger('FlatFile Platform Error - Failed to Create Job', {
          context: event.context,
          provider: 'FlatFile',
          version: 'Platform',
          error: error,
        });
      }
  })
  // listener.on(
  //   'job:ready',
  //   { job: 'file:extractingData' },
  //   (event) => {
  //       console.log("---------------Custom job---------", JSON.stringify(event, null, 2))
  // })
}