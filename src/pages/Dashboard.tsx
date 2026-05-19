import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ==========================================
// SELF-CONTAINED TYPES
// ==========================================
type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
type LeadSource = 'Website' | 'Instagram' | 'Referral';

interface ILead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: string;
}

interface IPaginationMeta {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

// ==========================================
// CORE DASHBOARD COMPONENT
// ==========================================
export default function Dashboard() {
  const [leads, setLeads] = useState<ILead[]>([]);
  
  // Filter & Search States
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('latest');
  
  // Control States
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch leads dynamically matching your exact backend structure
  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('https://gigflow-backend-ctno.onrender.com/api/leads', {
        params: {
          status: statusFilter || undefined,
          source: sourceFilter || undefined,
          search: searchQuery || undefined,
          sortBy,
          page,
          limit: 10
        }
      });
      
      // Directly matching your backend keys: response.data.data & response.data.pagination
      if (response.data && response.data.success) {
        setLeads(response.data.data || []);
        setPagination(response.data.pagination || null);
      } else {
        setLeads([]);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not connect to the data pipeline. Make sure backend terminal is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, sourceFilter, searchQuery, sortBy, page]);

  // Handle Exporting Current Loaded State to CSV
  const exportToCSV = () => {
    if (leads.length === 0) return alert('No data available to export.');
    
    const headers = 'Name,Email,Status,Source,Created At\n';
    const rows = leads.map(lead => 
      `"${lead.name}","${lead.email}","${lead.status}","${lead.source}","${new Date(lead.createdAt).toLocaleDateString()}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Smart_Leads_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-lg shadow-sm border border-gray-100 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Smart Leads Dashboard</h1>
            <p className="text-sm text-gray-500">Manage, qualify, and track your incoming pipelines seamlessly.</p>
          </div>
          <button 
            onClick={exportToCSV}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 font-medium transition flex items-center justify-center gap-2 text-sm self-start md:self-auto shadow-sm"
          >
            📥 Export CSV Report
          </button>
        </div>

        {/* Multi-Filters Panel Layout */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input 
            type="text"
            placeholder="Search name or email..."
            className="px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />

          <select 
            className="px-3 py-2 border rounded-md text-sm outline-none bg-white text-gray-700"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
          </select>

          <select 
            className="px-3 py-2 border rounded-md text-sm outline-none bg-white text-gray-700"
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Sources</option>
            <option value="Website">Website</option>
            <option value="Instagram">Instagram</option>
            <option value="Referral">Referral</option>
          </select>

          <select 
            className="px-3 py-2 border rounded-md text-sm outline-none bg-white text-gray-700"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          >
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
        </div>

        {/* Data Table Display Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Syncing pipeline records...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-600 font-medium bg-red-50">{error}</div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium">No records found matching current query parameters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email Contact</th>
                    <th className="p-4">Pipeline Status</th>
                    <th className="p-4">Acquisition Source</th>
                    <th className="p-4">Creation Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50/70 transition">
                      <td className="p-4 font-medium text-gray-900">{lead.name}</td>
                      <td className="p-4 text-gray-500">{lead.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          lead.status === 'New' ? 'bg-blue-50 text-blue-700' :
                          lead.status === 'Contacted' ? 'bg-amber-50 text-amber-700' :
                          lead.status === 'Qualified' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-600">{lead.source}</td>
                      <td className="p-4 text-gray-400 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Component Footer */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages} (Total: {pagination.totalRecords})
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 border rounded bg-white text-xs font-medium shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage(prev => prev + 1)}
                  className="px-3 py-1.5 border rounded bg-white text-xs font-medium shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}