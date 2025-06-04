import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

interface DashboardStats {
  total_responses: number;
  role_stats: Array<{
    role: string;
    count: number;
  }>;
  recent_activity: Array<{
    id: number;
    question: string;
    role: string;
    created_at: string;
  }>;
}

interface Response {
  id: number;
  question: string;
  answer: string;
  feedback: string;
  role: string;
  created_at: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

interface UserDetails {
  user: {
    id: number;
    name: string;
    email: string;
    joined_date: string | null;
  };
  stats: {
    total_responses: number;
    roles_practiced: Array<{
      role: string;
      count: number;
    }>;
    latest_practice: string | null;
    recent_responses: Array<{
      question: string;
      role: string;
      created_at: string;
    }>;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      logout();
      navigate('/login');
      return;
    }

    // Add request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        console.log('Request config:', config);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        console.log('Response:', response);
        return response;
      },
      (error) => {
        console.error('Response error:', error);
        if (error.response?.status === 422 || error.response?.status === 401) {
          console.log('Token error detected, logging out');
          logout();
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        console.log('Making dashboard requests with config:', config);

        const [statsResponse, responsesResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/dashboard/stats', config),
          axios.get(`http://localhost:5000/api/dashboard/responses?page=${currentPage}`, config)
        ]);

        setStats(statsResponse.data);
        setResponses(responsesResponse.data.responses);
        setTotalPages(responsesResponse.data.pages);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        if (err.response) {
          console.error('Error response:', err.response.data);
        }
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Cleanup interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [currentPage, navigate, isAuthenticated, logout]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUserProfile(response.data);
        setNewName(response.data.name);
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user/details', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUserDetails(response.data);
      } catch (err) {
        console.error('Error fetching user details:', err);
      }
    };

    if (isAuthenticated) {
      fetchUserDetails();
    }
  }, [isAuthenticated]);

  const handleUpdateName = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/user/profile', 
        { name: newName },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setUserProfile(prev => prev ? { ...prev, name: newName } : null);
      setEditingName(false);
      setUpdateMessage({ type: 'success', text: 'Name updated successfully' });
    } catch (err) {
      setUpdateMessage({ type: 'error', text: 'Failed to update name' });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setUpdateMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/user/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setUpdateMessage({ type: 'success', text: 'Password updated successfully' });
    } catch (err: any) {
      setUpdateMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update password'
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingSpinner}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.message} ${styles.errorMessage}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        {userProfile && (
          <div className={styles.userProfileSection}>
            {editingName ? (
              <div>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={styles.inputField}
                />
                <button onClick={handleUpdateName} className={styles.editButton}>
                  Save
                </button>
                <button onClick={() => setEditingName(false)} className={styles.editButton}>
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <span>Welcome, {userProfile.name}!</span>
                <button onClick={() => setEditingName(true)} className={styles.editButton}>
                  Edit Name
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {updateMessage && (
        <div className={`${styles.message} ${updateMessage.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
          {updateMessage.text}
        </div>
      )}

      <div className={styles.welcomeSection}>
        <h2>Your Interview Practice Stats</h2>
        {userDetails && (
          <div>
            <p>Total Responses: {userDetails.stats.total_responses}</p>
            <p>Latest Practice: {userDetails.stats.latest_practice || 'No practice yet'}</p>
          </div>
        )}
      </div>

      <div className={styles.statsGrid}>
        {stats && stats.role_stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <h3>{stat.role}</h3>
            <p>{stat.count} responses</p>
          </div>
        ))}
      </div>

      <div className={styles.chartSection}>
        <h2>Practice Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats?.role_stats || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="role" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.recentActivity}>
        <h2>Recent Activity</h2>
        <ul className={styles.activityList}>
          {responses.map((response) => (
            <li key={response.id} className={styles.activityItem}>
              <div>
                <h4>{response.role}</h4>
                <p>{response.question}</p>
              </div>
              <span>{new Date(response.created_at).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>

        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 