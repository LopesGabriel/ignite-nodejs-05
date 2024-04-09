import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details'

export class QuestionDetailsPresenter {
  static toHTTP(question: QuestionDetails) {
    return {
      questionId: question.questionId.toString(),
      title: question.title,
      slug: question.slug.value,
      content: question.content,
      bestAnswerId: question.bestAnswerId?.toString(),
      author: question.author,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt?.toISOString(),
      attachments: question.attachments.map((attachment) => ({
        id: attachment.id.toString(),
        url: attachment.url,
        title: attachment.title,
      })),
    }
  }
}
