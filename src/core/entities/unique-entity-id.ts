import { randomUUID } from 'crypto'

export class UniqueEntityId {
  private value: string

  toString() {
    return this.value
  }

  toValue() {
    return this.value
  }

  constructor(value?: string) {
    this.value = value ?? randomUUID()
  }

  equals(id: unknown) {
    if (!(id instanceof UniqueEntityId)) {
      return false
    }

    return id.toValue() === this.value
  }
}
