import * as sharp from 'sharp'

export const webpBufferToJpegBuffer = async (buffer: Buffer): Promise<Buffer> =>
  await sharp(buffer).jpeg().toBuffer()
