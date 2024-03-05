import { faker } from '@faker-js/faker'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Student,
  StudentProps,
} from '@/domain/forum/enterprise/entities/student'

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
