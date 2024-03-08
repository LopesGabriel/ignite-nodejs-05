import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question'

const createAnswerQuestionBodySchema = z.object({
  content: z.string(),
})

type CreateAnswerQuestionBodySchema = z.infer<
  typeof createAnswerQuestionBodySchema
>

@Controller('/questions/:questionId/answers')
export class AnswerQuestionController {
  constructor(private readonly answerQuestion: AnswerQuestionUseCase) {}

  @Post()
  @UsePipes()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createAnswerQuestionBodySchema))
    body: CreateAnswerQuestionBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('questionId') questionId: string,
  ) {
    const { content } = body
    const userId = user.sub

    const result = await this.answerQuestion.execute({
      attachmentsIds: [],
      content,
      authorId: userId,
      questionId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
