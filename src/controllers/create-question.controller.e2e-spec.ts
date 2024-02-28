import { AppModule } from '@/app.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { fakerPT_BR as fakerPtBr } from '@faker-js/faker'
import { PrismaService } from '@/prisma/prisma.service'
import { hash } from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'

describe('Create question (E2E)', () => {
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

  test('[POST] /questions', async () => {
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

    const title = fakerPtBr.lorem.sentence(5)
    const content = fakerPtBr.lorem.paragraphs()

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title, content })

    expect(response.statusCode).toBe(201)

    const questionOnDatabase = await prisma.question.findFirst({
      where: { title },
    })

    expect(questionOnDatabase).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title,
        content,
        authorId: user.id,
      }),
    )
  })
})
