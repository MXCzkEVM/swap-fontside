/* eslint-disable @typescript-eslint/no-use-before-define */
import { JSBI, Pair, Percent, TokenAmount } from '@uniswap/sdk'
import { darken } from 'polished'
import React, { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { ExternalLink } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { ButtonSecondary } from '../Button'

import Card, { GreyCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { Dots } from '../swap/styleds'
import { INFO_URL } from '../../constants/lists'
import { useTranslation } from 'react-i18next'
import { GET_LIQUIDITY_RESERVES } from '../../graphql'
import { useQuery } from '@apollo/client'
import { BigNumber } from 'bignumber.js'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.bg2};
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`

interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
}

export function MinimalPositionCard({ pair, showUnwrapped = false, border }: PositionCardProps) {
  const { account } = useActiveWeb3React()
  const { t } = useTranslation()

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  const pairRecord = usePairRecord(pair)
  const [reserve0, reserve1] = usePositionAmounts(pairRecord)
  const [apy0, apy1] = useCalculateApy(pairRecord, token0Deposited, token1Deposited)

  return (
    <>
      {userPoolBalance && (
        <GreyCard border={border}>
          <AutoColumn gap="12px">
            <FixedHeightRow>
              <RowFixed>
                <Text fontWeight={500} fontSize={16}>
                  {t('Your position')}
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <FixedHeightRow onClick={() => setShowMore(!showMore)}>
              <RowFixed>
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
                <Text fontWeight={500} fontSize={20}>
                  {currency0.symbol}/{currency1.symbol}
                </Text>
              </RowFixed>
              <RowFixed>
                <Text fontWeight={500} fontSize={20}>
                  {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <PositionAmounts
              l={{
                symbol: currency0.symbol,
                amount: token0Deposited?.toSignificant(6, undefined, 0),
                apy: apy0
              }}
              p={{
                symbol: currency1.symbol,
                amount: token1Deposited?.toSignificant(6, undefined, 0),
                apy: apy1
              }}
            />
            {pairRecord && (
              <>
                <FixedHeightRow>
                  <RowFixed>
                    <Text fontWeight={500} fontSize={16}>
                      {t('Initial LP supply')}
                    </Text>
                  </RowFixed>
                </FixedHeightRow>
                <PositionAmounts
                  l={{
                    symbol: currency0.symbol,
                    amount: reserve0
                  }}
                  p={{
                    symbol: currency1.symbol,
                    amount: reserve1
                  }}
                />
              </>
            )}
          </AutoColumn>
        </GreyCard>
      )}
    </>
  )
}

export default function FullPositionCard({ pair, border }: PositionCardProps) {
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  const pairRecord = usePairRecord(pair)
  const [reserve0, reserve1] = usePositionAmounts(pairRecord)
  const [apy0, apy1] = useCalculateApy(pairRecord, token0Deposited, token1Deposited)

  return (
    <HoverCard border={border}>
      <AutoColumn gap="12px">
        <FixedHeightRow onClick={() => setShowMore(!showMore)} style={{ cursor: 'pointer' }}>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
            <Text fontWeight={500} fontSize={20}>
              {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}/${currency1.symbol}`}
            </Text>
          </RowFixed>
          <RowFixed>
            {showMore ? (
              <ChevronUp size="20" style={{ marginLeft: '10px' }} />
            ) : (
              <ChevronDown size="20" style={{ marginLeft: '10px' }} />
            )}
          </RowFixed>
        </FixedHeightRow>
        {showMore && (
          <AutoColumn gap="8px">
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  {t('Pooled')} {currency0.symbol}:
                </Text>
              </RowFixed>
              {token0Deposited ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                    {token0Deposited?.toSignificant(6)}
                    {apy0 ? `(${apy0})` : ''}
                  </Text>
                  <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>

            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  {t('Pooled')} {currency1.symbol}:
                </Text>
              </RowFixed>
              {token1Deposited ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                    {token1Deposited?.toSignificant(6)}
                    {apy1 ? `(${apy1})` : ''}
                  </Text>
                  <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>

            {pairRecord && (
              <>
                <FixedHeightRow>
                  <RowFixed>
                    <Text fontWeight={500} fontSize={16}>
                      {t('Initial')} {currency0.symbol}:
                    </Text>
                  </RowFixed>
                  <Text fontSize={16} fontWeight={500}>
                    {reserve0}
                  </Text>
                </FixedHeightRow>
                <FixedHeightRow>
                  <RowFixed>
                    <Text fontWeight={500} fontSize={16}>
                      {t('Initial')} {currency1.symbol}:
                    </Text>
                  </RowFixed>
                  <Text fontSize={16} fontWeight={500}>
                    {reserve1}
                  </Text>
                </FixedHeightRow>
              </>
            )}

            <FixedHeightRow>
              <Text fontSize={16} fontWeight={500}>
                {t('Your pool tokens')}:
              </Text>
              <Text fontSize={16} fontWeight={500}>
                {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
              </Text>
            </FixedHeightRow>
            <FixedHeightRow>
              <Text fontSize={16} fontWeight={500}>
                {t('Your pool share')}:
              </Text>
              <Text fontSize={16} fontWeight={500}>
                {poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '-'}
              </Text>
            </FixedHeightRow>

            <AutoRow justify="center" marginTop={'10px'}>
              <ExternalLink href={`${INFO_URL}/pair/${pair.liquidityToken.address}`}>
                {t('View pool information')} ↗
              </ExternalLink>
            </AutoRow>
            <RowBetween marginTop="10px">
              <ButtonSecondary as={Link} to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`} width="48%">
                {t('Add')}
              </ButtonSecondary>
              <ButtonSecondary as={Link} width="48%" to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}>
                {t('Remove')}
              </ButtonSecondary>
            </RowBetween>
          </AutoColumn>
        )}
      </AutoColumn>
    </HoverCard>
  )
}

export function PositionAmounts(props: {
  l: { amount?: string; symbol?: string; apy?: string | number }
  p: { amount?: string; symbol?: string; apy?: string | number }
}) {
  return (
    <>
      <AutoColumn gap="4px">
        <FixedHeightRow>
          <Text color="#888D9B" fontSize={16} fontWeight={500}>
            {props.l.symbol}:
          </Text>
          {props.l.amount ? (
            <RowFixed>
              <Text color="#888D9B" fontSize={16} fontWeight={500} marginLeft={'6px'}>
                {props.l.amount}
                {props.l.apy ? `(${props.l.apy})` : ''}
              </Text>
            </RowFixed>
          ) : (
            '-'
          )}
        </FixedHeightRow>
        <FixedHeightRow>
          <Text color="#888D9B" fontSize={16} fontWeight={500}>
            {props.p.symbol}:
          </Text>
          {props.p.amount ? (
            <RowFixed>
              <Text color="#888D9B" fontSize={16} fontWeight={500} marginLeft={'6px'}>
                {props.p.amount}
                {props.p.apy ? `(${props.p.apy})` : ''}
              </Text>
            </RowFixed>
          ) : (
            '-'
          )}
        </FixedHeightRow>
      </AutoColumn>
    </>
  )
}

function usePairRecord(pair: Pair) {
  const { account } = useActiveWeb3React()
  const { data, loading } = useQuery(GET_LIQUIDITY_RESERVES, {
    variables: {
      userId: account?.toLowerCase(),
      token0: pair.token0.address.toLowerCase(),
      token1: pair.token1.address.toLowerCase()
    },
    pollInterval: 50000
  })
  return useMemo(() => {
    let liquidityPositions: any[]
    liquidityPositions = data?.liquidityPositions || []
    liquidityPositions = liquidityPositions.map<any>(l => l.pair)

    if (!liquidityPositions.length) return

    const records = liquidityPositions.filter((l: any) => {
      return (
        l.token0.id === pair.token0.address.toLowerCase() &&
        l.token0.symbol === pair.token0.symbol?.toLocaleUpperCase() &&
        l.token1.id === pair.token1.address.toLowerCase() &&
        l.token1.symbol === pair.token1.symbol?.toLocaleUpperCase()
      )
    })

    if (!records[0]) return

    return records[0]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, pair, loading])
}
function usePositionAmounts(record: any) {
  if (!record) return ['', '']
  return [
    trimZeroEnd(new BigNumber(record.reserve0).toFixed(3, BigNumber.ROUND_DOWN)),
    trimZeroEnd(new BigNumber(record.reserve1).toFixed(3, BigNumber.ROUND_DOWN))
  ]
}
function useCalculateApy(record: any, token0?: TokenAmount, token1?: TokenAmount) {
  return [
    calculateApy(record?.reserve0, token0?.toExact(), record?.createdAtTimestamp),
    calculateApy(record?.reserve0, token1?.toExact(), record?.createdAtTimestamp)
  ]
}

function trimZeroEnd(input: string | number) {
  input = String(input)
  const dotIndex = input.indexOf('.')
  if (dotIndex === -1) {
    // 如果没有小数点，直接返回原始字符串
    return input
  }

  let end = input.length - 1
  while (end > dotIndex && input[end] === '0') end--
  if (input[end] === '.') end--
  return input.substring(0, end + 1)
}
function calculateApy(init: number | string | undefined = 0, end: number | string = init, timestamp = 0) {
  if (init === 0) return 0

  const principal = Number(init)
  const finalAmount = Number(end)
  const days = Number(daysAgoFromTimestamp(timestamp))

  const rate = (finalAmount / principal - 1) * (365 / days) * 100

  const value = trimZeroEnd(Number(rate.toFixed(4)))
  if (Number(value) === 0 || value.startsWith('-')) return 0
  return value === '0' ? 0 : `${value}%`
}
function daysAgoFromTimestamp(unixTimestamp: number) {
  const timestampDate = new Date(unixTimestamp * 1000)
  const currentDate = new Date()
  const differenceInMilliseconds = currentDate.getTime() - timestampDate.getTime()
  const differenceInDays = Math.floor(differenceInMilliseconds / (24 * 60 * 60 * 1000))
  return differenceInDays
}
