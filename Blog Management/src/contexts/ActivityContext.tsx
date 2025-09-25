import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CustomerActivity {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
  lastActive: Date;
  subscriptionPlan: 'Basic' | 'Premium' | 'Enterprise';
}

interface ActivityContextType {
  customers: CustomerActivity[];
  updateCustomerStatus: (customerId: string, isOnline: boolean) => void;
  updateLastActive: (customerId: string) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<CustomerActivity[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      isOnline: true,
      lastActive: new Date(),
      subscriptionPlan: 'Premium'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      isOnline: false,
      lastActive: new Date(Date.now() - 600000), // 10 minutes ago
      subscriptionPlan: 'Basic'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      isOnline: true,
      lastActive: new Date(),
      subscriptionPlan: 'Enterprise'
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      isOnline: false,
      lastActive: new Date(Date.now() - 1800000), // 30 minutes ago
      subscriptionPlan: 'Basic'
    }
  ]);

  // Simulate real-time activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCustomers(prev => {
        return prev.map(customer => ({
          ...customer,
          isOnline: Math.random() > 0.3, // 70% chance of being online
          lastActive: customer.isOnline ? new Date() : customer.lastActive
        }));
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const updateCustomerStatus = (customerId: string, isOnline: boolean) => {
    setCustomers(prev =>
      prev.map(customer =>
        customer.id === customerId
          ? { ...customer, isOnline, lastActive: isOnline ? new Date() : customer.lastActive }
          : customer
      )
    );
  };

  const updateLastActive = (customerId: string) => {
    setCustomers(prev =>
      prev.map(customer =>
        customer.id === customerId
          ? { ...customer, lastActive: new Date() }
          : customer
      )
    );
  };

  return (
    <ActivityContext.Provider value={{ customers, updateCustomerStatus, updateLastActive }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}