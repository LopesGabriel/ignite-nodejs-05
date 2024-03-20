import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository'
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaQuestionAttachmentMapper } from '../mappers/prisma-question-attachment-mapper'

@Injectable()
export class PrismaQuestionAttachmentsRepository
  implements QuestionAttachmentsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async createMany(attachments: QuestionAttachment[]): Promise<void> {
    if (attachments.length === 0) {
      return
    }

    await this.prisma.attachment.updateMany({
      where: {
        id: {
          in: attachments.map((attachment) =>
            attachment.attachmentId.toString(),
          ),
        },
      },
      data: {
        questionId: attachments[0].questionId.toString(),
      },
    })
  }

  async deleteMany(attachments: QuestionAttachment[]): Promise<void> {
    if (attachments.length === 0) {
      return
    }

    await this.prisma.attachment.deleteMany({
      where: {
        id: {
          in: attachments.map((attachment) =>
            attachment.attachmentId.toString(),
          ),
        },
      },
    })
  }

  async findManyByQuestionId(
    questionId: string,
  ): Promise<QuestionAttachment[]> {
    const questionAttachments = await this.prisma.attachment.findMany({
      where: {
        questionId,
      },
    })

    return questionAttachments.map(PrismaQuestionAttachmentMapper.toDomain)
  }

  async deleteManyByQuestionId(questionId: string): Promise<void> {
    await this.prisma.attachment.deleteMany({
      where: {
        questionId,
      },
    })
  }
}
