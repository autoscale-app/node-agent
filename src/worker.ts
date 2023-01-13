export type WorkerFunctionPromise = Promise<number | null>
export type WorkerFunction = () => WorkerFunctionPromise
