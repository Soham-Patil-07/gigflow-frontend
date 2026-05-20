import { useState, useEffect } from 'react';
import axios from 'axios';


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


export default function Dashboard() {
  const [leads, setLeads] = useState<ILead[]>([]);
  
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('latest');
  
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formStatus, setFormStatus] = useState<LeadStatus>('New');
  const [formSource, setFormSource] = useState<LeadSource>('Website');
  const [formError, setFormError] = useState<string>('');

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
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, sourceFilter, searchQuery, sortBy, page]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingLeadId(null);
    setFormName('');
    setFormEmail('');
    setFormStatus('New');
    setFormSource('Website');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (lead: ILead) => {
    setModalMode('edit');
    setEditingLeadId(lead._id);
    setFormName(lead.name);
    setFormEmail(lead.email);
    setFormStatus(lead.status);
    setFormSource(lead.source);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formEmail.trim()) {
      setFormError('Name and Email fields are strictly required.');
      return;
    }

    try {
      const payload = { name: formName, email: formEmail, status: formStatus, source: formSource };
      
      if (modalMode === 'create') {
        await axios.post('https://gigflow-backend-ctno.onrender.com/api/leads', payload);
      } else {
        await axios.put(`https://gigflow-backend-ctno.onrender.com/api/leads/${editingLeadId}`, payload);
      }
      
      setIsModalOpen(false);
      fetchLeads(); 
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to sync lead record to server pipeline.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to remove this lead record permanently?')) return;
    
    try {
      await axios.delete(`https://gigflow-backend-ctno.onrender.com/api/leads/${id}`);
      fetchLeads(); 
    } catch (err: any) {
      console.error(err);
      alert('Error occurred while deleting lead profile.');
    }
  };

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
        
        {}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-lg shadow-sm border border-gray-100 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Smart Leads Dashboard</h1>
            <p className="text-sm text-gray-500">Manage, qualify, and track your incoming pipelines seamlessly.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={exportToCSV}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 font-medium transition flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              📥 Export CSV Report
            </button>
            <button 
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              ➕ Add New Lead
            </button>
          </div>
        </div>

        {}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input 
            type="text"
            placeholder="Search name or email..."
            className="px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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

        {}
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
                    <th className="p-4 text-center">Actions</th>
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
                      <td className="p-4 text-center space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => openEditModal(lead)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 rounded hover:bg-blue-50 transition"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(lead._id)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 rounded hover:bg-red-50 transition"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {}
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

      {}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border border-gray-100 max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {modalMode === 'create' ? 'Create New Pipeline Lead' : 'Modify Lead Information'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 flex-1">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded">
                  {formError}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Som Patil"
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 border rounded-md text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Source</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as LeadSource)}
                    className="w-full px-3 py-2 border rounded-md text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                    <option value="Website">Website</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm transition"
                >
                  {modalMode === 'create' ? 'Save Record' : 'Apply Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}