import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL;

    // Fetch current user on initial load
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await axios.get(`${apiUrl}/api/auth/me`, { withCredentials: true });
                if (res.data.success) {
                    setUser(res.data.data);
                }
            } catch (error) {
                console.error("Not authenticated");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchMe();
    }, [apiUrl]);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await axios.post(`${apiUrl}/api/auth/logout`, {}, { withCredentials: true });
            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, token: null }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
