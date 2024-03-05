import { User as PrismaStudent, Prisma } from '@prisma/client'
import { Student } from '@/domain/forum/enterprise/entities/student'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

export class PrismaStudentMapper {
  static toDomain(raw: PrismaStudent): Student {
    return Student.create(
      {
        email: raw.email,
        name: raw.name,
        password: raw.password,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(student: Student): Prisma.UserUncheckedCreateInput {
    return {
      id: student.id ? student.id.toString() : undefined,
      email: student.email,
      name: student.name,
      password: student.password,
    }
  }
}
