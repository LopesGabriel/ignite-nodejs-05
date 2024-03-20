import { AppModule } from '@/infra/app.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { JwtService } from '@nestjs/jwt'
import { StudentFactory } from 'test/factories/make-student'
import { DatabaseModule } from '@/infra/database/database.module'
import { QuestionFactory } from 'test/factories/make-question'
import { join } from 'path'
import { StorageModule } from '@/infra/storage/storage.module'

describe('Upload attachment (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let studentFactory: StudentFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, StorageModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /attachments', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const filePath = join(__dirname, '../../../../test/e2e/sample-upload.jpg')

    const response = await request(app.getHttpServer())
      .post('/attachments')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', filePath)

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      attachmentId: expect.any(String),
    })
  }, 10000)
})
