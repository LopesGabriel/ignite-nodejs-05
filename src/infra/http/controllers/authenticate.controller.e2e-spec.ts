import { AppModule } from '@/infra/app.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { fakerPT_BR as fakerPtBr } from '@faker-js/faker'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { hash } from 'bcryptjs'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /sessions', async () => {
    const name = fakerPtBr.person.fullName()
    const email = fakerPtBr.internet.email({
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1],
    })
    const password = fakerPtBr.internet.password()

    await prisma.user.create({
      data: {
        name,
        email,
        password: await hash(password, 8),
      },
    })

    const response = await request(app.getHttpServer())
      .post('/sessions')
      .send({ email, password })

    expect(response.statusCode).toBe(200)

    expect(response.body).toEqual({
      access_token: expect.any(String),
    })
  })
})
