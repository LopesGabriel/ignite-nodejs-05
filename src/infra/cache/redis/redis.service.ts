import { EnvService } from '@/infra/env/env.service'
import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(envService: EnvService) {
    super({
      host: envService.get('REDIS_HOST'),
      port: envService.get('REDIS_PORT') as unknown as number,
      db: envService.get('REDIS_DB') as unknown as number,
    })
  }

  onModuleDestroy() {
    return this.disconnect()
  }
}
