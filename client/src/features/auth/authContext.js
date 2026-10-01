import { createContext } from 'react';

// The context object lives apart from its provider component so the
// provider file only exports components (React fast refresh).
export const AuthContext = createContext(null);
