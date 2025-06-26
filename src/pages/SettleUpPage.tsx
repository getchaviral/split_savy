import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { useApp } from '../contexts/AppContext';
import { calculateBalances } from '../utils/balanceCalculator';

export default function SettleUpPage() {
  const { activeGroup, expenses, users, settlements, settleDebt, markSettlementComplete } = useApp();
  const navigate = useNavigate();

  const [activeSettlement, setActiveSettlement] = useState<{
    from: string;
    to: string;
    amount: number;
    qrCodeUrl: string | null;
    paymentLink: string;
  } | null>(null);

  if (!activeGroup) {
    navigate('/');
    return null;
  }

  const groupExpenses = expenses.filter(expense => expense.groupId === activeGroup.id);
  const simplifiedBalances = calculateBalances(groupExpenses, activeGroup.participants);
  const groupSettlements = settlements.filter(settlement => settlement.groupId === activeGroup.id);

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  const generateQRCode = async (paymentLink: string) => {
    try {
      return await QRCode.toDataURL(paymentLink);
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleSettleUpClick = async (fromId: string, toId: string, amount: number) => {
    // Generate a payment link (this is a placeholder - in real app, you'd integrate with payment providers)
    const paymentLink = `https://splitsavvy.app/pay?from=${fromId}&to=${toId}&amount=${amount.toFixed(2)}`;

    const qrCodeUrl = await generateQRCode(paymentLink);

    setActiveSettlement({
      from: fromId,
      to: toId,
      amount,
      qrCodeUrl,
      paymentLink,
    });
  };

  const confirmSettlement = () => {
    if (activeSettlement) {
      settleDebt(
        activeSettlement.from,
        activeSettlement.to,
        activeSettlement.amount,
        activeGroup.id
      );
      setActiveSettlement(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">Settle Up</h1>
      <h2 className="mb-8 text-xl text-gray-600">
        Group: {activeGroup.name}
      </h2>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Payments to Make */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Payments to Make</h2>

          {simplifiedBalances.length > 0 ? (
            <ul className="space-y-4">
              {simplifiedBalances.map((balance, index) => (
                <li
                  key={index}
                  className="overflow-hidden rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between bg-gray-50 p-4">
                    <div>
                      <p className="font-medium">
                        <span className="text-red-600">{getUserName(balance.from)}</span>
                        <span className="mx-2 text-gray-500">pays</span>
                        <span className="text-green-600">{getUserName(balance.to)}</span>
                      </p>
                      <p className="text-lg font-bold">${balance.amount.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => handleSettleUpClick(balance.from, balance.to, balance.amount)}
                      className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                    >
                      Settle Up
                    </button>
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
        </div>

        {/* Payment History */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Payment History</h2>

          {groupSettlements.length > 0 ? (
            <ul className="space-y-3">
              {groupSettlements
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(settlement => (
                  <li
                    key={settlement.id}
                    className={`rounded-lg p-4 ${
                      settlement.settled ? 'bg-green-50' : 'bg-yellow-50'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          <span>{getUserName(settlement.from)}</span>
                          <span className="mx-1 text-gray-500">→</span>
                          <span>{getUserName(settlement.to)}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(settlement.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold">${settlement.amount.toFixed(2)}</span>
                        {settlement.settled ? (
                          <span className="text-xs font-medium text-green-600">Completed</span>
                        ) : (
                          <button
                            onClick={() => markSettlementComplete(settlement.id)}
                            className="text-xs font-medium text-amber-600 hover:text-amber-700"
                          >
                            Mark as complete
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500">No payment history yet.</p>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {activeSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">Payment Details</h2>

            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-center font-medium">
                <span className="text-red-600">{getUserName(activeSettlement.from)}</span>
                <span className="mx-2 text-gray-500">pays</span>
                <span className="text-green-600">{getUserName(activeSettlement.to)}</span>
              </p>
              <p className="text-center text-2xl font-bold">${activeSettlement.amount.toFixed(2)}</p>
            </div>

            {activeSettlement.qrCodeUrl && (
              <div className="mb-6 flex justify-center">
                <div className="rounded-lg border border-gray-200 p-4">
                  <img
                    src={activeSettlement.qrCodeUrl}
                    alt="Payment QR Code"
                    className="h-48 w-48"
                  />
                  <p className="mt-2 text-center text-sm text-gray-500">
                    Scan to pay via your preferred app
                  </p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Payment Link
              </label>
              <div className="flex rounded-lg border border-gray-300">
                <input
                  type="text"
                  readOnly
                  value={activeSettlement.paymentLink}
                  className="w-full rounded-l-lg border-0 bg-gray-50 px-4 py-2 text-gray-600 focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeSettlement.paymentLink);
                  }}
                  className="rounded-r-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                  Copy
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Share this link with {getUserName(activeSettlement.from)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveSettlement(null)}
                className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSettlement}
                className="flex-1 rounded-lg bg-green-600 py-2 font-medium text-white hover:bg-green-700"
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
