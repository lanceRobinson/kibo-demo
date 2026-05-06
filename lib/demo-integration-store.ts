type DemoPayload = Record<string, unknown> | null

const memStore: Record<string, DemoPayload> = {}

const hasKvConfig = () =>
  !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

async function set(key: string, value: DemoPayload) {
  if (hasKvConfig()) {
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    await redis.set(key, value, { ex: 7200 })
  } else {
    memStore[key] = value
  }
}

async function get(key: string): Promise<DemoPayload> {
  if (hasKvConfig()) {
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    return redis.get<DemoPayload>(key)
  }
  return memStore[key] ?? null
}

async function del(key: string) {
  if (hasKvConfig()) {
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    await redis.del(key)
  } else {
    delete memStore[key]
  }
}

export const demoStore = { set, get, del }
