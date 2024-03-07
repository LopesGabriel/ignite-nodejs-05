import { AppModule } from '@/infra/app.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { fakerPT_BR as fakerPtBr } from '@faker-js/faker'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { hash } from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'

describe('Get question by slug (E2E)', () => {
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

  test('[GET] /questions/:slug', async () => {
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

    await prisma.question.create({
      data: {
        title: 'Question 01',
        slug: 'question-01',
        content: 'Question 01 content',
        authorId: user.id,
      },
    })

    const response = await request(app.getHttpServer())
      .get('/questions/question-01')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      question: expect.objectContaining({
        title: 'Question 01',
      }),
    })
  })
})
