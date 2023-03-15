// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    accountingMethod,
    GSTReporting: { GSTRegistered, GSTReportingMethod },
    deposit: { receivedDeposit, depositReceivedAmount, depositReceivedDate },
    payment: { receivedPayment, paymentReceivedAmount, paymentReceivedDate },
    sales: { salesAmount, salesDate },
    refund: { refunded, refundDate, refundAmount },
  } = req.body.fields;

  const entries: any[] = [];
  const depositEntryDescription =
    'Receipt of the deposit received in advance of the event';
  const paymentEntryDescription = 'Cash received from the sale';
  const salesEntryDescription = 'Recognition of revenue on the sale';
  const refundEntryDescription = 'To record refund to customer';

  if (receivedDeposit) {
    const depositEntry = [
      {
        date: depositReceivedDate,
        account: 'Cash',
        Dr: Math.floor(depositReceivedAmount),
        Cr: 0,
      },
    ];

    if (accountingMethod === 'cash') {
      if (!GSTRegistered) {
        depositEntry.push({
          date: '',
          account: 'Revenue',
          Dr: 0,
          Cr: Math.floor(depositReceivedAmount),
        });
        entries.push({
          entryDescription: depositEntryDescription,
          entry: depositEntry,
        });
      } else {
        depositEntry.push(
          {
            date: '',
            account: 'Revenue',
            Dr: 0,
            Cr: Math.floor((depositReceivedAmount / 11) * 10),
          },
          {
            date: '',
            account: 'GST',
            Dr: 0,
            Cr: Math.floor(depositReceivedAmount / 11),
          }
        );
        entries.push({
          entryDescription: depositEntryDescription,
          entry: depositEntry,
        });
      }
    }
    if (accountingMethod === 'accrual') {
      if (GSTRegistered && GSTReportingMethod === 'cash') {
        depositEntry.push(
          {
            date: '',
            account: 'Contract liability',
            Dr: 0,
            Cr: Math.floor((depositReceivedAmount / 11) * 10),
          },
          {
            date: '',
            account: 'GST',
            Dr: 0,
            Cr: Math.floor(depositReceivedAmount / 11),
          }
        );
        entries.push({
          entryDescription: depositEntryDescription,
          entry: depositEntry,
        });
      } else {
        depositEntry.push({
          date: '',
          account: 'Contract liability',
          Dr: 0,
          Cr: Math.floor(depositReceivedAmount),
        });
        entries.push({
          entryDescription: depositEntryDescription,
          entry: depositEntry,
        });
      }
    }
  }

  if (receivedPayment) {
    if (accountingMethod === 'cash') {
      const paymentEntry = [
        {
          date: paymentReceivedDate,
          account: 'Cash',
          Dr: Math.floor(paymentReceivedAmount),
          Cr: 0,
        },
      ];

      if (!GSTRegistered) {
        paymentEntry.push({
          date: '',
          account: 'Revenue',
          Dr: 0,
          Cr: Math.floor(paymentReceivedAmount),
        });
        entries.push({
          entryDescription: paymentEntryDescription,
          entry: paymentEntry,
        });
      } else {
        paymentEntry.push(
          {
            date: '',
            account: 'Revenue',
            Dr: 0,
            Cr: Math.floor((paymentReceivedAmount / 11) * 10),
          },
          {
            date: '',
            account: 'GST',
            Dr: 0,
            Cr: Math.floor(paymentReceivedAmount / 11),
          }
        );
        entries.push({
          entryDescription: paymentEntryDescription,
          entry: paymentEntry,
        });
      }
    }
    if (accountingMethod === 'accrual') {
      if (new Date(paymentReceivedDate) < new Date(salesDate)) {
        if (!GSTRegistered) {
          const paymentEntry = [
            {
              date: paymentReceivedDate,
              account: 'Cash',
              Dr: Math.floor(paymentReceivedAmount),
              Cr: 0,
            },
            {
              date: '',
              account: 'Contract liability',
              Dr: 0,
              Cr: Math.floor(paymentReceivedAmount),
            },
          ];
          const salesEntry = [
            {
              date: salesDate,
              account: 'Contract liability',
              Dr: Math.floor(depositReceivedAmount + paymentReceivedAmount),
              Cr: 0,
            },
            {
              date: '',
              account: 'Revenue',
              Dr: 0,
              Cr: Math.floor(salesAmount),
            },
          ];
          if (depositReceivedAmount + paymentReceivedAmount < salesAmount) {
            salesEntry.push({
              date: '',
              account: 'Account receivable',
              Dr: Math.floor(
                salesAmount - depositReceivedAmount - paymentReceivedAmount
              ),
              Cr: 0,
            });
          }
          entries.push(
            { entryDescription: paymentEntryDescription, entry: paymentEntry },
            { entryDescription: salesEntryDescription, entry: salesEntry }
          );
        }
        if (GSTReportingMethod === 'cash') {
          const paymentEntry = [
            {
              date: paymentReceivedDate,
              account: 'Cash',
              Dr: Math.floor(paymentReceivedAmount),
              Cr: 0,
            },
            {
              date: '',
              account: 'Contract liability',
              Dr: 0,
              Cr: Math.floor((paymentReceivedAmount / 11) * 10),
            },
            {
              date: '',
              account: 'GST',
              Dr: 0,
              Cr: Math.floor(paymentReceivedAmount / 11),
            },
          ];
          const salesEntry = [
            {
              date: salesDate,
              account: 'Contract liability',
              Dr: Math.floor(
                ((depositReceivedAmount + paymentReceivedAmount) / 11) * 10
              ),
              Cr: 0,
            },
            {
              date: '',
              account: 'Revenue',
              Dr: 0,
              Cr: Math.floor(salesAmount),
            },
          ];
          if (depositReceivedAmount + paymentReceivedAmount < salesAmount) {
            salesEntry.push({
              date: '',
              account: 'Account receivable',
              Dr: Math.floor(
                salesAmount -
                  (depositReceivedAmount / 11) * 10 -
                  (paymentReceivedAmount / 11) * 10
              ),
              Cr: 0,
            });
          }
          entries.push(
            { entryDescription: paymentEntryDescription, entry: paymentEntry },
            { entryDescription: salesEntryDescription, entry: salesEntry }
          );
        }
        if (GSTReportingMethod === 'accrual') {
          const paymentEntry = [
            {
              date: paymentReceivedDate,
              account: 'Cash',
              Dr: Math.floor(paymentReceivedAmount),
              Cr: 0,
            },
            {
              date: '',
              account: 'Contract liability',
              Dr: 0,
              Cr: Math.floor(paymentReceivedAmount),
            },
          ];
          const salesEntry = [
            {
              date: salesDate,
              account: 'Contract liability',
              Dr: Math.floor(depositReceivedAmount + paymentReceivedAmount),
              Cr: 0,
            },
            {
              date: '',
              account: 'Revenue',
              Dr: 0,
              Cr: Math.floor(salesAmount),
            },
            {
              date: '',
              account: 'GST',
              Dr: '',
              Cr: '$' + (salesAmount / 10).toFixed(2),
            },
          ];
          if (depositReceivedAmount + paymentReceivedAmount < salesAmount) {
            salesEntry.push({
              date: '',
              account: 'Account receivable',
              Dr: Math.floor(
                salesAmount - depositReceivedAmount - paymentReceivedAmount
              ),
              Cr: 0,
            });
          }
          entries.push(
            { entryDescription: paymentEntryDescription, entry: paymentEntry },
            { entryDescription: salesEntryDescription, entry: salesEntry }
          );
        }
      }
      if (new Date(paymentReceivedDate) > new Date(salesDate)) {
        if (!GSTRegistered) {
          const salesEntry = [];
          if (receivedDeposit) {
            salesEntry.push({
              date: salesDate,
              account: 'Contract liability',
              Dr: Math.floor(depositReceivedAmount),
              Cr: 0,
            });
          }

          salesEntry.push(
            {
              date: receivedDeposit ? '' : salesDate,
              account: 'Account receivable',
              Dr: Math.floor(salesAmount - depositReceivedAmount),
              Cr: 0,
            },
            {
              date: '',
              account: 'Revenue',
              Dr: 0,
              Cr: Math.floor(salesAmount),
            }
          );

          const paymentEntry = [
            {
              date: paymentReceivedDate,
              account: 'Cash',
              Dr: Math.floor(paymentReceivedAmount),
              Cr: 0,
            },
            {
              date: '',
              account: 'Account receivable',
              Dr: 0,
              Cr: Math.floor(paymentReceivedAmount),
            },
          ];

          entries.push(
            { entryDescription: salesEntryDescription, entry: salesEntry },
            { entryDescription: paymentEntryDescription, entry: paymentEntry }
          );
        }
        if (GSTReportingMethod === 'cash') {
          const salesEntry = [];
          if (receivedDeposit) {
            salesEntry.push({
              date: salesDate,
              account: 'Contract liability',
              Dr: Math.floor(depositReceivedAmount),
              Cr: 0,
            });
          }

          salesEntry.push(
            {
              date: receivedDeposit ? '' : salesDate,
              account: 'Account receivable',
              Dr: Math.floor(salesAmount - depositReceivedAmount),
              Cr: 0,
            },
            {
              date: '',
              account: 'Revenue',
              Dr: 0,
              Cr: Math.floor(salesAmount),
            }
          );

          const paymentEntry = [
            {
              date: paymentReceivedDate,
              account: 'Cash',
              Dr: Math.floor(paymentReceivedAmount),
              Cr: 0,
            },
            {
              date: '',
              account: 'Account receivable',
              Dr: 0,
              Cr: Math.floor((paymentReceivedAmount / 11) * 10),
            },
            {
              date: '',
              account: 'GST',
              Dr: 0,
              Cr: Math.floor(paymentReceivedAmount / 11),
            },
          ];

          entries.push(
            { entryDescription: salesEntryDescription, entry: salesEntry },
            { entryDescription: paymentEntryDescription, entry: paymentEntry }
          );
        }
        if (GSTReportingMethod === 'accrual') {
          const salesEntry = [];
          if (receivedDeposit) {
            salesEntry.push({
              date: salesDate,
              account: 'Contract liability',
              Dr: Math.floor(depositReceivedAmount),
              Cr: 0,
            });
          }

          salesEntry.push(
            {
              date: receivedDeposit ? '' : salesDate,
              account: 'Account receivable',
              Dr: Math.floor(
                salesAmount - depositReceivedAmount + salesAmount / 10
              ),
              Cr: 0,
            },
            {
              date: '',
              account: 'Revenue',
              Dr: 0,
              Cr: Math.floor(salesAmount),
            },
            {
              date: '',
              account: 'GST',
              Dr: 0,
              Cr: Math.floor(salesAmount / 10),
            }
          );

          const paymentEntry = [
            {
              date: paymentReceivedDate,
              account: 'Cash',
              Dr: Math.floor(paymentReceivedAmount),
              Cr: 0,
            },
            {
              date: '',
              account: 'Account receivable',
              Dr: 0,
              Cr: Math.floor(paymentReceivedAmount),
            },
          ];

          entries.push(
            { entryDescription: salesEntryDescription, entry: salesEntry },
            { entryDescription: paymentEntryDescription, entry: paymentEntry }
          );
        }
      }

      if (paymentReceivedDate === salesDate) {
        const paymentAndSaleEntry = [
          {
            date: salesDate,
            account: 'Cash',
            Dr: Math.floor(paymentReceivedAmount),
            Cr: 0,
          },
        ];
        if (receivedDeposit) {
          paymentAndSaleEntry.push({
            date: '',
            account: 'Contract liability',
            Dr:
              GSTReportingMethod === 'cash'
                ? Math.floor((depositReceivedAmount / 11) * 10)
                : Math.floor(depositReceivedAmount),
            Cr: 0,
          });
        }
        if (
          (!GSTRegistered &&
            depositReceivedAmount + paymentReceivedAmount < salesAmount) ||
          (GSTRegistered &&
            depositReceivedAmount + paymentReceivedAmount <
              (salesAmount / 10) * 11)
        ) {
          paymentAndSaleEntry.push({
            date: '',
            account: 'Account receivable',
            Dr: !GSTRegistered
              ? Math.floor(
                  salesAmount - depositReceivedAmount - paymentReceivedAmount
                )
              : GSTReportingMethod === 'cash'
              ? Math.floor(
                  salesAmount -
                    (depositReceivedAmount / 11) * 10 -
                    (paymentReceivedAmount / 11) * 10
                )
              : Math.floor(
                  (salesAmount * 11) / 10 -
                    depositReceivedAmount -
                    paymentReceivedAmount
                ),
            Cr: 0,
          });

          paymentAndSaleEntry.push({
            date: '',
            account: 'Revenue',
            Dr: 0,
            Cr: Math.floor(salesAmount),
          });

          if (GSTRegistered) {
            paymentAndSaleEntry.push({
              date: '',
              account: 'GST',
              Dr: 0,
              Cr:
                GSTReportingMethod === 'cash'
                  ? Math.floor(paymentReceivedAmount / 11)
                  : Math.floor(salesAmount / 10),
            });
          }

          entries.push({
            entryDescription: salesEntryDescription,
            entry: paymentAndSaleEntry,
          });
        }
      }
    }
  }

  if (!receivedPayment && accountingMethod === 'accrual') {
    const salesEntry = [];

    if (receivedDeposit) {
      salesEntry.push({
        date: salesDate,
        account: 'Contract liability',
        Dr:
          GSTReportingMethod === 'cash'
            ? Math.floor((depositReceivedAmount / 11) * 10)
            : Math.floor(depositReceivedAmount),
        Cr: 0,
      });
    }

    if (
      GSTReportingMethod === 'accrual' &&
      (salesAmount / 10) * 11 > depositReceivedAmount
    ) {
      salesEntry.push({
        date: receivedDeposit ? '' : salesDate,
        account: 'Account receivable',
        Dr: Math.floor((salesAmount / 10) * 11 - depositReceivedAmount),
        Cr: 0,
      });
    } else if (
      (!GSTRegistered && salesAmount > depositReceivedAmount) ||
      (GSTReportingMethod === 'cash' && salesAmount > depositReceivedAmount)
    ) {
      salesEntry.push({
        date: receivedDeposit ? '' : salesDate,
        account: 'Account receivable',
        Dr: GSTRegistered
          ? Math.floor(salesAmount - (depositReceivedAmount * 10) / 11)
          : Math.floor(salesAmount - depositReceivedAmount),
        Cr: 0,
      });
    }

    salesEntry.push({
      date: '',
      account: 'revenue',
      Dr: 0,
      Cr: Math.floor(salesAmount),
    });

    if (GSTReportingMethod === 'accrual') {
      salesEntry.push({
        date: '',
        account: 'GST',
        Dr: 0,
        Cr: Math.floor(salesAmount / 10),
      });
    }
    entries.push({
      entryDescription: salesEntryDescription,
      entry: salesEntry,
    });
  }

  if (refunded) {
    const refundEntry = [
      {
        date: refundDate,
        account: 'Revenue',
        Dr: GSTRegistered
          ? Math.floor((refundAmount / 11) * 10)
          : Math.floor(refundAmount),
        Cr: 0,
      },
    ];

    if (GSTRegistered) {
      refundEntry.push({
        date: '',
        account: 'GST',
        Dr: Math.floor(refundAmount / 11),
        Cr: 0,
      });
    }

    refundEntry.push({
      date: '',
      account: 'Cash',
      Dr: 0,
      Cr: Math.floor(refundAmount),
    });

    entries.push({
      entryDescription: refundEntryDescription,
      entry: refundEntry,
    });
  }

  res.status(200).json(entries);
}
