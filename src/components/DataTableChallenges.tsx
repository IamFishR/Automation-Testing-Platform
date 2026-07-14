import React, { useState, useEffect } from 'react';
import { Database, Search, ArrowUpDown, Trash2, PlusCircle, RefreshCw, Loader2, Info } from 'lucide-react';
import { TableRow } from '../types';

const INITIAL_ROWS: TableRow[] = [
  { id: 101, name: 'Alan Turing', email: 'alan@turing.org', status: 'Active', role: 'Mathematician', joinedDate: '2026-01-12' },
  { id: 102, name: 'Grace Hopper', email: 'grace@hopper.edu', status: 'Active', role: 'Programmer', joinedDate: '2026-02-15' },
  { id: 103, name: 'Ada Lovelace', email: 'ada@lovelace.co.uk', status: 'Active', role: 'Analyst', joinedDate: '2026-03-22' },
  { id: 104, name: 'John von Neumann', email: 'john@neumann.com', status: 'Inactive', role: 'Consultant', joinedDate: '2026-04-10' },
  { id: 105, name: 'Margaret Hamilton', email: 'margaret@hamilton.nasa', status: 'Pending', role: 'Director', joinedDate: '2026-05-01' }
];

const NEW_POOL: Omit<TableRow, 'id'>[] = [
  { name: 'Claude Shannon', email: 'claude@bell-labs.com', status: 'Active', role: 'Cryptographer', joinedDate: '2026-06-18' },
  { name: 'Tim Berners-Lee', email: 'tim@w3c.org', status: 'Active', role: 'Web Pioneer', joinedDate: '2026-07-02' },
  { name: 'Linus Torvalds', email: 'linus@linux.org', status: 'Active', role: 'Kernel Dev', joinedDate: '2026-07-10' },
  { name: 'Dennis Ritchie', email: 'dennis@bell-labs.com', status: 'Inactive', role: 'C Creator', joinedDate: '2026-05-15' },
  { name: 'Katherine Johnson', email: 'katherine@nasa.gov', status: 'Active', role: 'Computer', joinedDate: '2026-04-19' }
];

