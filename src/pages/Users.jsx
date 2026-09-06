import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { privateApi } from '../api';
import { userUrl } from '../api/endpoints';
import { Icon } from '../components/Icon';

// Rows at or above this many submitted links are highlighted.
const HEAVY_USER_LINKS = 10000;
const num = (n) => (n ?? 0).toLocaleString('en-US');

const Users = () => {
  const { register, handleSubmit, reset } = useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const fetchUsers = useCallback(async (q) => {
    setLoading(true);
    try {
      const { users } = (
        await privateApi.get(`${userUrl}/search`, {
          params: q ? { q } : undefined,
        })
      ).data;
      setUsers(users);
      setQuery(q || '');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Something went wrong, please try again later'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onSearch = ({ search }) => fetchUsers(search.trim());

  const handleViewAll = () => {
    reset({ search: '' });
    fetchUsers();
  };

  const handleRestrict = async (user) => {
    const option = !user.isRestrict;
    try {
      await privateApi.post(`${userUrl}/restrict/${user._id}`, { option });
      toast.success(option ? 'User restricted' : 'Restriction removed');
      fetchUsers(query);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update user');
    }
  };

  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `Delete ${user.name} (${user.email})? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await privateApi.delete(`${userUrl}/delete/${user.email}`);
      toast.success('User deleted');
      fetchUsers(query);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete user');
    }
  };

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p>
            {query
              ? `${num(users.length)} result(s) for “${query}”`
              : `${num(users.length)} accounts`}
          </p>
        </div>
      </div>

      <div className="card-x">
        <div className="card-head">
          <form className="search-x" onSubmit={handleSubmit(onSearch)}>
            <input
              className="form-control"
              type="search"
              placeholder="Search by name or email"
              {...register('search', { required: true })}
            />
            <button type="submit" className="btn-x solid" disabled={loading}>
              <Icon name="search" />
              Search
            </button>
            <button
              type="button"
              className="btn-x ghost"
              onClick={handleViewAll}
              disabled={loading}
            >
              View all
            </button>
          </form>
        </div>

        <div className="table-wrap">
          <table className="table-x">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col" className="num">
                  Links submitted
                </th>
                <th scope="col">Status</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">
                    {loading ? 'Loading…' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className={
                      user.totalLinks >= HEAVY_USER_LINKS ? 'is-heavy' : undefined
                    }
                  >
                    <td>{user.name}</td>
                    <td className="muted">{user.email}</td>
                    <td className="num">{num(user.totalLinks)}</td>
                    <td>
                      {user.isRestrict ? (
                        <span className="badge-x warn">Restricted</span>
                      ) : (
                        <span className="badge-x">Active</span>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="btn-x ghost sm"
                          onClick={() => handleRestrict(user)}
                        >
                          {user.isRestrict ? 'Unrestrict' : 'Restrict'}
                        </button>
                        <button
                          type="button"
                          className="btn-x danger sm"
                          onClick={() => handleDelete(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="muted fine" style={{ marginTop: 12 }}>
        Highlighted rows have submitted {num(HEAVY_USER_LINKS)} or more links.
      </p>
    </div>
  );
};

export default Users;
