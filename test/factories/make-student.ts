import { faker } from '@faker-js/faker'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Student,
  StudentProps,
} from '@/domain/forum/enterprise/entities/student'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaStudentMapper } from '@/infra/database/prisma/mappers/prisma-student-mapper'

export function makeStudent(
  override: Partial<StudentProps> = {},
  id?: UniqueEntityId,
) {
  const name = faker.person.fullName()

  const student = Student.create(
    {
      name,
      email: faker.internet.email({
        firstName: name.split(' ')[0],
        lastName: name.split(' ')[1],
      }),
      password: faker.internet.password(),
      ...override,
    },
    id,
  )

  return student
}

@Injectable()
export class StudentFactory {
  constructor(private readonly prisma: PrismaService) {}

  async makePrismaStudent(
    data: Partial<StudentProps> = {},
    id?: UniqueEntityId,
  ): Promise<Student> {
    const student = makeStudent(data, id)

    await this.prisma.user.create({
      data: PrismaStudentMapper.toPrisma(student),
    })

    return student
  }
}
