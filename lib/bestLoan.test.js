/* eslint-env jest */
const bestLoan = require('./bestLoan')

test('bestLoan defined', () => {
  expect(bestLoan).toBeDefined()
})

test('loan js should count loan with equal instalment', () => {
  const result = bestLoan(500000, 5000, 12 * 30, 3.05, 6, {tax: 19})
  let v0 = result.variants[0]
  v0.interest.payments = v0.interest.payments[v0.pointOfContact.instNr]
  v0.loan.installments = ''

  // console.log(v0)

  let b = result.best
  b.interest.payments = b.interest.payments[b.pointOfContact.instNr]
  b.loan.installments = ''

  console.log(b)
})

test('bestLoan should throw', () => {
  expect(() => bestLoan(500000, 'b', 'c', 'd', 'e')).toThrowError('wrong parameters: 500000 b c d e')
})
