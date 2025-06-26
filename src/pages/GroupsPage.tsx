import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, User } from '../contexts/AppContext';

export default function GroupsPage() {
  const { users, groups, addUser, addGroup, addParticipantToGroup, removeParticipantFromGroup, setActiveGroup } = useApp();
  const navigate = useNavigate();

  const [newUserName, setNewUserName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim()) {
      addUser(newUserName.trim());
      setNewUserName('');
    }
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim());
      setNewGroupName('');
    }
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGroup && selectedUser) {
      addParticipantToGroup(selectedGroup, selectedUser);
      setSelectedUser('');
    }
  };

  const selectGroup = (groupId: string) => {
    setSelectedGroup(groupId);
  };

  const startGroup = (groupId: string) => {
    setActiveGroup(groupId);
    navigate('/expenses');
  };

  const currentGroup = selectedGroup ? groups.find(g => g.id === selectedGroup) : null;
  const availableUsers = currentGroup
    ? users.filter(user => !currentGroup.participants.some(p => p.id === user.id))
    : [];

  return (
    <div className="mx-auto max-w-6xl py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">Manage Groups</h1>

      <div className="mb-12 grid gap-8 md:grid-cols-2">
        {/* Users Section */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Users</h2>

          <form onSubmit={handleAddUser} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="User name"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            >
              Add User
            </button>
          </form>

          {users.length > 0 ? (
            <ul className="space-y-2">
              {users.map(user => (
                <li
                  key={user.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                >
                  <span className="font-medium">{user.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No users added yet. Add users to create group expenses.</p>
          )}
        </div>

        {/* Groups Section */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Groups</h2>

          <form onSubmit={handleAddGroup} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            >
              Add Group
            </button>
          </form>

          {groups.length > 0 ? (
            <ul className="space-y-3">
              {groups.map(group => (
                <li
                  key={group.id}
                  className={`cursor-pointer rounded-lg ${
                    selectedGroup === group.id ? 'bg-indigo-100' : 'bg-gray-50'
                  } px-4 py-3 transition hover:bg-indigo-50`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-medium"
                      onClick={() => selectGroup(group.id)}
                    >
                      {group.name} ({group.participants.length} members)
                    </span>
                    <button
                      onClick={() => startGroup(group.id)}
                      className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                    >
                      Start
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No groups created yet. Create a group to start tracking expenses.</p>
          )}
        </div>
      </div>

      {/* Group Members Section */}
      {currentGroup && (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">
            {currentGroup.name} - Participants
          </h2>

          <form onSubmit={handleAddParticipant} className="mb-6 flex gap-2">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select a user to add</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!selectedUser}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-indigo-400 enabled:hover:bg-indigo-700"
            >
              Add to Group
            </button>
          </form>

          {currentGroup.participants.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {currentGroup.participants.map(participant => (
                <li
                  key={participant.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                >
                  <span className="font-medium">{participant.name}</span>
                  <button
                    onClick={() => removeParticipantFromGroup(currentGroup.id, participant.id)}
                    className="rounded bg-red-100 px-2 py-1 text-sm text-red-600 hover:bg-red-200"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No participants in this group yet. Add participants to start tracking expenses.</p>
          )}
        </div>
      )}
    </div>
  );
}
