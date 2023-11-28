import { gql } from '@apollo/client'

export const GET_LIQUIDITY_RESERVES = gql`
  query get_liquidityPositions_reserves($userId: ID) {
    liquidityPositionSnapshots(where: { user: $userId }) {
      liquidityTokenBalance
      pair {
        totalSupply
        reserve0
        reserve1
        id
        token0 {
          id
          symbol
        }
        token0Price
        token1Price
        token1 {
          id
          symbol
        }
      }
      timestamp
    }
  }
`
