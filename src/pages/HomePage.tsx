import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function HomePage() {
  const { groups, activeGroup, expenses } = useApp();

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">Welcome to SplitSavvy</h1>
        <p className="text-xl text-gray-600">
          The smart way to split expenses with friends and roommates
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-semibold text-gray-700">Get Started</h2>
          <p className="mb-6 text-gray-600">
            Create your first group to start tracking expenses with friends or roommates.
          </p>
          <Link
            to="/groups"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
          >
            Create a Group
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {activeGroup ? (
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <h2 className="mb-4 text-2xl font-semibold text-gray-700">
                {activeGroup.name}
              </h2>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <p className="text-lg font-medium text-gray-600">Participants</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {activeGroup.participants.length}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <p className="text-lg font-medium text-gray-600">Expenses</p>
                  <p className="text-3xl font-bold text-green-600">
                    {expenses.filter(e => e.groupId === activeGroup.id).length}
                  </p>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <p className="text-lg font-medium text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold text-purple-600">
                    ${expenses
                      .filter(e => e.groupId === activeGroup.id)
                      .reduce((sum, expense) => sum + expense.amount, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/expenses"
                  className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
                >
                  View Expenses
                </Link>
                <Link
                  to="/balances"
                  className="rounded-lg bg-teal-600 px-6 py-3 font-medium text-white transition hover:bg-teal-700"
                >
                  Check Balances
                </Link>
                <Link
                  to="/settle"
                  className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-white transition hover:bg-amber-700"
                >
                  Settle Up
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <h2 className="mb-4 text-2xl font-semibold text-gray-700">Select a Group</h2>
              <p className="mb-6 text-gray-600">
                You have {groups.length} group(s). Select one to view expenses and balances.
              </p>
              <div className="flex flex-wrap gap-4">
                {groups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => useApp().setActiveGroup(group.id)}
                    className="rounded-lg bg-indigo-100 px-6 py-3 font-medium text-indigo-700 transition hover:bg-indigo-200"
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              to="/groups"
              className="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-300"
            >
              Manage Groups
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
