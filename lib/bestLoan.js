// ts-check

const LoanJs = require('loanjs')
const rnd = require('loanjs/lib/rnd')
const Interest = require('interestjs')

/**
 * Create BestLoan Object
 * @param {number} amount - Loan amount
 * @param {number} maxMonthlyPayment - Maximum monthly payment
 * @param {number} maxInstallmentsNumber - Maximum loan term in months
 * @param {number} maxMonthlyPayment - Maximum monthly payment
 * @param {number} interestRate - Lowan intrest rate per year
 * @param {number} savingsInterestRate - Savings interest rate per year
 * @param {{accuracy: number, tax: number}} parameters - Extra optional parameters
 *
 * @return {{best: {dismishing: boolean, moneyToLoan: number, moneyToSavings: number, instNr: number, interest: object, pointOfContact:{instNr: number, const: number}}}} {
    best: {
      diminishing: false,
      moneyToLoan: 2949.44,
      moneyToSavings: 50.56,
      instNr: 204,
      loan: LoanJsObject,
      interest: IntrestJsObject,
      pointOfContact: { instNr: 146, costs: 164678.67 }
    },
    variants : [
      // all variants array
      {
        diminishing: false,
        moneyToLoan: 2949.44,
        moneyToSavings: 50.56,
        instNr: 204,
        loan: LoanJsObject,
        interest: IntrestJsObject,
        pointOfContact: { instNr: 146, costs: 164678.67 }
      },
      ...
    ]
  }
 */
function bestLoan (amount, maxMonthlyPayment, maxInstallmentsNumber, interestRate, savingsInterestRate, params) {
  if (!amount || typeof amount !== 'number' ||
     !maxMonthlyPayment || typeof maxMonthlyPayment !== 'number' ||
     !maxInstallmentsNumber || typeof maxInstallmentsNumber !== 'number' ||
     !interestRate || typeof interestRate !== 'number' ||
     !savingsInterestRate || typeof savingsInterestRate !== 'number') {
    throw new Error(`wrong parameters: ${amount} ${maxMonthlyPayment} ${maxInstallmentsNumber} ${interestRate} ${savingsInterestRate}`)
  }
  // defaults
  params = typeof params === 'object' ? params : {}
  /**
   * accuracy in months - how meny iterations will be counted in a year */
  params.accuracy = params.accuracy || 12

  const variants = []
  let instNr = maxInstallmentsNumber
  let i = 0
  let v
  let best

  const countVariant = function (instNr, diminishing) {
    const loan = new LoanJs.Loan(amount, instNr, interestRate, diminishing)
    const moneyToLoan = loan.installments[0].installment
    const moneyToSavings = rnd(maxMonthlyPayment - moneyToLoan)
    let pointOfContact
    let interest
    let intI
    let loanI
    let i = 0

    if (diminishing) {
      params.dynamicAmount = function (i) {
        if (loan.installments[i]) {
          return rnd(maxMonthlyPayment - loan.installments[i].installment)
        }
      }
    } else {
      params.dynamicAmount = undefined
    }

    if (moneyToSavings > 0) {
      interest = new Interest(moneyToSavings, instNr, savingsInterestRate, params)

      for (i; i < instNr; i++) {
        intI = interest.payments[i]
        loanI = loan.installments[i]

        if (intI.sum >= loanI.remain) {
          // in this month intrest sum is more or equal to loan remain
          // loan can be finished by putting money from saving to loan
          const diff = intI.sum - loanI.remain
          pointOfContact = {
            instNr: i,
            costs: rnd(loanI.interestSum - diff)
          }
          break
        }
      }
    }

    return {
      diminishing: !!diminishing,
      moneyToLoan: moneyToLoan,       // how mutch money go to loan installment
      moneyToSavings: moneyToSavings, // how mutch money go to savings
      instNr: instNr,
      loan: loan,
      interest: interest,
      pointOfContact: pointOfContact
    }
  }

  v = countVariant(instNr)
  while (v.pointOfContact) {
    variants.push(v)
    if (instNr > 12) {
      instNr -= params.accuracy
      v = countVariant(instNr)
    } else {
      v = {}
    }
  }

  instNr = maxInstallmentsNumber
  v = countVariant(instNr, true)
  while (v.pointOfContact) {
    variants.push(v)
    if (instNr > 12) {
      instNr -= params.accuracy
      v = countVariant(instNr, true)
    } else {
      v = {}
    }
  }

  for (i; i < variants.length; i++) {
    v = variants[i]
    if (!best || best.pointOfContact.costs > v.pointOfContact.costs) {
      best = v
    }
  }

  return {
    best: best,
    variants: variants
  }
}

module.exports = bestLoan
