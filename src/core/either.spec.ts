import { Either, Right, left, right } from './either'

function doSomething(shouldSuccess: boolean): Either<string, number> {
  if (shouldSuccess) {
    return right(10)
  } else {
    return left('error')
  }
}

it('success result', () => {
  const success = doSomething(true)

  expect(success.value).toEqual(10)
  expect(success).toBeInstanceOf(Right)
  expect(success.isRight()).toBe(true)
})

it('error result', () => {
  const error = right('error')

  expect(error.value).toEqual('error')
})
