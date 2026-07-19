import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import ThemeSelector from '../components/themeSelector';

import Dashboard from '../components/Dashboard';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const problemsPerPage = 5;

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch =
      filters.status === 'all' ||
      (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id));
    const searchMatch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());

    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  const getDifficultyBreakdown = () => {
  const levels = ['easy', 'medium', 'hard'];
  const breakdown = { easy: { total: 0, solved: 0 }, medium: { total: 0, solved: 0 }, hard: { total: 0, solved: 0 } };

  filteredProblems.forEach(p => {
    const level = p.difficulty.toLowerCase();
    if (levels.includes(level)) {
      breakdown[level].total++;
      if (solvedProblems.some(sp => sp._id === p._id)) {
        breakdown[level].solved++;
      }
    }
  });

  return breakdown;
};

const difficultyBreakdown = getDifficultyBreakdown();


  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <nav className="navbar bg-base-100 shadow-lg px-4 sticky top-0 z-10">
  {/* Left: Logo */}
  <div className="flex-1 flex items-center gap-2">
    <NavLink to="/" className="btn btn-ghost text-xl flex items-center gap-2">
      <div className="bg-primary text-primary-content p-2 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      <span className="font-bold">GritArena</span>
    </NavLink>
  </div>

  {/* Right: Theme Selector and User Dropdown */}
  <div className="flex items-center gap-4">
    <ThemeSelector />

    <div className="dropdown dropdown-end">
      <div tabIndex={0} className="btn btn-ghost flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold">
          {user?.firstName.charAt(0)}
        </div>
        <span>{user?.firstName}</span>
      </div>
      <ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 z-20">
        <li><button onClick={handleLogout}>Logout</button></li>
        {user?.role === 'admin' && <li><NavLink to="/admin">Admin Panel</NavLink></li>}
      </ul>
    </div>
  </div>
</nav>


      {/* Grid Layout */}
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters + Problems */}
        <div className="lg:col-span-3">
          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 mb-6 items-center">
            <select
              className="select select-bordered"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Problems</option>
              <option value="solved">Solved Problems</option>
            </select>

            <select
              className="select select-bordered"
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              className="select select-bordered"
              value={filters.tag}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            >
              <option value="all">All Tags</option>
              <option value="array">Array</option>
              <option value="linkedList">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">DP</option>
            </select>

            <input
              type="text"
              placeholder="Search by name"
              className="input input-bordered w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Problem Cards */}
          <div className="grid gap-4">
            {currentProblems.map(problem => (
              <div key={problem._id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title">
                      <NavLink to={`/problem/${problem._id}`} className="hover:text-primary">
                        {problem.title}
                      </NavLink>
                    </h2>
                    {solvedProblems.some(sp => sp._id === problem._id) && (
                      <div className="badge badge-success gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Solved
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </div>
                    <div className="badge badge-info">
                      {problem.tags}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredProblems.length > problemsPerPage && (
            <div className="mt-6 flex justify-center items-center gap-4">
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </button>
              <span className="text-sm font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right: Dashboard */}
        <div className="lg:col-span-1">
          <Dashboard 
            total={filteredProblems.length}
            solved={solvedProblems.filter(p => filteredProblems.some(fp => fp._id === p._id)).length}
            difficultyCounts={{
              easy: {
                total: filteredProblems.filter(p => p.difficulty === 'easy').length,
                solved: solvedProblems.filter(sp =>
                  filteredProblems.some(fp => fp._id === sp._id && fp.difficulty === 'easy')
                ).length
              },
              medium: {
                total: filteredProblems.filter(p => p.difficulty === 'medium').length,
                solved: solvedProblems.filter(sp =>
                  filteredProblems.some(fp => fp._id === sp._id && fp.difficulty === 'medium')
                ).length
              },
              hard: {
                total: filteredProblems.filter(p => p.difficulty === 'hard').length,
                solved: solvedProblems.filter(sp =>
                  filteredProblems.some(fp => fp._id === sp._id && fp.difficulty === 'hard')
                ).length
              }
            }}
          />

        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;