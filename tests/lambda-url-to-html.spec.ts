import {
  Output,
  handler,
  storage,
} from '../src/lambdas/lambda-url-to-html/index'
import { describe, it, afterEach } from 'mocha'
import { stub, restore } from 'sinon'
import axios from 'axios'
import { strictEqual } from 'assert'

const executeLambda = async (
  url: string,
  name: string
): Promise<Output | null> => {
  const output = await handler({ queryStringParameters: { url, name } })
  let outputBody: Output | null = null
  if (!output) {
    return null
  }

  outputBody = JSON.parse(output.body!)

  return outputBody
}

const title = 'This is the title of example.com'
const s3UrlFile = 'https://s3fileurl.com'
const html = `<html><head><title>${title}</title></head></html>`
const name = '__file_name__'

afterEach(restore)

describe('handler', async () => {
  it('it should get the html from a url', async () => {
    stub(axios, 'get').resolves({
      data: html,
    })
    stub(storage, 'storeHtmlFile').resolves(s3UrlFile)

    const output = await executeLambda(`${s3UrlFile}/?url=test&name=test`, name)

    strictEqual(output?.title, title)
    strictEqual(output?.s3_url, s3UrlFile)
  })

  it('it should extract from the converted url into html the page title', async () => {
    stub(axios, 'get').resolves({ data: html })
    const storeHtmlStub = stub(storage, 'storeHtmlFile').resolves(s3UrlFile)

    const output = await executeLambda('http://example.com', name)
    strictEqual(output?.title, title)
    strictEqual(storeHtmlStub.calledOnceWith(html, name), true)
  })
})
