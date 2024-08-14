const namespace = ['space:newapp2']
import api from '@flatfile/api'
import { FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import { exportWorkbookPlugin } from '@flatfile/plugin-export-workbook'
import { FlatfileEvent } from '@flatfile/listener'
import {createLocationEnterpriseTemplate} from "./templates/location"
export default function flatfileEventListener(listener) {
  listener.on('**', (event: FlatfileEvent) => {
    console.log('Event Received: ' + event.topic);
  })
  listener.namespace(namespace, (namespacedEvents) => {
    console.log("namespace Events", JSON.stringify(namespacedEvents))
    namespacedEvents.filter({ job: 'space:configure' }, (configure) => {
      console.log("space:configure", configure)

      configure.on(
        'job:ready',
        async ({ context: { spaceId, environmentId, jobId } }: FlatfileEvent) => {
          console.log('Configuring space', {spaceId, environmentId, jobId})
          try {
            await api.jobs.ack(jobId, {
              info: 'Creating Space',
              progress: 10,
            })
            const locationTemplate = await createLocationEnterpriseTemplate()
            await api.workbooks.create({
              spaceId,
              environmentId,
              ...locationTemplate
            })
            
            await api.workbooks.create({
              spaceId,
              environmentId,
              ...locationTemplate
            })
            
            
            // await api.workbooks.create({
            //   spaceId,
            //   environmentId,
            //   name:`1 Inventory`,
            //   sheets:[
            //       {
            //           name: `Inventory`,
            //           slug: "inventory",
            //           fields: [
            //               {
            //                   key:"title",
            //                   type:"string",
            //                   label:"Title"
            //               },
            //               {
            //                   key:"author",
            //                   type:"string",
            //                   label:"Author"
            //               },
            //               {
            //                   key:"isbn",
            //                   type:"string",
            //                   label:"ISBN"
            //               },
            //               {
            //                   key:"stock",
            //                   type:"number",
            //                   label:"Stock"
            //               }
            //           ],
            //           actions:[]
            //       },
            //       {
            //           name: `Purchase Order`,
            //           slug:"purchase-order",
            //           fields:[
            //               {
            //                   key:"title",
            //                   type:"string",
            //                   label:"Title"
            //               },
            //               {
            //                   key:"author",
            //                   type:"string",
            //                   label:"Author"
            //               },
            //               {
            //                   key:"isbn",
            //                   type:"string",
            //                   label:"ISBN"
            //               },
            //               {
            //                   key:"purchase",
            //                   type:"number",
            //                   label:"Purchase"
            //               }
            //           ],
            //           actions: []
            //       }
            //   ]
            // })
            
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
      configure.on('file:updated',
      async (event: FlatfileEvent) => {
          console.log('getting file', event.context)
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