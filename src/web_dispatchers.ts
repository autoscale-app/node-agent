import type { WebDispatcher } from './web_dispatcher'

export class WebDispatchers {
  private readonly interval = 5000
  private readonly dispatchers: WebDispatcher[] = []
  queueTime?: WebDispatcher

  setQueueTime (dispatcher: WebDispatcher): void {
    if (this.queueTime !== undefined) {
      throw new Error('queue time dispatcher already set')
    }

    this.queueTime = dispatcher
    this.dispatchers.push(dispatcher)
  }

  prune (): void {
    for (const dispatcher of this.dispatchers) {
      dispatcher.prune()
    }
  }

  async dispatch (): Promise<void> {
    for (const dispatcher of this.dispatchers) {
      await dispatcher.dispatch()
    }
  }

  async run (): Promise<void> {
    try {
      this.prune()
    } catch (err) {
      console.log(
        'Unexpected exception occurred in WebDispatchers#prune():',
        err
      )
    }

    try {
      await this.dispatch()
    } catch (err) {
      console.log(
        'Unexpected exception occurred in WebDispatchers#dispatch():',
        err
      )
    }

    setTimeout(() => {
      void this.run()
    }, this.interval)
  }
}
