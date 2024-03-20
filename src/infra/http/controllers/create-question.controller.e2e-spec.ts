import { AppModule } from '@/infra/app.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { fakerPT_BR as fakerPtBr } from '@faker-js/faker'
import { JwtService } from '@nestjs/jwt'
import { StudentFactory } from 'test/factories/make-student'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { AttachmentFactory } from 'test/factories/make-attachment'

describe('Create question (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let studentFactory: StudentFactory
  let attachmentFactory: AttachmentFactory
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /questions', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const attachments = await Promise.all([
      attachmentFactory.makePrismaAttachment(),
      attachmentFactory.makePrismaAttachment(),
    ])

    const title = fakerPtBr.lorem.sentence(5)
    const content = fakerPtBr.lorem.paragraphs()

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title,
        content,
        attachments: attachments.map((attachment) => attachment.id.toString()),
      })

    expect(response.statusCode).toBe(201)

    const questionOnDatabase = await prisma.question.findFirst({
      where: { title },
    })

    expect(questionOnDatabase).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title,
        content,
        authorId: user.id.toString(),
      }),
    )

    const attachmentsOnDatabase = await prisma.attachment.findMany({
      where: { questionId: questionOnDatabase?.id },
    })

    expect(attachmentsOnDatabase).toHaveLength(2)
  })
})
