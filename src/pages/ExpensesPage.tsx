import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function ExpensesPage() {
  const { activeGroup, expenses, addExpense, deleteExpense, users } = useApp();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [customSplits, setCustomSplits] = useState<{ userId: string; amount: string }[]>([]);

  // If no active group, redirect to home
  if (!activeGroup) {
    navigate('/');
    return null;
  }

  const filteredExpenses = expenses.filter(expense => expense.groupId === activeGroup.id);

  // Initialize custom splits when split type changes or paid by changes
  const initializeCustomSplits = () => {
    if (activeGroup) {
      const splits = activeGroup.participants
        .filter(p => p.id !== paidBy) // exclude the payer
        .map(participant => ({
          userId: participant.id,
          amount: '',
        }));
      setCustomSplits(splits);
    }
  };

  const handleSplitTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSplitType = e.target.value as 'equal' | 'custom';
    setSplitType(newSplitType);

    if (newSplitType === 'custom' && paidBy) {
      initializeCustomSplits();
    }
  };

  const handlePaidByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPaidBy = e.target.value;
    setPaidBy(newPaidBy);

    if (splitType === 'custom' && newPaidBy) {
      initializeCustomSplits();
    }
  };

  const handleCustomSplitChange = (userId: string, value: string) => {
    setCustomSplits(
      customSplits.map(split =>
        split.userId === userId ? { ...split, amount: value } : split
      )
    );
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!description) {
      alert('Please enter a description');
      return;
    }

    if (!paidBy) {
      alert('Please select who paid');
      return;
    }

    let splits;

    if (splitType === 'equal') {
      // Equal split among all participants (excluding the payer)
      const participants = activeGroup.participants.filter(p => p.id !== paidBy);
      const splitAmount = numericAmount / (participants.length + 1); // +1 for the payer

      splits = participants.map(participant => ({
        userId: participant.id,
        amount: splitAmount,
      }));

      // Also add the payer's split
      splits.push({
        userId: paidBy,
        amount: splitAmount,
      });
    } else {
      // Custom split
      if (customSplits.some(split => split.amount === '' || isNaN(parseFloat(split.amount)))) {
        alert('Please enter valid amounts for all participants');
        return;
      }

      // Convert string amounts to numbers
      splits = customSplits.map(split => ({
        userId: split.userId,
        amount: parseFloat(split.amount),
      }));

      // Verify that the sum of splits equals the total amount
      const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);

      if (Math.abs(totalSplitAmount - numericAmount) > 0.01) {
        alert(`The sum of splits (${totalSplitAmount.toFixed(2)}) doesn't equal the total amount (${numericAmount.toFixed(2)})`);
        return;
      }
    }

    addExpense(activeGroup.id, numericAmount, description, paidBy, splits);

    // Reset form
    setAmount('');
    setDescription('');
    setPaidBy('');
    setSplitType('equal');
    setCustomSplits([]);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  return (
    <div className="mx-auto max-w-6xl py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">Expenses</h1>
      <h2 className="mb-8 text-xl text-gray-600">
        Group: {activeGroup.name}
      </h2>

      <div className="mb-12 grid gap-8 md:grid-cols-2">
        {/* Add Expense Form */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Add New Expense</h2>

          <form onSubmit={handleAddExpense}>
            <div className="mb-4">
              <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700">
                Amount (₹)
              </label>
              <input
                type="number"
                id="amount"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dinner, groceries, etc."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="paidBy" className="mb-1 block text-sm font-medium text-gray-700">
                Paid By
              </label>
              <select
                id="paidBy"
                value={paidBy}
                onChange={handlePaidByChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                required
              >
                <option value="">Select who paid</option>
                {activeGroup.participants.map(participant => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="splitType" className="mb-1 block text-sm font-medium text-gray-700">
                Split Type
              </label>
              <select
                id="splitType"
                value={splitType}
                onChange={handleSplitTypeChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                required
              >
                <option value="equal">Equal Split</option>
                <option value="custom">Custom Split</option>
              </select>
            </div>

            {splitType === 'custom' && paidBy && (
              <div className="mb-4 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-medium text-gray-700">Custom Split</h3>
                {customSplits.map((split, index) => (
                  <div key={split.userId} className="mb-2 flex items-center gap-2">
                    <label className="w-1/2 text-sm text-gray-600">
                      {getUserName(split.userId)}:
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={split.amount}
                      onChange={(e) => handleCustomSplitChange(split.userId, e.target.value)}
                      placeholder="0.00"
                      className="w-1/2 rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                ))}
                <p className="mt-2 text-xs text-gray-500">
                  Total should equal ${amount || '0.00'}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700"
            >
              Add Expense
            </button>
          </form>
        </div>

        {/* Expense List */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Expense History</h2>

          {filteredExpenses.length > 0 ? (
            <div className="max-h-[600px] overflow-auto">
              <ul className="space-y-3">
                {filteredExpenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(expense => (
                    <li
                      key={expense.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{expense.description}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(expense.date)} • Paid by {getUserName(expense.paidBy)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-bold">${expense.amount.toFixed(2)}</span>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500">Split between:</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {expense.splits.map(split => (
                            <span
                              key={split.userId}
                              className="rounded-full bg-gray-100 px-2 py-1 text-xs"
                            >
                              {getUserName(split.userId)}: ${split.amount.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">No expenses added to this group yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
