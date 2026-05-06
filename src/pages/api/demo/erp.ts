import { demoStore } from '@/lib/demo-integration-store'

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  await demoStore.set('demo:erp', {
    receivedAt: new Date().toISOString(),
    payload: req.body,
  })

  return res.status(200).json({ success: true })
}
