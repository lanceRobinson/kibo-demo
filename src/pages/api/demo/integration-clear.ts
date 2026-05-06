import { demoStore } from '@/lib/demo-integration-store'

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end()

  await Promise.all([demoStore.del('demo:erp'), demoStore.del('demo:wms')])

  return res.status(200).json({ success: true })
}
