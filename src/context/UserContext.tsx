import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';

interface UserContextType {
  permissions: string[];
  addPermission: (permission: string) => void;
  removePermission: (permission: string) => void;
  hasPermission: (permission: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<string[]>(() => {
    const saved = localStorage.getItem('user_permissions');
    return saved ? JSON.parse(saved) : ['respto'];
  });

  useEffect(() => {
    localStorage.setItem('user_permissions', JSON.stringify(permissions));
  }, [permissions]);

  const addPermission = (permission: string) => {
    setPermissions(prev => prev.includes(permission) ? prev : [...prev, permission]);
  };

  const removePermission = (permission: string) => {
    setPermissions(prev => prev.filter(p => p !== permission));
  };

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  return (
    <UserContext.Provider value={{ permissions, addPermission, removePermission, hasPermission }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
