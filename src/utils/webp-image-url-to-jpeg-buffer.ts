import { M } from '@victorenokh/maybe.ts'
import { webpBufferToJpegBuffer } from './webp-buffer-to-jpg'

export const webpImageUrlToJpegBuffer = async (
  url: M.Maybe<string>,
): Promise<M.Maybe<Buffer>> => {
  return (
    await (
      await url.asyncMap((url) => fetch(url))
    ).asyncMap(async (response) => await response.arrayBuffer())
  )
    .map((arrayBuffer) => Buffer.from(arrayBuffer))
    .asyncMap(async (buffer) => webpBufferToJpegBuffer(buffer))
}
