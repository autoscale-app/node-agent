import { dispatch } from './request'
import { debug } from './log'

type Buffer = Map<string, number>

export class WebDispatcher {
  readonly id: string
  readonly token: string
  private buffer: Buffer = new Map()
  private readonly ttl = 20

  constructor(token: string) {
    this.id = token.slice(0, 7)
    this.token = token
  }

  add (
    value: number,
    timestamp: string | number = (Date.now() / 1000).toFixed()
  ): void {
    timestamp = String(timestamp)
    let next = this.buffer.get(timestamp)

    if (next == null || (value > next)) {
      next = value
    }

    this.buffer.set(timestamp, next)
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
    const payload = this.buildPayload()

    if (payload.keys().next().done === true) {
      return
    }

    const body = JSON.stringify(Object.fromEntries(payload))

    try {
      debug(await dispatch(body, this.token))
      await this.dispatch()
    } catch (err) {
      this.revertPayload(payload)
      console.log(`WebDispatcher[${this.id}]: Failed to dispatch`)
      debug(`WebDispatcher[${this.id}]:`, err)
    }
  }

  buildPayload (): Buffer {
    const payload = new Map()
    const keys = []
    const now = Math.floor(Date.now() / 1000)

    for (const [timestamp, _] of this.buffer) {
      if (timestamp !== '' && Number(timestamp) < now) {
        keys.push(timestamp)
      }
    }

    for (const key of keys) {
      const value = this.buffer.get(key)

      if (value != null) {
        payload.set(key, value)
        this.buffer.delete(key)
      }
    }

    return payload
  }

  revertPayload (payload: Buffer): void {
    for (const [timestamp, values] of payload) {
      this.add(values, timestamp)
    }
  }
}
