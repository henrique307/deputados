import { ProxyAgent, setGlobalDispatcher } from 'undici';

export const dispatcher = new ProxyAgent({
  uri: 'http://64.137.96.74:6641',
  token: `Basic ${Buffer.from('pvxyktqc:ocnk6x7m7k4v').toString('base64')}`,
});


