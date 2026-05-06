import { demoStore } from '@/lib/demo-integration-store'

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const [erp, wms] = await Promise.all([demoStore.get('demo:erp'), demoStore.get('demo:wms')])

  return res.status(200).json({ erp, wms })
}
