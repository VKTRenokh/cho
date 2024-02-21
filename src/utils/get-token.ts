import { E } from '@victorenokh/maybe.ts'

const errorMessage = 'no token was provided in .env file'

export const getToken = (): E.Either<string, string> =>
  process.env.TOKEN ? E.right(process.env.TOKEN) : E.left(errorMessage)
