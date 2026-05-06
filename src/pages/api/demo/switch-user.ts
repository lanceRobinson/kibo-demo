import getConfig from 'next/config'

import { fetcher } from '@/lib/api/util'
import { getBehaviors } from '@/lib/api/util/get-behaviors'
import getUserClaimsFromRequest from '@/lib/api/util/getUserClaimsFromRequest'
import { loginMutation } from '@/lib/gql/mutations/user/login'

import type { NextApiRequest, NextApiResponse } from 'next'

const config = getConfig()
const maxCookieAge = config?.publicRuntimeConfig?.maxCookieAge
const cookieName = config?.publicRuntimeConfig?.userCookieKey?.toLowerCase()

const DEMO_USERS: Record<string, { email: string; password: string } | null> = {
  guest: null,
  tim: {
    email: process.env.DEMO_USER_TIM_EMAIL!,
    password: process.env.DEMO_USER_TIM_PASSWORD!,
  },
  jordan: {
    email: process.env.DEMO_USER_JORDAN_EMAIL!,
    password: process.env.DEMO_USER_JORDAN_PASSWORD!,
  },
}

export default async function switchUserHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { user } = req.body

  if (!user || !(user in DEMO_USERS)) {
    return res.status(400).json({ message: 'Invalid user. Must be guest, tim, or jordan.' })
  }

  // Guest — clear the auth cookie
  if (user === 'guest') {
    res.setHeader('Set-Cookie', `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`)
    return res.status(200).json({ success: true, user: 'guest' })
  }

  try {
    const credentials = DEMO_USERS[user]!
    const userClaims = await getUserClaimsFromRequest(req, res)

    const response = await fetcher(
      {
        query: loginMutation,
        variables: {
          loginInput: { username: credentials.email, password: credentials.password },
        },
      },
      { userClaims, headers: {} }
    )

    if (response?.errors) {
      throw {
        message: response.errors[0]?.extensions?.response?.body?.message || 'Login failed',
        code: response.errors[0]?.extensions?.response?.status || 401,
      }
    }

    const account = response?.data?.account
    const userId = account?.customerAccount?.userId
    const jwtAccessToken = account?.jwtAccessToken

    const cookieValue = {
      accessToken: account?.accessToken,
      accessTokenExpiration: account?.accessTokenExpiration,
      refreshToken: account?.refreshToken,
      refreshTokenExpiration: account?.refreshTokenExpiration,
      userId,
      accountId: account?.customerAccount?.id,
    }

    const encodedValue = Buffer.from(JSON.stringify(cookieValue)).toString('base64')
    res.setHeader(
      'Set-Cookie',
      `${cookieName}=${encodedValue}; HttpOnly; Max-Age=${maxCookieAge}; path=/`
    )

    const behaviors = getBehaviors(jwtAccessToken)

    return res.status(200).json({
      success: true,
      user,
      customerAccount: account?.customerAccount,
      behaviors,
    })
  } catch (error: any) {
    return res.status(error?.code || 500).json({ message: error?.message })
  }
}
