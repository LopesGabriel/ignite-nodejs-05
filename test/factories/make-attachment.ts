import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Attachment,
  AttachmentProps,
} from '@/domain/forum/enterprise/entities/attachment'
import { PrismaAttachmentMapper } from '@/infra/database/prisma/mappers/prisma-attachment-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

export function makeAttachment(
  override: Partial<AttachmentProps> = {},
  id?: UniqueEntityId,
) {
  const attachment = Attachment.create(
    {
      title: faker.lorem.slug(),
      url: faker.string.uuid(),
      ...override,
    },
    id,
  )

  return attachment
}

@Injectable()
export class AttachmentFactory {
  constructor(private readonly prisma: PrismaService) {}

  async makePrismaAttachment(
    data: Partial<AttachmentProps> = {},
    id?: UniqueEntityId,
  ): Promise<Attachment> {
    const attachment = makeAttachment(data, id)

    await this.prisma.attachment.create({
      data: PrismaAttachmentMapper.toPrisma(attachment),
    })

    return attachment
  }
}
