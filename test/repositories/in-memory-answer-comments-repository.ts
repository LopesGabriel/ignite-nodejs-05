import { PaginationParams } from '@/core/repositories/pagination-params'
import { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository'
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment'

export class InMemoryAnswerCommentsRepository
  implements AnswerCommentsRepository
{
  public items: AnswerComment[] = []

  async findManyByAnswerId(
    answerId: string,
    { page }: PaginationParams,
  ): Promise<AnswerComment[]> {
    const questionComments = this.items
      .filter((item) => item.answerId.toString() === answerId)
      .slice((page - 1) * 20, page * 20)

    return questionComments
  }

  async findById(id: string): Promise<AnswerComment | null> {
    return this.items.find((question) => question.id.toValue() === id) ?? null
  }

  async create(questionComment: AnswerComment) {
    this.items.push(questionComment)
    return questionComment
  }

  async delete(questionComment: AnswerComment): Promise<void> {
    this.items = this.items.filter(
      (q) => q.id.toValue() !== questionComment.id.toValue(),
    )
  }
}
