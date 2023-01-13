import type { WorkerDispatcher } from './worker_dispatcher'

export class WorkerDispatchers {
  private readonly interval = 15_000
  private readonly dispatchers: WorkerDispatcher[] = []

  push (dispatcher: WorkerDispatcher): void {
    this.dispatchers.push(dispatcher)
  }

  async dispatch (): Promise<void> {
    for (const dispatcher of this.dispatchers) {
      await dispatcher.dispatch()
    }
  }

  async run (): Promise<void> {
    try {
      await this.dispatch()
    } catch (err) {
      console.log(
        'Unexpected exception occurred in WorkerDispatchers#dispatch():',
        err
      )
    }

    setTimeout(() => {
      void this.run()
    }, this.interval)
  }
}