export default function DataTableChallenges() {
  const [rows, setRows] = useState<TableRow[]>(INITIAL_ROWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof TableRow>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Delays states
  const [isAdding, setIsAdding] = useState(false);
  const [isLazyLoading, setIsLazyLoading] = useState(false);
  const [poolIndex, setPoolIndex] = useState(0);

  // Sorting Handler
  const handleSort = (field: keyof TableRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Delete Row Handler (immediate)
  const handleDeleteRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id));
  };

  // Simulated Lag Addition Handler (2000ms delay)
  const handleAddRowDelayed = () => {
    if (isAdding) return;
    setIsAdding(true);

    setTimeout(() => {
      const nextItem = NEW_POOL[poolIndex % NEW_POOL.length];
      const newRow: TableRow = {
        ...nextItem,
        id: Math.floor(200 + Math.random() * 800)
      };
      setRows(prev => [newRow, ...prev]);
      setPoolIndex(prev => prev + 1);
      setIsAdding(false);
    }, 2000); // 2 second delay to test wait capabilities!
  };

  // Simulated Lazy Load Handler (1500ms delay)
  const handleLoadMoreRows = () => {
    if (isLazyLoading) return;
    setIsLazyLoading(true);

    setTimeout(() => {
      const batch: TableRow[] = [
        { id: 901, name: 'Anita Borg', email: 'anita@systers.org', status: 'Active', role: 'Founder', joinedDate: '2026-01-20' },
        { id: 902, name: 'Seymour Cray', email: 'seymour@cray.com', status: 'Inactive', role: 'Architect', joinedDate: '2026-02-18' }
      ];
      // Append only if not already added to avoid duplication
      setRows(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const filteredBatch = batch.filter(r => !existingIds.has(r.id));
        return [...prev, ...filteredBatch];
      });
      setIsLazyLoading(false);
    }, 1500);
  };

  const handleResetTable = () => {
    setRows(INITIAL_ROWS);
    setSearchQuery('');
    setSortField('id');
    setSortDirection('asc');
    setCurrentPage(1);
    setPoolIndex(0);
  };

  // Processing rows: filter first, then sort
  const filteredRows = rows.filter(row => {
    const q = searchQuery.toLowerCase();
    return (
      row.name.toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q) ||
      row.role.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    );
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return sortDirection === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  // Pagination bounds
  const totalPages = Math.ceil(sortedRows.length / itemsPerPage) || 1;
  const paginatedRows = sortedRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Auto adjust page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div id="tables-challenges-root" className="space-y-8">
      {/* Overview Block */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
        <h2 className="text-2xl font-semibold font-display text-stone-900 dark:text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-amber-500" />
          Dynamic Data Tables Arena
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Challenge your automation script to sort table columns, search records, delete items, handle pagination, and synchronize wait-states for slow API loads.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            
            {/* Search Input */}
            <div className="relative max-w-md w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-stone-400" />
              </span>
              <input
                id="table-search-input"
                data-testid="table-search"
                type="text"
                placeholder="Filter by name, email, or role..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="add-row-delayed-btn"
                data-testid="add-row-delayed"
                onClick={handleAddRowDelayed}
                disabled={isAdding}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding (2s lag)...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Row (2s Lag)</span>
                  </>
                )}
              </button>

              <button
                id="lazy-load-rows-btn"
                data-testid="lazy-load-btn"
                onClick={handleLoadMoreRows}
                disabled={isLazyLoading}
                className="bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 font-semibold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isLazyLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading (1.5s)...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Load More (1.5s Lag)</span>
                  </>
                )}
              </button>

              <button
                id="reset-table-btn"
                data-testid="reset-table"
                onClick={handleResetTable}
                className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 font-semibold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Reset table data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Lag Info Banner */}
          {isAdding && (
            <div id="adding-loading-banner" className="mb-4 bg-stone-50 dark:bg-stone-950/20 text-amber-700 dark:text-amber-400 p-3 rounded-xl text-xs flex items-center gap-2 border border-stone-200/50 dark:border-stone-900/30 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Simulating database lag! Inserting a record into row pool in 2 seconds. The script must wait for this banner to disappear or row to render!</span>
            </div>
          )}

          {/* The Table */}
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
            <table id="test-data-table" className="w-full text-sm text-left text-stone-500 dark:text-stone-400">
              <thead className="text-xs text-stone-700 dark:text-stone-200 uppercase bg-stone-50/70 dark:bg-stone-950/50 border-b border-stone-200 dark:border-stone-800 font-display font-semibold select-none">
                <tr>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1.5">
                      ID <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1.5">
                      Name <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" onClick={() => handleSort('role')}>
                    <div className="flex items-center gap-1.5">
                      Role <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      Status <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" onClick={() => handleSort('joinedDate')}>
                    <div className="flex items-center gap-1.5">
                      Joined Date <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row) => (
                    <tr
                      key={row.id}
                      id={`table-row-${row.id}`}
                      className="bg-white dark:bg-stone-900 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-stone-900 dark:text-stone-300">
                        #{row.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-stone-900 dark:text-white">{row.name}</span>
                          <span className="text-xs text-stone-400 font-mono">{row.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-700 dark:text-stone-300">
                        {row.role}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                          row.status === 'Active'
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30'
                            : row.status === 'Inactive'
                            ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-stone-500 dark:text-stone-400">
                        {row.joinedDate}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          id={`delete-btn-${row.id}`}
                          data-testid={`delete-row-${row.id}`}
                          onClick={() => handleDeleteRow(row.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all cursor-pointer"
                          title="Delete developer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr id="empty-table-row">
                    <td colSpan={6} className="px-6 py-8 text-center text-stone-400 dark:text-stone-500">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 border-t border-stone-100 dark:border-stone-800 pt-6">
            <span className="text-xs text-stone-500 dark:text-stone-400" id="table-record-count">
              Showing <strong>{Math.min(sortedRows.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(sortedRows.length, currentPage * itemsPerPage)}</strong> of <strong>{sortedRows.length}</strong> entries
            </span>

            <div className="flex items-center gap-2">
              <button
                id="prev-page-btn"
                data-testid="pagination-prev"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-45 transition-colors cursor-pointer"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    id={`page-btn-${i + 1}`}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      currentPage === i + 1
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 border border-transparent hover:border-stone-100 dark:hover:border-stone-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                id="next-page-btn"
                data-testid="pagination-next"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-45 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

          {/* Practical Testing Tips */}
          <div className="mt-6 bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 flex gap-3 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-700 dark:text-stone-300 block mb-0.5">Automation Challenge Tips:</strong>
              <p>1. Test sorting by clicking headers and extracting the text content of a column to assert alphabetic sorting.</p>
              <p className="mt-1">2. Validate the filtering logic by typing a query and verifying the record counter shrinks and only matching items exist in table rows.</p>
              <p className="mt-1">3. Test async operations by clicking "Add Row" and asserting that the new row appears precisely after the spinner disappears (polling/waiting).</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
