import type { WorkerServer } from './worker_server'

export class WorkerServers {
  private readonly servers: WorkerServer[] = []

  push (server: WorkerServer): void {
    this.servers.push(server)
  }

  find (tokens: string[]): WorkerServer | null {
    for (const server of this.servers) {
      if (tokens.includes(server.token)) {
        return server
      }
    }

    return null
  }
}
