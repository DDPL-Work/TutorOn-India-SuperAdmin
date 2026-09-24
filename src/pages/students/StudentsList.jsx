import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiPlus,
  FiDownload,
  FiEye,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiPhone,
  FiMail,
} from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import SearchBar from '../../components/ui/SearchBar';
import FilterBar from '../../components/ui/FilterBar';
import TableScrollButtons from '../../components/ui/TableScrollButtons';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Dropdown from '../../components/ui/Dropdown';
import { useToast } from '../../hooks/useToast';
import { INITIAL_STUDENTS } from '../../data/students';
import { formatDate } from '../../utils/formatters';

export function StudentsList() {
  const navigate = useNavigate();
  const toast = useToast();

  const tableRef = useRef(null);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [boardFilter, setBoardFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    grade: 'Class XII (PCM)',
    board: 'CBSE',
    school: '',
    city: '',
    state: '',
    guardianName: '',
    guardianPhone: '',
    status: 'Active',
  });

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const total = 8452; // Matching exact prompt KPI
    const active = students.filter((s) => s.status === 'Active').length;
    const pending = students.filter((s) => s.status === 'Pending').length;
    const inactive = students.filter((s) => s.status === 'Inactive').length;
    return { total, active, pending, inactive };
  }, [students]);

  // Filtered & Searched Students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search match
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.phone.includes(query) ||
        student.city.toLowerCase().includes(query);

      // Status match
      const matchesStatus =
        statusFilter === 'ALL' || student.status.toLowerCase() === statusFilter.toLowerCase();

      // Board match
      const matchesBoard = boardFilter === 'ALL' || student.board === boardFilter;

      return matchesSearch && matchesStatus && matchesBoard;
    });
  }, [students, searchTerm, statusFilter, boardFilter]);

  // Paginated Students
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setBoardFilter('ALL');
    setCurrentPage(1);
  };

  const isFiltered = searchTerm !== '' || statusFilter !== 'ALL' || boardFilter !== 'ALL';
  const activeFilterCount = (statusFilter !== 'ALL' ? 1 : 0) + (boardFilter !== 'ALL' ? 1 : 0);

  // Status Toggle
  const handleStatusToggle = (studentId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: nextStatus } : s))
    );
    toast.success(
      'Student Status Updated',
      `Student ${studentId} marked as ${nextStatus}.`
    );
  };

  // Add Student Handler
  const handleAddStudentSubmit = (e) => {
    e.preventDefault();

    if (!newStudent.name || !newStudent.email || !newStudent.phone) {
      toast.error('Required Fields Missing', 'Please provide student name, email, and phone.');
      return;
    }

    const nextId = `STU-${10020 + students.length + 1}`;
    const createdStudent = {
      id: nextId,
      ...newStudent,
      joinedDate: new Date().toISOString().split('T')[0],
      enrollmentsCount: 0,
      avatar: null,
      accountDetails: {
        kycStatus: 'Verified',
        totalHoursLearned: 0,
        lastLogin: new Date().toISOString(),
        loginCount: 1,
        accountStanding: 'Good Standing',
      },
      enrollmentHistory: [],
      connectionHistory: [],
      activityLog: [
        {
          id: `ACT-${Date.now()}`,
          type: 'account_created',
          description: 'Student account registered by Super Admin',
          timestamp: new Date().toISOString(),
        },
      ],
      reports: {
        attendanceRate: '-',
        homeworkSubmissionRate: '-',
        academicRankInBatches: 'New Student',
        adminRemarks: 'Account created via Super Admin terminal.',
      },
    };

    setStudents((prev) => [createdStudent, ...prev]);
    setIsAddModalOpen(false);
    toast.success(
      'Student Registered',
      `${createdStudent.name} (${createdStudent.id}) has been added to TutorOn India.`
    );

    // Reset modal form
    setNewStudent({
      name: '',
      email: '',
      phone: '',
      grade: 'Class XII (PCM)',
      board: 'CBSE',
      school: '',
      city: '',
      state: '',
      guardianName: '',
      guardianPhone: '',
      status: 'Active',
    });
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Grade', 'Board', 'City', 'Enrollments', 'Status', 'Joined Date'];
    const rows = filteredStudents.map((s) => [
      s.id,
      `"${s.name}"`,
      s.email,
      s.phone,
      `"${s.grade}"`,
      s.board,
      s.city,
      s.enrollmentsCount,
      s.status,
      s.joinedDate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tutoron_students_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Students Exported', `Exported ${filteredStudents.length} student records as CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Students"
        subtitle="Manage and review registered students."
        badge={
          <Badge variant="navy" size="sm">
            {summaryMetrics.total.toLocaleString('en-IN')} Total Learners
          </Badge>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FiDownload className="w-3.5 h-3.5" />}
              onClick={handleExportCSV}
            >
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FiPlus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Student
            </Button>
          </>
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Students
            </span>
            <p className="text-xl font-bold font-geist text-slate-900 mt-0.5">
              8,452
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-[#123B66]/10 text-[#123B66]">
            <FiUsers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Learners
            </span>
            <p className="text-xl font-bold font-geist text-emerald-700 mt-0.5">
              7,890
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <FiUserCheck className="w-4 h-4" />
          </div>
        </div>

        {/* <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pending Verification
            </span>
            <p className="text-xl font-bold font-geist text-amber-700 mt-0.5">
              342
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <FiClock className="w-4 h-4" />
          </div>
        </div> */}

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Inactive Accounts
            </span>
            <p className="text-xl font-bold font-geist text-slate-600 mt-0.5">
              220
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
            <FiUserX className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Page Size */}
      <FilterBar
        isFiltered={isFiltered}
        activeFilterCount={activeFilterCount}
        onReset={handleResetFilters}
        actions={
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <TableScrollButtons targetRef={tableRef} />
          </div>
        }
      >
        {/* Search */}
        <div className="w-48 sm:w-60 md:w-64 flex-1 min-w-[140px] max-w-xs">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            onClear={() => setSearchTerm('')}
            placeholder="Search student, ID, email, phone..."
            size="sm"
          />
        </div>

        {/* Status Filter */}
        <div className="w-32 sm:w-36 shrink-0">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>

        {/* Board Filter */}
        <div className="w-32 sm:w-36 shrink-0">
          <Select
            value={boardFilter}
            onChange={(e) => {
              setBoardFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5"
          >
            <option value="ALL">All Boards</option>
            <option value="CBSE">CBSE</option>
            <option value="ICSE">ICSE</option>
            <option value="State Board">State Board</option>
          </Select>
        </div>
      </FilterBar>

      {/* Students Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-subtle overflow-hidden">
        {paginatedStudents.length > 0 ? (
          <div ref={tableRef} className="overflow-x-auto scroll-smooth">
            <table className="w-full min-w-[920px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 whitespace-nowrap">Student & ID</th>
                  <th className="py-3 px-4 whitespace-nowrap">Contact Details</th>
                  <th className="py-3 px-4 whitespace-nowrap">Joined</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Enrollments</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    {/* Student Info with Circular Avatar & ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar name={student.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-[#123B66] transition-colors leading-tight">
                            {student.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-[10px]">
                              {student.id}
                            </span>
                            <span>{student.grade} · {student.board}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Details (Email & Phone Stacked) */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <FiMail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{student.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                          <FiPhone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{student.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {formatDate(student.joinedDate)}
                    </td>

                    {/* Enrollments Count */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium font-mono ${
                          student.enrollmentsCount > 0
                            ? 'bg-blue-50 text-[#123B66] border border-blue-100 font-semibold'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {student.enrollmentsCount} {student.enrollmentsCount === 1 ? 'Batch' : 'Batches'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={student.status} />
                    </td>

                    {/* Actions & More */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/students/${student.id}`)}
                          leftIcon={<FiEye className="w-3.5 h-3.5" />}
                          className="h-7 text-xs px-2.5 whitespace-nowrap"
                        >
                          View Details
                        </Button>

                        <Dropdown
                          align="right"
                          width="w-44"
                          trigger={
                            <button
                              type="button"
                              className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                              aria-label="Student actions"
                            >
                              <FiMoreVertical className="w-4 h-4" />
                            </button>
                          }
                          items={[
                            {
                              label: 'View Dossier',
                              icon: <FiEye />,
                              onClick: () => navigate(`/students/${student.id}`),
                            },
                            {
                              label: student.status === 'Active' ? 'Mark Inactive' : 'Mark Active',
                              icon: student.status === 'Active' ? <FiXCircle className="text-amber-600" /> : <FiCheckCircle className="text-emerald-600" />,
                              onClick: () => handleStatusToggle(student.id, student.status),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No students match criteria"
            description="We couldn't find any registered students matching your current search and filter parameters."
            action={
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            }
          />
        )}

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredStudents.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Student"
        description="Create a verified student record inside TutorOn India Super Admin."
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddStudentSubmit}
            >
              Add Student Record
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddStudentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student Full Name"
              required
              placeholder="e.g. Vikramaditya Rao"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            />
            <Input
              label="Student Email Address"
              type="email"
              required
              placeholder="e.g. vikram.rao@gmail.com"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Number"
              required
              placeholder="+91 98765 43210"
              value={newStudent.phone}
              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
            />
            <Select
              label="Class / Target Batch"
              value={newStudent.grade}
              onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
            >
              <option value="Class XII (PCM)">Class XII (PCM)</option>
              <option value="Class XII (PCB)">Class XII (PCB)</option>
              <option value="Class XI (PCM)">Class XI (PCM)</option>
              <option value="Class XI (PCB)">Class XI (PCB)</option>
              <option value="Class X (CBSE)">Class X (CBSE)</option>
              <option value="Class IX (ICSE)">Class IX (ICSE)</option>
              <option value="NEET Repeater">NEET Repeater</option>
              <option value="JEE Aspirant">JEE Aspirant</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Affiliated Board"
              value={newStudent.board}
              onChange={(e) => setNewStudent({ ...newStudent, board: e.target.value })}
            >
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
              <option value="IB">IB</option>
            </Select>
            <Input
              label="City"
              placeholder="e.g. Hyderabad"
              value={newStudent.city}
              onChange={(e) => setNewStudent({ ...newStudent, city: e.target.value })}
            />
            <Input
              label="State"
              placeholder="e.g. Telangana"
              value={newStudent.state}
              onChange={(e) => setNewStudent({ ...newStudent, state: e.target.value })}
            />
          </div>

          <Input
            label="School / College Institution"
            placeholder="e.g. Chaitanya Junior Kalasala"
            value={newStudent.school}
            onChange={(e) => setNewStudent({ ...newStudent, school: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <Input
              label="Parent / Guardian Name"
              placeholder="e.g. Venkateswara Rao"
              value={newStudent.guardianName}
              onChange={(e) => setNewStudent({ ...newStudent, guardianName: e.target.value })}
            />
            <Input
              label="Guardian Phone"
              placeholder="+91 98765 00000"
              value={newStudent.guardianPhone}
              onChange={(e) => setNewStudent({ ...newStudent, guardianPhone: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default StudentsList;
