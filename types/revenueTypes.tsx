export type AccountingMethod = 'cash' | 'accrual'
export type GSTReporting = {
  GSTRegistered: boolean
  GSTReportingMethod: 'cash' | 'accrual' | ''
}

export type Deposit = {
  receivedDeposit: boolean
  depositReceivedAmount: string
  depositReceivedDate: string
}

export type Payment = {
  receivedPayment: boolean
  paymentReceivedAmount: string
  paymentReceivedDate: string
}

export type Sales = {
  salesAmount: string
  salesDate: string
}

export type Refund = {
  refunded: boolean
  refundDate: string
  refundAmount: string
}

type RawFormData<T> = {
  [Property in keyof T]: Record<keyof T[Property], string>
}

export type Revenue = {
  gstReporting: GSTReporting
  deposit: Deposit
  payment: Payment
  sales: Sales
  refund: Refund
}

export type RevenueRawFormData = RawFormData<Revenue>
