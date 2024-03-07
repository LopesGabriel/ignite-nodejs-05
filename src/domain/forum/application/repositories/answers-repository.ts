import { PaginationParams } from '@/core/repositories/pagination-params'
import { Answer } from '@/domain/forum/enterprise/entities/answer'

export abstract class AnswersRepository {
  abstract findById(answerId: string): Promise<Answer | null>

  abstract findManyByQuestionId(
    questionId: string,
    params: PaginationParams,
  ): Promise<Answer[]>

  abstract create(answer: Answer): Promise<void>
  abstract save(answer: Answer): Promise<void>
}
