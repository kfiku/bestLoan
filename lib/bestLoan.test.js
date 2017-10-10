/* eslint-env jest */
const bestLoan = require('./bestLoan')

test('loan js defined', () => {
  expect(bestLoan).toBeDefined()
})

test('loan js should count loan with equal instalment', () => {
  const result = bestLoan(500000, 5000, 12 * 30, 3.05, 6)
  // console.log(result.variants[0])
  let v0 = result.variants[0]
  v0.interest.payments = ''
  v0.loan.installments = ''

  console.log(v0)

  let b = result.best
  b.interest.payments = ''
  b.loan.installments = ''

  console.log(b)
})
