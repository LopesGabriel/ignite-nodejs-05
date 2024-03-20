import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  QuestionAttachment,
  QuestionAttachmentProps,
} from '@/domain/forum/enterprise/entities/question-attachment'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

export function makeQuestionAttachment(
  override: Partial<QuestionAttachmentProps> = {},
  id?: UniqueEntityId,
) {
  const questionAttachment = QuestionAttachment.create(
    {
      questionId: new UniqueEntityId(),
      attachmentId: new UniqueEntityId(),
      ...override,
    },
    id,
  )

  return questionAttachment
}

@Injectable()
export class QuestionAttachmentFactory {
  constructor(private readonly prisma: PrismaService) {}

  async makePrismaQuestionAttachment(
    data: Partial<QuestionAttachmentProps> = {},
    id?: UniqueEntityId,
  ): Promise<QuestionAttachment> {
    const questionAttachment = makeQuestionAttachment(data, id)

    await this.prisma.attachment.update({
      where: {
        id: questionAttachment.attachmentId.toString(),
      },
      data: {
        questionId: questionAttachment.questionId.toString(),
      },
    })

    return questionAttachment
  }
}
