import { useEffect, useState, useRef } from 'react';
import type {
  AccountingMethod,
  GSTReporting,
  Deposit,
  Payment,
  Sales,
  Refund,
} from '../../types/revenueTypes';
import axios from 'axios';
import { getSmallerDates, changeDateFormat } from '@/Utils/dates';
import Entry from '../../components/revenue/Entry';

export default function Home() {
  const [accountingMethod, setAccountingMethod] =
    useState<AccountingMethod>('cash');
  const [GSTReporting, setGSTReporting] = useState<GSTReporting>({
    GSTRegistered: false,
    GSTReportingMethod: '',
  });
  const [deposit, setDeposit] = useState<Deposit>({
    receivedDeposit: false,
    depositReceivedAmount: '',
    depositReceivedDate: '',
  });

  const [payment, setPayment] = useState<Payment>({
    receivedPayment: false,
    paymentReceivedAmount: '',
    paymentReceivedDate: '',
  });
  const [sales, setSales] = useState<Sales>({
    salesAmount: '',
    salesDate: '',
  });
  const [refund, setRefund] = useState<Refund>({
    refunded: false,
    refundDate: '',
    refundAmount: '',
  });

  const GSTReportingMethodRef = useRef<HTMLSelectElement>(null);

  const [entries, setEntries] = useState<any[] | null>(null);

  useEffect(() => {
    if (accountingMethod === 'cash' && GSTReporting.GSTRegistered === true) {
      setGSTReporting((GSTReporting) => {
        return { ...GSTReporting, GSTReportingMethod: 'cash' };
      });
      if (GSTReportingMethodRef.current) {
        GSTReportingMethodRef.current.disabled = true;
      }
    } else {
      if (GSTReportingMethodRef.current) {
        GSTReportingMethodRef.current.disabled = false;
      }
    }
  }, [accountingMethod, GSTReporting.GSTRegistered]);

  useEffect(() => {
    if (accountingMethod === 'cash') {
      setSales({
        salesAmount: '',
        salesDate: '',
      });
    }
  }, [accountingMethod]);

  useEffect(() => {
    if (payment.receivedPayment === false) {
      setRefund({
        refunded: false,
        refundAmount: '',
        refundDate: '',
      });
    }
  }, [payment]);

  const handleFormSubmission = async (e: any) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/revenue', {
        fields: {
          accountingMethod,
          GSTReporting,
          deposit: {
            ...deposit,
            depositReceivedAmount: Number(deposit.depositReceivedAmount) * 100,
            depositReceivedDate: changeDateFormat(deposit.depositReceivedDate),
          },
          payment: {
            ...payment,
            paymentReceivedAmount: Number(payment.paymentReceivedAmount) * 100,
            paymentReceivedDate: changeDateFormat(payment.paymentReceivedDate),
          },
          sales: {
            salesDate: changeDateFormat(sales.salesDate),
            salesAmount: Number(sales.salesAmount) * 100,
          },
          refund: {
            ...refund,
            refundAmount: Number(refund.refundAmount) * 100,
            refundDate: changeDateFormat(refund.refundDate),
          },
        },
      });

      const data = await response.data;

      if (data.length > 0) {
        setEntries(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormReset = () => {
    setAccountingMethod('cash');
    setGSTReporting({ GSTRegistered: false, GSTReportingMethod: '' });
    setDeposit({
      receivedDeposit: false,
      depositReceivedAmount: '',
      depositReceivedDate: '',
    });
    setPayment({
      receivedPayment: false,
      paymentReceivedAmount: '',
      paymentReceivedDate: '',
    });
    setSales({ salesAmount: '', salesDate: '' });
    setRefund({ refunded: false, refundDate: '', refundAmount: '' });
  };
  return (
    <div className="h-full p-12 flex flex-col md:flex-row gap-x-6 gap-y-3 overflow-y-auto">
      <h1 className=" fixed top-0 left-0 bg-white font-bold text-2xl py-6 w-full text-center capitalize">
        Revenue journal entry generator
      </h1>
      <section className=" basis-1/2 ">
        <form
          onSubmit={handleFormSubmission}
          onReset={handleFormReset}
          className="max-h-full mt-16 flex flex-col gap-y-6 mr-6 md:overflow-y-auto pb-12 pr-6"
        >
          <div className="flex flex-col gap-y-6 border-y-2 py-6 ">
            <div>
              <label htmlFor="accountingMethod">Accounting Method: </label>
              <select
                name="accountingMethod"
                id="accountingMethod"
                value={accountingMethod}
                onChange={(e) => {
                  setAccountingMethod(e.target.value as AccountingMethod);
                }}
              >
                <option value="cash">Cash</option>
                <option value="accrual">Accrual</option>
              </select>
            </div>
            <div className="flex">
              <div className="basis-1/2">
                <label htmlFor="GSTRegistered">GSTRegistered:</label>
                <select
                  name="GSTRegistered"
                  id="GSTRegistered"
                  value={GSTReporting.GSTRegistered.toString()}
                  onChange={(e) => {
                    if (e.target.value === 'true') {
                      setGSTReporting({
                        ...GSTReporting,
                        GSTRegistered: true,
                      });
                    } else {
                      setGSTReporting({
                        GSTRegistered: false,
                        GSTReportingMethod: '',
                      });
                    }
                  }}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              {GSTReporting.GSTRegistered === true && (
                <div className="basis-1/2">
                  <label htmlFor="GSTReportingMethod">
                    GST Reporting Method:{' '}
                  </label>
                  <select
                    required
                    name="GSTReportingMethod"
                    id="GSTReportingMethod"
                    value={GSTReporting.GSTReportingMethod}
                    onChange={(e) =>
                      setGSTReporting({
                        ...GSTReporting,
                        GSTReportingMethod: e.target.value as AccountingMethod,
                      })
                    }
                    ref={GSTReportingMethodRef}
                  >
                    <option value="" disabled></option>
                    <option value="cash">Cash</option>
                    <option value="accrual">Accrual</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <div>
                <label htmlFor="receivedDeposit">
                  Did You Receive a Deposit:
                </label>
                <select
                  name="receivedDeposit"
                  id="receivedDeposit"
                  value={deposit.receivedDeposit.toString()}
                  onChange={(e) => {
                    if (e.target.value === 'true') {
                      setDeposit({
                        ...deposit,
                        receivedDeposit: true,
                      });
                    } else {
                      setDeposit({
                        receivedDeposit: false,
                        depositReceivedAmount: '',
                        depositReceivedDate: '',
                      });
                    }
                  }}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {deposit.receivedDeposit && (
                <div className="flex">
                  <div className="basis-1/2">
                    <label htmlFor="depositReceivedDate">Deposit Date: </label>
                    <input
                      required
                      type="date"
                      id="depositReceivedDate"
                      name="depositReceivedDate"
                      value={deposit.depositReceivedDate}
                      max={getSmallerDates(
                        payment.paymentReceivedDate,
                        sales.salesDate
                      )}
                      onChange={(e) =>
                        setDeposit({
                          ...deposit,
                          [e.target.name]: e.target.value,
                        })
                      }
                    ></input>
                  </div>
                  <div className="basis-1/2">
                    <label htmlFor="depositReceivedAmount">
                      Deposit Amount:{' '}
                    </label>
                    <input
                      required
                      type="number"
                      id="depositReceivedAmount"
                      name="depositReceivedAmount"
                      placeholder="$1000.00"
                      step="0.01"
                      min={0}
                      max={
                        !sales.salesAmount
                          ? undefined
                          : GSTReporting.GSTRegistered
                          ? (Number(sales.salesAmount) / 10) * 11
                          : Number(sales.salesAmount)
                      }
                      value={deposit.depositReceivedAmount}
                      onChange={(e) =>
                        setDeposit({
                          ...deposit,
                          [e.target.name]: e.target.value,
                        })
                      }
                    ></input>
                  </div>
                </div>
              )}
            </div>
            <div>
              <div>
                <label htmlFor="receivedPayment">
                  Did You Receive a Payment:
                </label>
                <select
                  name="receivedPayment"
                  id="receivedPayment"
                  value={payment.receivedPayment.toString()}
                  onChange={(e) => {
                    if (e.target.value === 'true') {
                      setPayment({
                        ...payment,
                        receivedPayment: true,
                      });
                    } else {
                      setPayment({
                        receivedPayment: false,
                        paymentReceivedAmount: '',
                        paymentReceivedDate: '',
                      });
                    }
                  }}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {payment.receivedPayment === true && (
                <div className="flex">
                  <div className="basis-1/2">
                    <label htmlFor="paymentReceivedDate">Payment Date: </label>
                    <input
                      required
                      type="date"
                      id="paymentReceivedDate"
                      name="paymentReceivedDate"
                      value={payment.paymentReceivedDate}
                      min={
                        deposit.depositReceivedDate
                          ? deposit.depositReceivedDate
                          : undefined
                      }
                      max={
                        refund.refundDate
                          ? refund.refundDate
                          : new Date().toISOString().split('T')[0]
                      }
                      onChange={(e) =>
                        setPayment({
                          ...payment,
                          [e.target.name]: e.target.value,
                        })
                      }
                    ></input>
                  </div>
                  <div className="basis-1/2">
                    <label htmlFor="paymentReceivedAmount">
                      Payment Amount:{' '}
                    </label>
                    <input
                      required
                      type="number"
                      id="paymentReceivedAmount"
                      name="paymentReceivedAmount"
                      step="0.01"
                      min={0}
                      max={
                        sales.salesAmount
                          ? Number(sales.salesAmount) -
                            Number(deposit.depositReceivedAmount)
                          : undefined
                      }
                      placeholder="$1000.00"
                      value={payment.paymentReceivedAmount}
                      onChange={(e) =>
                        setPayment({
                          ...payment,
                          [e.target.name]: e.target.value,
                        })
                      }
                    ></input>
                  </div>
                </div>
              )}
            </div>
            {accountingMethod === 'accrual' && (
              <div className="flex">
                <div className="basis-1/2">
                  <label htmlFor="salesDate">Invoice Date:</label>
                  <input
                    required
                    type="date"
                    id="salesDate"
                    name="salesDate"
                    min={
                      deposit.depositReceivedDate
                        ? deposit.depositReceivedDate
                        : undefined
                    }
                    max={
                      refund.refundDate
                        ? refund.refundDate
                        : new Date().toISOString().split('T')[0]
                    }
                    value={sales.salesDate}
                    onChange={(e) => {
                      setSales({
                        ...sales,
                        [e.target.name]: e.target.value,
                      });
                    }}
                  ></input>
                </div>
                <div className="basis-1/2">
                  <label htmlFor="salesAmount">
                    Sales Amount(excluding GST):{' '}
                  </label>
                  <input
                    required
                    type="number"
                    id="salesAmount"
                    name="salesAmount"
                    step="0.01"
                    placeholder="$1000.00"
                    min={0}
                    value={sales.salesAmount}
                    onChange={(e) =>
                      setSales({
                        ...sales,
                        [e.target.name]: e.target.value,
                      })
                    }
                  ></input>
                </div>
              </div>
            )}
            {payment.receivedPayment === true && (
              <div>
                <div>
                  <label htmlFor="refunded">Was There a Refund:</label>
                  <select
                    name="refunded"
                    id="refunded"
                    value={refund.refunded.toString()}
                    onChange={(e) => {
                      if (e.target.value === 'true') {
                        setRefund({
                          ...refund,
                          refunded: true,
                        });
                      } else {
                        setRefund({
                          refunded: false,
                          refundAmount: '',
                          refundDate: '',
                        });
                      }
                    }}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>

                {refund.refunded === true && (
                  <div className="flex">
                    <div className="basis-1/2">
                      <label htmlFor="refundDate">Refund Date: </label>
                      <input
                        required
                        type="date"
                        id="refundDate"
                        name="refundDate"
                        min={
                          new Date(sales.salesDate) >
                          new Date(payment.paymentReceivedDate)
                            ? sales.salesDate
                            : payment.paymentReceivedDate
                        }
                        max={new Date().toISOString().split('T')[0]}
                        value={refund.refundDate}
                        onChange={(e) =>
                          setRefund({
                            ...refund,
                            [e.target.name]: e.target.value,
                          })
                        }
                      ></input>
                    </div>
                    <div className="basis-1/2">
                      <label htmlFor="refundAmount">Refund Amount: </label>
                      <input
                        required
                        type="number"
                        id="refundAmount"
                        name="refundAmount"
                        step="0.01"
                        placeholder="$1000.00"
                        min={0}
                        max={
                          Number(payment.paymentReceivedAmount) +
                          Number(deposit.depositReceivedAmount)
                        }
                        value={refund.refundAmount}
                        onChange={(e) =>
                          setRefund({
                            ...refund,
                            [e.target.name]: e.target.value,
                          })
                        }
                      ></input>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded  w-32 h-10"
              type="reset"
            >
              Reset
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded  w-32 h-10"
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
      </section>

      <section
        className={`mt-16 basis-1/2  bg-gray-200 rounded-md shadow-lg ${
          entries ? 'block' : 'hidden'
        } md:flex md:flex-col md:overflow-y-auto p-6 `}
      >
        {entries?.map((entry, index) => {
          return <Entry key={index} data={entry} />;
        })}
      </section>
    </div>
  );
}
