import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [modalOpen, setModalOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedProblems, setSelectedProblems] = useState([]);

  const problemsPerPage = 10;

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('⚠️ Failed to fetch problems.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setProblemToDelete(id);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!problemToDelete) return;
    
    try {
      setDeletingId(problemToDelete);
      await axiosClient.delete(`/problem/delete/${problemToDelete}`);
      setProblems(problems.filter((p) => p._id !== problemToDelete));
      setSuccess('✅ Problem deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('❌ Failed to delete problem. ' + (err.response?.data?.message || ''));
      console.error(err);
    } finally {
      setModalOpen(false);
      setProblemToDelete(null);
      setDeletingId(null);
    }
  };

  const toggleSelectProblem = (id) => {
    setSelectedProblems(prev => 
      prev.includes(id) 
        ? prev.filter(problemId => problemId !== id) 
        : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedProblems.length === 0) return;
    
    const confirm = window.confirm(`❗ Are you sure you want to delete ${selectedProblems.length} problems?`);
    if (!confirm) return;

    try {
      await Promise.all(
        selectedProblems.map(id => 
          axiosClient.delete(`/problem/delete/${id}`)
        )
      );
      setProblems(problems.filter(p => !selectedProblems.includes(p._id)));
      setSelectedProblems([]);
      setSuccess(`✅ ${selectedProblems.length} problems deleted successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('❌ Failed to delete some problems.');
      console.error(err);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || 
                            problem.difficulty.toLowerCase() === selectedDifficulty;
    const matchesTag = selectedTag === 'all' || 
                      problem.tags.toLowerCase().includes(selectedTag.toLowerCase());
    
    return matchesSearch && matchesDifficulty && matchesTag;
  });

  const sortedProblems = [...filteredProblems].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = sortedProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(sortedProblems.length / problemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this problem? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button 
                className="btn btn-ghost" 
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-error" 
                onClick={handleConfirmDelete}
                disabled={deletingId}
              >
                {deletingId ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto bg-base-100 shadow-2xl rounded-xl p-6">
        {error && (
          <div className="alert alert-error mb-6 shadow-lg">
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success mb-6 shadow-lg">
            <span>{success}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">🗑️ Delete Problems</h1>
          {selectedProblems.length > 0 && (
            <button 
              className="btn btn-error"
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedProblems.length})
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="form-control flex-1">
            <input
              type="text"
              placeholder="Search problems..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="select select-bordered"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          
          <select 
  className="select select-bordered"
  value={selectedTag}
  onChange={(e) => setSelectedTag(e.target.value)}
>
  <option value="all">All Tags</option>
  {Array.from(
    new Set(
      problems
        .flatMap(p => 
          p.tags 
            ? p.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
            : []
        )
    )
  ).map(tag => (
    <option key={tag} value={tag}>{tag}</option>
  ))}
</select>
        </div>

        {problems.length === 0 ? (
          <div className="text-center text-lg text-gray-400 py-10">
            No problems found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl">
              <table className="table table-zebra w-full">
                <thead className="text-base font-semibold bg-base-300">
                  <tr>
                    <th className="w-1/12">
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-sm"
                        checked={selectedProblems.length === problems.length && problems.length > 0}
                        onChange={() => {
                          if (selectedProblems.length === problems.length) {
                            setSelectedProblems([]);
                          } else {
                            setSelectedProblems(problems.map(p => p._id));
                          }
                        }}
                      />
                    </th>
                    <th className="w-1/12">#</th>
                    <th 
                      className="w-4/12 cursor-pointer hover:bg-base-100"
                      onClick={() => requestSort('title')}
                    >
                      Title {sortConfig.key === 'title' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="w-2/12 cursor-pointer hover:bg-base-100"
                      onClick={() => requestSort('difficulty')}
                    >
                      Difficulty {sortConfig.key === 'difficulty' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="w-3/12">Tags</th>
                    <th className="w-2/12">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProblems.map((problem, index) => (
                    <tr key={problem._id} className="hover:bg-base-200 transition">
                      <td>
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-sm"
                          checked={selectedProblems.includes(problem._id)}
                          onChange={() => toggleSelectProblem(problem._id)}
                        />
                      </td>
                      <td>{indexOfFirstProblem + index + 1}</td>
                      <td className="font-medium">{problem.title}</td>
                      <td>
                        <span className={`badge text-white capitalize ${
                          problem.difficulty.toLowerCase() === 'easy'
                            ? 'badge-success'
                            : problem.difficulty.toLowerCase() === 'medium'
                            ? 'badge-warning'
                            : 'badge-error'
                        }`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {problem.tags.split(',').map(tag => (
                            <span key={tag} className="badge badge-outline badge-info capitalize">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteClick(problem._id)}
                          className="btn btn-sm btn-error btn-outline hover:scale-105 transition"
                          disabled={deletingId === problem._id}
                        >
                          {deletingId === problem._id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedProblems.length > problemsPerPage && (
              <div className="flex justify-center mt-6">
                <div className="join">
                  <button 
                    className="join-item btn" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    className="join-item btn" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDelete;