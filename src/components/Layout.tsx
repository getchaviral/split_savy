import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { activeGroup, groups, setActiveGroup } = useApp();
  const navigate = useNavigate();

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    if (groupId) {
      setActiveGroup(groupId);
      navigate('/expenses');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="text-2xl font-bold">
              SplitSavvy
            </Link>

            {groups.length > 0 && (
              <div className="hidden md:block">
                <select
                  className="rounded bg-indigo-700 px-4 py-2 text-white"
                  value={activeGroup?.id || ''}
                  onChange={handleGroupChange}
                >
                  <option value="">Select a group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex space-x-4">
              <Link to="/" className="rounded px-3 py-2 hover:bg-indigo-700">
                Home
              </Link>
              {activeGroup && (
                <>
                  <Link to="/expenses" className="rounded px-3 py-2 hover:bg-indigo-700">
                    Expenses
                  </Link>
                  <Link to="/balances" className="rounded px-3 py-2 hover:bg-indigo-700">
                    Balances
                  </Link>
                  <Link to="/settle" className="rounded px-3 py-2 hover:bg-indigo-700">
                    Settle Up
                  </Link>
                </>
              )}
              <Link to="/groups" className="rounded px-3 py-2 hover:bg-indigo-700">
                Groups
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 text-center text-gray-600">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} SplitSavvy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
