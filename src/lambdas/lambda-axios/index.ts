import axios from 'axios'
import { generateLog } from './service'

export const handler = async () => {
  // test to see if only axios dependency will be published to lambda
  axios.get('http://example')
  console.log('commit 1')
  generateLog('test1112334')
  console.log('commit 3')

  return {
    statusCode: 200,
    body: JSON.stringify('ok'),
  }
}
