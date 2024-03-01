import { Slug } from './slug'

test('it should be able to create a new slug from text', () => {
  const slug = Slug.createFromText('Example question title')
  const slug2 = Slug.createFromText('Example question title $ $ two')

  expect(slug.value).toEqual('example-question-title')
  expect(slug2.value).toEqual('example-question-title-two')
})
