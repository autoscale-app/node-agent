import http from 'http'
import { dispatch } from './request'
import { debug } from './log'
import type { WorkerFunction } from './worker'

export class WorkerDispatcher {
  readonly id: string
  readonly token: string
  private readonly fn: WorkerFunction

  constructor (token: string, fn: WorkerFunction) {
    this.id = token.slice(0, 7)
    this.token = token
    this.fn = fn
  }

  async dispatch (): Promise<void> {
    const value = await this.fn()
    const timestamp = (Date.now() / 1000).toFixed()

    if (typeof value === 'number') {
      const body = JSON.stringify({ [timestamp]: [value] })

      try {
        debug(await dispatch(body, this.token))
      } catch (err) {
        if (err instanceof http.IncomingMessage) {
          let code = ''

          if (err.statusCode != null) {
            code = `(${err.statusCode})`
          }

          console.log(
            `WorkerDispatcher[${this.id}]: Failed to dispatch ${code}`
          )
        }

        debug(`WorkerDispatcher[${this.id}]: Failed to dispatch`, err)
      }
    } else {
      console.log(
        `WorkerDispatcher[${this.id}]: Failed to calculate worker information`
      )
    }
  }
}
