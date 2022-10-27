const axios = require('axios').default;
import type {VercelRequest, VercelResponse} from '@vercel/node';

const API_HOST = process.env.API_HOST === undefined ? `https://fio-testnet.eosblocksmith.io` : process.env.API_HOST;

console.log(`API_HOST: ${API_HOST}`);
console.log(`process.env: ${process.env}`);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    let reqBody = req.body;
    let result  = await axios.post(`${API_HOST}/v1/chain/get_escrow_listings`, {
      "status": reqBody.status,
      "offset": reqBody.offset,
      "limit" : reqBody.limit,
      "actor" : reqBody.actor
    });
    res.send(result.data);
  } catch (ex) {
    console.error(ex)
  }
}
