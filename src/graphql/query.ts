import { gql } from '@apollo/client'

export const GET_LIQUIDITY_RESERVES = gql`
  query get_liquidityPositions_reserves($userId: ID) {
    liquidityPositions(where: { user: $userId }) {
      pair {
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
        createdAtTimestamp
      }
    }
  }
`
