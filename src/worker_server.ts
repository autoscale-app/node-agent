import type { WorkerFunction, WorkerFunctionPromise } from './worker'

export class WorkerServer {
  id: string
  token: string
  fn: WorkerFunction

  constructor (token: string, fn: WorkerFunction) {
    this.id = token.slice(0, 7)
    this.token = token
    this.fn = fn
  }

  async serve (): WorkerFunctionPromise {
    return await this.fn()
  }
}
