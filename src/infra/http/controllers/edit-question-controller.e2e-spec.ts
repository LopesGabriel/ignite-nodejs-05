import { AppModule } from '@/infra/app.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { fakerPT_BR as fakerPtBr } from '@faker-js/faker'
import { JwtService } from '@nestjs/jwt'
import { StudentFactory } from 'test/factories/make-student'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { QuestionFactory } from 'test/factories/make-question'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { QuestionAttachmentFactory } from 'test/factories/make-question-attachment'

describe('Edit question (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let attachmentFactory: AttachmentFactory
  let questionAttachmentFactory: QuestionAttachmentFactory
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        QuestionAttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[Put] /questions/:id', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const newTitle = fakerPtBr.lorem.sentence(5)
    const newContent = fakerPtBr.lorem.paragraphs()

    const attachments = await Promise.all([
      attachmentFactory.makePrismaAttachment(),
      attachmentFactory.makePrismaAttachment(),
    ])

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    await Promise.all(
      attachments.map((attachment) =>
        questionAttachmentFactory.makePrismaQuestionAttachment({
          questionId: question.id,
          attachmentId: attachment.id,
        }),
      ),
    )

    const attachment3 = await attachmentFactory.makePrismaAttachment()
    const [attachment1] = attachments

    const response = await request(app.getHttpServer())
      .put('/questions/' + question.id.toString())
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: newTitle,
        content: newContent,
        attachments: [attachment1.id.toString(), attachment3.id.toString()],
      })

    expect(response.statusCode).toBe(204)

    const questionOnDatabase = await prisma.question.findFirst({
      where: {
        title: newTitle,
        content: newContent,
      },
    })

    expect(questionOnDatabase).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: newTitle,
        content: newContent,
        authorId: user.id.toString(),
      }),
    )

    const attachmentsOnDatabase = await prisma.attachment.findMany({
      where: { questionId: questionOnDatabase?.id },
    })

    expect(attachmentsOnDatabase).toHaveLength(2)
    expect(attachmentsOnDatabase).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: attachment1.id.toString() }),
        expect.objectContaining({ id: attachment3.id.toString() }),
      ]),
    )
  })
})
