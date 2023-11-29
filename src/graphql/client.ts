import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { NETWORK_CHAIN_ID } from '../connectors'
import { ChainId } from '@uniswap/sdk'

const uri =
  NETWORK_CHAIN_ID === ChainId.MAINNET
    ? 'https://mxc-graph.mxc.com/subgraphs/name/ianlapham/uniswap-v2-dev'
    : 'https://mxc-graph-node.mxc.com/subgraphs/name/ianlapham/uniswap-v2-dev'
// 创建 apollo 客户端
export const client = new ApolloClient({
  // 与 API 的 HTTP 连接
  link: createHttpLink({ uri }),
  // 缓存实现
  cache: new InMemoryCache()
})
