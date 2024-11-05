const namespace = ['space:newapp2'] // Change this to your app namespace
import api, {Flatfile, FlatfileError, FlatfileTimeoutError,} from '@flatfile/api'
import { recordHook } from '@flatfile/plugin-record-hook'
import { exportWorkbookPlugin } from '@flatfile/plugin-export-workbook'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import {createLocationEnterpriseTemplate} from "./templates/location"
import {FlatfileFormatDataSource} from "./types/flatfile_types"
import catcherRetryer from "./lib/request/catcher-retryer"

const minRetrySleepMs = 654;
const maxRetries = 10;

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
export default function flatfileEventListener(listener: FlatfileListener) {
  let countTotalRecords = 0;
  let countTotalRecordsLoaded = 0;
  listener.on('**', (event: FlatfileEvent) => {
    console.log('Event Received: ' + event.topic);
  })
  listener.namespace(namespace, (namespacedEvents) => {
    console.log("namespace Events", JSON.stringify(namespacedEvents))

    namespacedEvents.filter({ job: 'space:configure' }, (configure) => {
      console.log("space:configure", configure)

      configure.on(
        'job:ready',
        async ({ context: { spaceId, environmentId, jobId, context } }: FlatfileEvent) => {
          console.log('Configuring space', {spaceId, environmentId, jobId})
          try {
            await api.jobs.ack(jobId, {
              info: 'Creating Space',
              progress: 10,
            })
            const locationTemplate = await createLocationEnterpriseTemplate()

            // Creating workbook
            const workbook = await api.workbooks.create({
              spaceId,
              environmentId,
              ...locationTemplate
            })
            const workbookId = workbook.data.id
            // mapping data for template
            locationTemplate.resourceDataSources?.forEach(async sheet => {
              const rows = await sheet.dataSource;
              countTotalRecords += rows?.length ?? 0;
            });

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
    
                    countTotalRecordsLoaded += rows.length;
                    await catcherRetryer<
                      Flatfile.JobResponse,
                      Flatfile.JobResponse
                    >(
                      async () =>
                        await api.jobs.update(jobId, {
                          progress:
                            (countTotalRecordsLoaded / countTotalRecords) * 100                        }),
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
    
              await catcherRetryer<Flatfile.JobResponse, Flatfile.JobResponse>(
                async () =>
                  await api.jobs.ack(jobId, {
                    progress: 0,
                    info: 'Setting up your environment...',
                  }),
                e => flatfileClientShouldRetry(e),
                response => response,
                maxRetries,
                minRetrySleepMs
              );
    
              const dataSourcesToResolve = locationTemplate.resourceDataSources?.map(
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
    
              await catcherRetryer<Flatfile.JobResponse, Flatfile.JobResponse>(
                async () => await api.jobs.complete(jobId),
                e => flatfileClientShouldRetry(e),
                response => response,
                maxRetries,
                minRetrySleepMs
              );

            } catch (error) {
              console.error(error)
    
              await catcherRetryer<Flatfile.JobResponse, Flatfile.JobResponse>(
                async () =>
                  await api.jobs.fail(jobId, {
                    outcome: {
                      message: 'Failed to setup your environment',
                    },
                  }),
                e => flatfileClientShouldRetry(e),
                response => response,
                maxRetries,
                minRetrySleepMs
              );
            }

            await api.jobs.complete(jobId, {
              outcome: {
                message: 'Space Created',
                acknowledge: true,
              },
            })
          } catch (error) {
            await api.jobs.fail(jobId, {
              outcome: {
                message:
                  'Space Creation Failed. See Event Logs',
                acknowledge: true,
              },
            })
          }
        }
      )
      configure.on('job:ready',{job:'file:updated'},
      async (event: FlatfileEvent) => {
          console.log('getting file---------------', event.context)
      })
    })
    namespacedEvents.filter({job:'file:updated'}, (configure) => {
      configure.on('job:ready', (event) =>{
        console.log('--------++++++++_______File being loaded', event)
      })
    })
    namespacedEvents.use(
      recordHook('contacts', (record) => {
        const value = record.get('firstName')
        if (typeof value === 'string') {
          record.set('firstName', value.toLowerCase())
        } else {
          record.addError('firstName', 'Invalid first name')
        }

        const email = record.get("email")
        const validEmailAddress = /^[^s@]+@[^s@]+.[^s@]+$/

        if (typeof email !== 'string' || email !== null) {
          record.addError("email", 'Invalid email address')
        } else if (!validEmailAddress.test(email)) {
            record.addError("email", 'Invalid email address')
          }

        return record
      })
    )

    namespacedEvents.use(exportWorkbookPlugin())
  })
}