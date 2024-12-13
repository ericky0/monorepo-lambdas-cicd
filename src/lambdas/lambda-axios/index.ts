import axios from 'axios'
import { generateLog } from './service'

export const handler = async () => {
  // test to see if only axios dependency will be published to lambda
  axios.get('http://example')
  generateLog('test4')

  return {
    statusCode: 200,
    body: JSON.stringify('ok'),
  }
}
