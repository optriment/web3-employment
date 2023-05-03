import getConfig from 'next/config'
import type { NextApiRequest, NextApiResponse } from 'next'

const { publicRuntimeConfig } = getConfig()
const tronNetwork = publicRuntimeConfig.tronNetwork
const apiURL =
  tronNetwork === 'mainnet' ? 'api.trongrid.io' : 'api.shasta.trongrid.io'

type Data = {
  status: string
  error_message?: string
}

const catchError = (e: unknown) => {
  if (e instanceof Error) {
    return e.message
  }

  try {
    return JSON.stringify(e)
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return String(e)
  }
}

const getTransactionById = async (txID: string) => {
  const response = await fetch(`https://${apiURL}/wallet/gettransactionbyid`, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      value: txID,
    }),
    method: 'POST',
  })

  const json = await response.json()

  return json
}

const getTransactionInfoById = async (txID: string) => {
  const response = await fetch(
    `https://${apiURL}/wallet/gettransactioninfobyid`,
    {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        value: txID,
      }),
      method: 'POST',
    }
  )

  const json = await response.json()

  return json
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const txID = req.query.id

  if (!txID) {
    res.status(422)
    res.json({
      status: 'error',
      error_message: 'Please provide id as a query argument',
    })
    return res.end()
  }

  try {
    const transaction = await getTransactionById(txID.toString())

    if (!Object.keys(transaction).length) {
      res.status(400)
      res.json({
        status: 'retry',
      })
      return res.end()
    }

    console.log({ transaction })
    const contractAddress =
      transaction.raw_data.contract[0].parameter.value.contract_address

    if (!contractAddress) {
      res.status(400)
      res.json({
        status: 'error',
        error_message: 'No contract found for this transaction hash',
      })
      return res.end()
    }

    const txStatus = transaction.ret[0].contractRet

    switch (txStatus) {
      case 'OUT_OF_ENERGY':
      case 'REVERT': {
        // TODO: Catch custom errors from blockchain
        const transactionInfo = await getTransactionInfoById(txID.toString())

        if (!Object.keys(transactionInfo).length) {
          res.status(400)
          res.json({
            status: 'retry',
          })
          return res.end()
        }

        let hexEncodedResult =
          '' == transactionInfo.contractResult[0]
            ? transactionInfo.resMessage
            : '0x' + transactionInfo.contractResult[0]

        hexEncodedResult = hexEncodedResult.substring(
          hexEncodedResult.length - 64,
          hexEncodedResult.length
        )

        const resMessage = Buffer.from(hexEncodedResult, 'hex')
          .toString('utf8')
          .replace(/\0/g, '')

        res.status(200)
        res.json({
          status: 'reverted',
          error_message: resMessage.replace(/\0/g, ''),
        })
        return res.end()
      }

      case 'SUCCESS': {
        res.status(200)
        res.json({
          status: 'success',
        })
        return res.end()
      }

      default: {
        res.status(400)
        res.json({
          status: 'error',
          error_message: `Unknown txStatus: ${txStatus}`,
        })
        return res.end()
      }
    }
  } catch (e) {
    res.status(400)
    res.json({
      status: 'error',
      error_message: catchError(e),
    })
    return res.end()
  }
}
