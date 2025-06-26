import { Expense, User } from '../contexts/AppContext';

export interface Balance {
  from: string; // User ID
  to: string; // User ID
  amount: number;
}

export interface UserBalance {
  userId: string;
  balance: number; // Positive means they are owed money, negative means they owe money
}

// Calculate raw balances for each user in a group
export const calculateRawBalances = (expenses: Expense[], groupParticipants: User[]): UserBalance[] => {
  const balances: Record<string, number> = {};

  // Initialize balances for all participants
  groupParticipants.forEach(user => {
    balances[user.id] = 0;
  });

  // Calculate the net balance for each user based on expenses
  expenses.forEach(expense => {
    // The person who paid gets a positive balance
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;

    // Each person who owes gets a negative balance
    expense.splits.forEach(split => {
      balances[split.userId] = (balances[split.userId] || 0) - split.amount;
    });
  });

  return Object.entries(balances).map(([userId, balance]) => ({
    userId,
    balance,
  }));
};

// Simplify the balances to minimize the number of transactions
export const simplifyBalances = (rawBalances: UserBalance[]): Balance[] => {
  // Filter out users with zero balance
  const nonZeroBalances = rawBalances.filter(balance => Math.abs(balance.balance) > 0.01);

  // Sort by balance (ascending - people who owe money first)
  const sortedBalances = [...nonZeroBalances].sort((a, b) => a.balance - b.balance);

  const simplifiedBalances: Balance[] = [];

  // While there are people who owe money and people who are owed money
  while (sortedBalances.length > 1) {
    const debtor = sortedBalances[0]; // Person who owes the most
    const creditor = sortedBalances[sortedBalances.length - 1]; // Person who is owed the most

    // The transfer amount is the minimum of the absolute values of their balances
    const amount = Math.min(Math.abs(debtor.balance), Math.abs(creditor.balance));

    if (amount > 0.01) { // Only create transactions for meaningful amounts
      simplifiedBalances.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      });
    }

    // Update their balances
    debtor.balance += amount;
    creditor.balance -= amount;

    // Remove users with zero balance after the adjustment
    if (Math.abs(debtor.balance) < 0.01) {
      sortedBalances.shift();
    }

    if (Math.abs(creditor.balance) < 0.01) {
      sortedBalances.pop();
    }
  }

  return simplifiedBalances;
};

// Main function to calculate simplified balances
export const calculateBalances = (expenses: Expense[], groupParticipants: User[]): Balance[] => {
  const rawBalances = calculateRawBalances(expenses, groupParticipants);
  return simplifyBalances(rawBalances);
};
