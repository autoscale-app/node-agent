import { dispatch } from './request'
import { debug } from './log'

type Buffer = Map<string, number[]>

export class WebDispatcher {
  readonly id: string
  readonly token: string
  private buffer: Buffer = new Map()
  private readonly ttl = 20

  constructor (token: string) {
    this.id = token.slice(0, 7)
    this.token = token
  }

  add (
    values: number[],
    timestamp: string | number = (Date.now() / 1000).toFixed()
  ): void {
    let current = this.buffer.get(String(timestamp))

    if (current == null) {
      current = []
    }

    this.buffer.set(String(timestamp), current.concat(values))
  }

  prune (): void {
    const retained: Buffer = new Map()
    const maxAge = Math.round(Date.now() / 1000) - this.ttl

    for (const [timestamp, values] of this.buffer) {
      if (parseInt(timestamp) > maxAge) {
        retained.set(timestamp, values)
      }
    }

    debug(`WebDispatcher[${this.id}] buffer:`, this.buffer)
    debug(`WebDispatcher[${this.id}] retain:`, retained)

    this.buffer = retained
  }

  async dispatch (): Promise<void> {
    const payload = this.nextPayload()

    if (payload.keys().next().done === true) {
      return
    }

    const body = JSON.stringify(Object.fromEntries(payload))

    try {
      debug(await dispatch(body, this.token))
      await this.dispatch()
    } catch (err) {
      for (const [timestamp, values] of payload) {
        this.add(values, timestamp)
      }

      console.log(`WebDispatcher[${this.id}]: Failed to dispatch`)
      debug(`WebDispatcher[${this.id}]:`, err)
    }
  }

  nextPayload (): Buffer {
    const payload = new Map()
    const iterator = this.buffer.keys()
    const keys = []

    for (let i = 0; i < 5; i++) {
      const { value } = iterator.next()

      if (value != null) {
        keys.push(value)
      }
    }

    for (const key of keys) {
      const values = this.buffer.get(key)

      if (values != null) {
        payload.set(key, values)
        this.buffer.delete(key)
      }
    }

    return payload
  }
}
