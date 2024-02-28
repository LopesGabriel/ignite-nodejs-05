import { AppModule } from '@/app.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { fakerPT_BR as fakerPtBr } from '@faker-js/faker'
import { PrismaService } from '@/prisma/prisma.service'
import { hash } from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'

describe('Fetch recent question (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /questions', async () => {
    const name = fakerPtBr.person.fullName()
    const email = fakerPtBr.internet.email({
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1],
    })
    const password = fakerPtBr.internet.password()

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hash(password, 8),
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    await prisma.question.createMany({
      data: [
        {
          title: 'Question 01',
          slug: 'question-01',
          content: 'Question 01 content',
          authorId: user.id,
        },
        {
          title: 'Question 02',
          slug: 'question-02',
          content: 'Question 02 content',
          authorId: user.id,
        },
        {
          title: 'Question 03',
          slug: 'question-03',
          content: 'Question 03 content',
          authorId: user.id,
        },
      ],
    })

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      questions: [
        expect.objectContaining({
          title: 'Question 01',
        }),
        expect.objectContaining({
          title: 'Question 02',
        }),
        expect.objectContaining({
          title: 'Question 03',
        }),
      ],
    })
  })
})
