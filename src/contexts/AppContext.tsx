import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  participants: User[];
  created: Date;
}

export interface Expense {
  id: string;
  groupId: string;
  amount: number;
  description: string;
  paidBy: string; // User ID
  date: Date;
  splits: {
    userId: string;
    amount: number;
  }[];
}

export interface Settlement {
  id: string;
  groupId: string;
  from: string; // User ID
  to: string; // User ID
  amount: number;
  date: Date;
  settled: boolean;
}

interface AppContextType {
  users: User[];
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  activeGroup: Group | null;
  addUser: (name: string) => void;
  addGroup: (name: string) => void;
  addParticipantToGroup: (groupId: string, userId: string) => void;
  removeParticipantFromGroup: (groupId: string, userId: string) => void;
  setActiveGroup: (groupId: string) => void;
  addExpense: (
    groupId: string,
    amount: number,
    description: string,
    paidBy: string,
    splits: { userId: string; amount: number }[]
  ) => void;
  deleteExpense: (expenseId: string) => void;
  settleDebt: (from: string, to: string, amount: number, groupId: string) => void;
  markSettlementComplete: (settlementId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  // Load data from localStorage or initialize with empty arrays
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('splitSavvy_users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const savedGroups = localStorage.getItem('splitSavvy_groups');
    return savedGroups
      ? JSON.parse(savedGroups).map((group: any) => ({
          ...group,
          created: new Date(group.created)
        }))
      : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedExpenses = localStorage.getItem('splitSavvy_expenses');
    return savedExpenses
      ? JSON.parse(savedExpenses).map((expense: any) => ({
          ...expense,
          date: new Date(expense.date)
        }))
      : [];
  });

  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    const savedSettlements = localStorage.getItem('splitSavvy_settlements');
    return savedSettlements
      ? JSON.parse(savedSettlements).map((settlement: any) => ({
          ...settlement,
          date: new Date(settlement.date)
        }))
      : [];
  });

  const [activeGroup, setActiveGroupState] = useState<Group | null>(null);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('splitSavvy_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('splitSavvy_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('splitSavvy_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('splitSavvy_settlements', JSON.stringify(settlements));
  }, [settlements]);

  // Helper function to generate unique IDs
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addUser = (name: string) => {
    const newUser = { id: generateId(), name };
    setUsers([...users, newUser]);
  };

  const addGroup = (name: string) => {
    const newGroup = {
      id: generateId(),
      name,
      participants: [],
      created: new Date(),
    };
    setGroups([...groups, newGroup]);
  };

  const addParticipantToGroup = (groupId: string, userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setGroups(
      groups.map(group => {
        if (group.id === groupId) {
          // Only add if not already in the group
          if (!group.participants.some(p => p.id === userId)) {
            return {
              ...group,
              participants: [...group.participants, user],
            };
          }
        }
        return group;
      })
    );
  };

  const removeParticipantFromGroup = (groupId: string, userId: string) => {
    setGroups(
      groups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            participants: group.participants.filter(p => p.id !== userId),
          };
        }
        return group;
      })
    );
  };

  const setActiveGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId) || null;
    setActiveGroupState(group);
  };

  const addExpense = (
    groupId: string,
    amount: number,
    description: string,
    paidBy: string,
    splits: { userId: string; amount: number }[]
  ) => {
    const newExpense: Expense = {
      id: generateId(),
      groupId,
      amount,
      description,
      paidBy,
      date: new Date(),
      splits,
    };
    setExpenses([...expenses, newExpense]);
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter(expense => expense.id !== expenseId));
  };

  const settleDebt = (from: string, to: string, amount: number, groupId: string) => {
    const newSettlement: Settlement = {
      id: generateId(),
      groupId,
      from,
      to,
      amount,
      date: new Date(),
      settled: false,
    };
    setSettlements([...settlements, newSettlement]);
  };

  const markSettlementComplete = (settlementId: string) => {
    setSettlements(
      settlements.map(settlement => {
        if (settlement.id === settlementId) {
          return {
            ...settlement,
            settled: true,
          };
        }
        return settlement;
      })
    );
  };

  const value = {
    users,
    groups,
    expenses,
    settlements,
    activeGroup,
    addUser,
    addGroup,
    addParticipantToGroup,
    removeParticipantFromGroup,
    setActiveGroup,
    addExpense,
    deleteExpense,
    settleDebt,
    markSettlementComplete,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
