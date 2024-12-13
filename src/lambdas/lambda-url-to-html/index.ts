import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda'
import axios from 'axios'
import * as cheerio from 'cheerio'

export interface Input {
  url: string
  name: string
}

export interface Output {
  title: string
  s3_url: string
}

const BUCKET = 'erick-storage'
const s3Client = new S3Client({ region: 'us-east-2' })

export const storage = {
  storeHtmlFile: async (content: string, name: string): Promise<string> => {
    const key = `${name}.html`
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: Buffer.from(content),
      ContentType: 'text/html',
      ACL: 'public-read',
    })

    await s3Client.send(command)

    return `https://${BUCKET}.s3.amazonaws.com/${key}`
  },
}

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  const output: Output = {
    title: '',
    s3_url: '',
  }

  try {
    // example: ?url=https://news.ycombinator.com&name=hnews
    const params = event.queryStringParameters as unknown as Input

    const res = await axios.get(params.url)
    output.title = cheerio.load(res.data)('head > title').text()
    output.s3_url = await storage.storeHtmlFile(res.data, params.name)
  } catch (error) {
    console.log(error)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(output),
  }
}
