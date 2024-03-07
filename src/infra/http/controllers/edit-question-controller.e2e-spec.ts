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

describe('Edit question (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[Put] /questions/:id', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const newTitle = fakerPtBr.lorem.sentence(5)
    const newContent = fakerPtBr.lorem.paragraphs()

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const response = await request(app.getHttpServer())
      .put('/questions/' + question.id.toString())
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: newTitle, content: newContent })

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
  })
})
