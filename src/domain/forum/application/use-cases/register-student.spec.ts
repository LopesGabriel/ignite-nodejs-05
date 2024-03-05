import { RegisterStudentUseCase } from './register-student'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { faker } from '@faker-js/faker'

let inMemoryStudentsRepository: InMemoryStudentsRepository
let fakeHasher: FakeHasher
let sut: RegisterStudentUseCase

describe('Register Student', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository()
    fakeHasher = new FakeHasher()

    sut = new RegisterStudentUseCase(inMemoryStudentsRepository, fakeHasher)
  })

  it('should be able to register a new student', async () => {
    const name = faker.person.fullName()
    const email = faker.internet.email({
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1],
    })

    const result = await sut.execute({
      email,
      name,
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      student: inMemoryStudentsRepository.items[0],
    })
  })

  it('should hash student password upon registration', async () => {
    const name = faker.person.fullName()
    const email = faker.internet.email({
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1],
    })
    const password = '123456'

    const result = await sut.execute({
      email,
      name,
      password,
    })

    const hashedPassword = await fakeHasher.hash(password)

    expect(result.isRight()).toBe(true)
    expect(inMemoryStudentsRepository.items[0].password).toEqual(hashedPassword)
  })
})
