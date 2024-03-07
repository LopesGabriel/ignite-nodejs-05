import { AppModule } from '@/infra/app.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { fakerPT_BR as fakerPtBr } from '@faker-js/faker'
import { hash } from 'bcryptjs'
import { StudentFactory } from 'test/factories/make-student'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)

    await app.init()
  })

  test('[POST] /sessions', async () => {
    const name = fakerPtBr.person.fullName()
    const email = fakerPtBr.internet.email({
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1],
    })
    const password = fakerPtBr.internet.password()

    await studentFactory.makePrismaStudent({
      email,
      name,
      password: await hash(password, 8),
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
