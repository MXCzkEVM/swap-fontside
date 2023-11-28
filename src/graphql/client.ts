import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'

// 创建 apollo 客户端
export const client = new ApolloClient({
  // 与 API 的 HTTP 连接
  link: createHttpLink({ uri: 'https://mxc-graph-node.mxc.com/subgraphs/name/ianlapham/uniswap-v2-dev' }),
  // 缓存实现
  cache: new InMemoryCache()
})
