import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { calculateBalances, calculateRawBalances } from '../utils/balanceCalculator';

export default function BalancesPage() {
  const { activeGroup, expenses, users } = useApp();
  const navigate = useNavigate();

  if (!activeGroup) {
    navigate('/');
    return null;
  }

  const groupExpenses = expenses.filter(expense => expense.groupId === activeGroup.id);
  const rawBalances = calculateRawBalances(groupExpenses, activeGroup.participants);
  const simplifiedBalances = calculateBalances(groupExpenses, activeGroup.participants);

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  return (
    <div className="mx-auto max-w-6xl py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">Balances</h1>
      <h2 className="mb-8 text-xl text-gray-600">
        Group: {activeGroup.name}
      </h2>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Individual Balances */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Individual Balances</h2>

          {rawBalances.length > 0 ? (
            <ul className="space-y-3">
              {rawBalances.map(balance => (
                <li
                  key={balance.userId}
                  className={`flex items-center justify-between rounded-lg p-4 ${
                    balance.balance > 0
                      ? 'bg-green-50 text-green-700'
                      : balance.balance < 0
                        ? 'bg-red-50 text-red-700'
                        : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="font-medium">{getUserName(balance.userId)}</span>
                  <span className="text-lg font-bold">
                    {balance.balance === 0
                      ? 'Settled'
                      : balance.balance > 0
                        ? `Gets back $${balance.balance.toFixed(2)}`
                        : `Owes $${Math.abs(balance.balance).toFixed(2)}`
                    }
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No expenses to calculate balances from.</p>
          )}
        </div>

        {/* Simplified Transactions */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">
            Simplified Transactions
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            These are the minimum transactions needed to settle all debts.
          </p>

          {simplifiedBalances.length > 0 ? (
            <ul className="space-y-4">
              {simplifiedBalances.map((balance, index) => (
                <li
                  key={index}
                  className="rounded-lg bg-indigo-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-indigo-700">
                        {getUserName(balance.from)}
                      </span>
                      <span className="text-gray-500">pays</span>
                      <span className="font-medium text-indigo-700">
                        {getUserName(balance.to)}
                      </span>
                    </div>
                    <span className="rounded-full bg-indigo-100 px-3 py-1 font-bold text-indigo-700">
                      ${balance.amount.toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : groupExpenses.length > 0 ? (
            <p className="rounded-lg bg-green-50 p-4 text-center text-green-700">
              Everyone is settled up! No payments needed.
            </p>
          ) : (
            <p className="text-gray-500">No expenses to calculate payments from.</p>
          )}

          {simplifiedBalances.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/settle')}
                className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
              >
                Go to Settle Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-700">Expense Breakdown</h2>

        {groupExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Paid By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Split
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {groupExpenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(expense => (
                    <tr key={expense.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        ${expense.amount.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {getUserName(expense.paidBy)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {expense.splits.map(split => (
                            <span
                              key={split.userId}
                              className="rounded-full bg-gray-100 px-2 py-1 text-xs"
                            >
                              {getUserName(split.userId)}: ${split.amount.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No expenses added to this group yet.</p>
        )}
      </div>
    </div>
  );
}
