import { ApolloClient, createHttpLink, InMemoryCache, useQuery } from '@apollo/client'
import { GET_LIQUIDITY_RESERVES } from './query'

// 创建 apollo 客户端
export const client = new ApolloClient({
  // 与 API 的 HTTP 连接
  link: createHttpLink({ uri: 'http://mxc-graph-node.mxc.com:8000/subgraphs/name/ianlapham/uniswap-v2-dev' }),
  // 缓存实现
  cache: new InMemoryCache()
})
