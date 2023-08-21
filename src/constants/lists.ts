import { ChainId } from '@uniswap/sdk'


const NETWORK_CHAIN_ID: ChainId = process.env.REACT_APP_CHAIN_ID ? parseInt(process.env.REACT_APP_CHAIN_ID) : ChainId.WANNSEEMAINNET
const Router_MAP: { [key in ChainId]: string } = {
  [ChainId.MAINNET]: "https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json",
  [ChainId.WANNSEE]: 'https://raw.githubusercontent.com/MXCzkEVM/wannseeswap-tokenlist/main/tokenlist.json?version=8',
  [ChainId.WANNSEEMAINNET]: 'https://raw.githubusercontent.com/MXCzkEVM/wannseeswap-tokenlist/main/tokenlist-mainnet.json?version=1',
  [ChainId.HARDHAT]: '',
}

// the Uniswap Default token list lives here
// export const DEFAULT_TOKEN_LIST_URL = 'tokens.uniswap.eth'
export const DEFAULT_TOKEN_LIST_URL = Router_MAP[NETWORK_CHAIN_ID]

// 'https://raw.githubusercontent.com/MXCzkEVM/wannseeswap-tokenlist/main/tokenlist.json?version=7'
// https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json

// export const DEFAULT_LIST_OF_LISTS: string[] = [
//   DEFAULT_TOKEN_LIST_URL,
//   't2crtokens.eth', // kleros
//   'tokens.1inch.eth', // 1inch
//   'synths.snx.eth',
//   'tokenlist.dharma.eth',
//   'defi.cmc.eth',
//   'erc20.cmc.eth',
//   'stablecoin.cmc.eth',
//   'tokenlist.zerion.eth',
//   'tokenlist.aave.eth',
//   'https://www.coingecko.com/tokens_list/uniswap/defi_100/v_0_0_0.json',
//   'https://app.tryroll.com/tokens.json',
//   'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
//   'https://defiprime.com/defiprime.tokenlist.json',
//   'https://umaproject.org/uma.tokenlist.json'
// ]

export const DEFAULT_LIST_OF_LISTS: string[] = [DEFAULT_TOKEN_LIST_URL]
