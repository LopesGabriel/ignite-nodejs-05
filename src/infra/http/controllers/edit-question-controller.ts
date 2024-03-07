import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  UsePipes,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { EditQuestionUseCase } from '@/domain/forum/application/use-cases/edit-question'

const editQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

type EditQuestionBodySchema = z.infer<typeof editQuestionBodySchema>

@Controller('/questions/:id')
export class EditQuestionController {
  constructor(private readonly editQuestion: EditQuestionUseCase) {}

  @Put()
  @UsePipes()
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipe(editQuestionBodySchema))
    body: EditQuestionBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('id') questionId: string,
  ) {
    const { title, content } = body

    const result = await this.editQuestion.execute({
      questionId,
      title,
      content,
      authorId: user.sub,
      attachmentsIds: [],
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
