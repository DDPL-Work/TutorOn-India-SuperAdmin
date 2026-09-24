import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiDownload,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiTrash2,
  FiBookmark,
  FiFolder,
  FiX,
  FiUpload,
  FiBookOpen,
  FiPlus,
  FiCheckCircle,
  FiVideo,
  FiExternalLink,
  FiPlay,
} from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import DataTable from '../../components/ui/DataTable';
import TableScrollButtons from '../../components/ui/TableScrollButtons';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { INITIAL_MATERIALS } from '../../data/materials';

export function StudyMaterials() {
  const navigate = useNavigate();
  const toast = useToast();

  const tableRef = useRef(null);
  const [materials, setMaterials] = useState(INITIAL_MATERIALS);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Material inspection modal
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    material: null,
  });

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    material: null,
  });

  // Hidden file input ref for chapter file replacement
  const fileInputRef = useRef(null);
  const [targetChapterId, setTargetChapterId] = useState(null);

  // Trigger file selection for a specific chapter
  const triggerChapterImport = (chapterId) => {
    setTargetChapterId(chapterId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle uploaded/replaced file
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !targetChapterId || !detailModal.material) return;

    const formattedSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

    // Create a local blob object URL for full native multi-page PDF rendering
    const fileUrl = URL.createObjectURL(file);
    const estPages = Math.max(1, Math.round(file.size / (80 * 1024)));

    // Update chapter inside material
    let updatedTargetChapter = null;
    const updatedChapters = (detailModal.material.chapters || []).map((ch) => {
      if (ch.id === targetChapterId) {
        updatedTargetChapter = {
          ...ch,
          fileName: file.name,
          fileSize: formattedSize,
          uploadedDate: formattedDate,
          fileUrl: fileUrl,
          fileObj: file,
          pages: `${estPages} Pages`,
          status: 'Updated',
        };
        return updatedTargetChapter;
      }
      return ch;
    });

    const updatedMaterial = {
      ...detailModal.material,
      chapters: updatedChapters,
    };

    // Update both modal and global materials state
    setDetailModal({
      ...detailModal,
      material: updatedMaterial,
    });

    setMaterials((prev) =>
      prev.map((m) => (m.id === updatedMaterial.id ? updatedMaterial : m))
    );

    toast.success(
      'Chapter PDF Replaced & Live',
      `"${file.name}" (${formattedSize}) imported successfully. Click "View PDF" to open it in a new tab.`
    );

    setTargetChapterId(null);
  };

  // Open PDF directly in a new tab (Native Multi-page PDF engine without popup modal)
  const handleViewPdfInNewTab = (chapter, material) => {
    if (!chapter) return;

    // If an imported real PDF file exists, open it directly in a new tab
    if (chapter.fileUrl) {
      window.open(chapter.fileUrl, '_blank');
      toast.success('Opening PDF in New Tab', `Opened "${chapter.fileName}" in new tab.`);
      return;
    }

    // If default demo chapter, generate high-quality multi-page PDF on the fly and open in a new tab
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Page 1: Header & Cover
      doc.setFillColor(18, 59, 102); // #123B66
      doc.rect(0, 0, 210, 24, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('TUTORON INDIA COURSEWARE', 15, 14);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(material?.batch?.code || 'CBSE-STD-2026', 195, 14, { align: 'right' });

      // Title & Meta
      doc.setTextColor(11, 31, 58);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(chapter.title || 'Chapter Study Material', 15, 36);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Faculty: ${material?.teacher?.name || 'Faculty Member'}  |  Subject: ${material?.batch?.subject || 'Academics'}  |  Doc Ref: ${chapter.id}`, 15, 43);

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 47, 195, 47);

      // Section 1
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(18, 59, 102);
      doc.text('1. Core Theoretical Foundations & Principles', 15, 56);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const text1 = `This comprehensive courseware module covers essential syllabus theory, mathematical derivations, formula sheets, and practical lab insights curated for ${material?.batch?.name || 'Students'}.\n\nWhen studying this module, ensure all fundamental formulas, boundary values, and applications are carefully verified and practiced.`;
      const split1 = doc.splitTextToSize(text1, 180);
      doc.text(split1, 15, 63);

      // Table 1
      autoTable(doc, {
        startY: 80,
        head: [['Sec', 'Key Formula / Concept', 'Sign Convention / Units', 'Exam Weightage']],
        body: [
          ['01', 'EMF (e) = - dPhi / dt', 'Volts [V] (Opposes flux change)', 'High (Direct)'],
          ['02', 'Motional EMF = B * v * l', 'Right Hand Rule [V]', 'Medium'],
          ['03', 'Self Inductance L = mu0 * N^2 * A / l', 'Henry [H]', 'High (Numerical)'],
          ['04', 'Energy Density uB = B^2 / (2 * mu0)', 'Joules / m^3 [J/m3]', 'Standard'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [18, 59, 102], textColor: 255, fontSize: 8.5, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3.5 },
      });

      // Solved Examples
      const yPos = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 120) + 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(18, 59, 102);
      doc.text('2. Solved Numerical Example (Step-by-Step)', 15, yPos);

      doc.setFillColor(248, 250, 252);
      doc.rect(15, yPos + 4, 180, 26, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(15, yPos + 4, 180, 26, 'S');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text('Problem 1: A 20cm conductor loop moves across a magnetic field B = 1.5 T at speed v = 2 m/s.', 18, yPos + 10);
      doc.text('Solution: Induced EMF = B * v * l = 1.5 * 2.0 * 0.20 = 0.60 Volts.', 18, yPos + 16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(18, 59, 102);
      doc.text('Final Result: Induced EMF = 0.60 V (Dissipated Power = 0.072 W)', 18, yPos + 22);

      // Footer Page 1
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`TutorOn India Official Courseware  |  Page 1 of 2  |  ${chapter.fileName}`, 15, 285);

      // Page 2
      doc.addPage();
      doc.setFillColor(18, 59, 102);
      doc.rect(0, 0, 210, 16, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${chapter.chapterNo} - Practice Questions & Exam Summary`, 15, 11);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(18, 59, 102);
      doc.text('3. Practice Question Bank for Competitive Revision', 15, 28);

      autoTable(doc, {
        startY: 33,
        head: [['Q#', 'Question Description', 'Difficulty', 'Target Exam']],
        body: [
          ['Q1', 'Calculate the coefficient of coupling between two coaxial solenoids.', 'Moderate', 'JEE Main / NEET'],
          ['Q2', 'Determine energy stored in an inductor when current increases linearly.', 'Hard', 'JEE Advanced'],
          ['Q3', 'Prove that induced electric field is non-conservative in nature.', 'Theory', 'CBSE Board (5 Marks)'],
          ['Q4', 'Evaluate heat dissipation per period in an AC driven inductor.', 'Advanced', 'JEE Advanced'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [11, 31, 58], textColor: 255, fontSize: 8.5 },
        styles: { fontSize: 8, cellPadding: 3.5 },
      });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`TutorOn India Official Courseware  |  Page 2 of 2  |  ${chapter.fileName}`, 15, 285);

      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      toast.success('Opening PDF in New Tab', `Opened ${chapter.chapterNo} full document`);
    } catch (err) {
      console.error(err);
      toast.error('PDF Generation Error', 'Could not open PDF in new tab.');
    }
  };

  // Open Video lecture directly in a new tab (without modal popup)
  const handleOpenVideoInNewTab = (chapter) => {
    if (!chapter) return;
    const url = chapter.videoUrl || 'https://www.youtube.com/watch?v=rfscVS0vtbw';
    window.open(url, '_blank');
    toast.success('Opening Video Lecture in New Tab', `Playing lecture for "${chapter.chapterNo} - ${chapter.title}"`);
  };

  // Add a new chapter to the current material
  const handleAddChapter = () => {
    if (!detailModal.material) return;
    const currentChapters = detailModal.material.chapters || [];
    const nextIndex = currentChapters.length + 1;
    const newChapter = {
      id: `CH-0${nextIndex}`,
      chapterNo: `Ch ${nextIndex}`,
      title: `Chapter ${nextIndex}: Practice Problems & Theory Summary`,
      fileName: `Ch${nextIndex}_Supplementary_Module_v1.pdf`,
      fileSize: '1.5 MB',
      pages: '12 Pages',
      uploadedDate: 'Just now',
      status: 'Active',
    };

    const updatedChapters = [...currentChapters, newChapter];
    const updatedMaterial = {
      ...detailModal.material,
      chapters: updatedChapters,
    };

    setDetailModal({
      ...detailModal,
      material: updatedMaterial,
    });

    setMaterials((prev) =>
      prev.map((m) => (m.id === updatedMaterial.id ? updatedMaterial : m))
    );

    toast.success('Chapter Added', `Created ${newChapter.chapterNo} with default template. You can now import a custom PDF.`);
  };

  // Tab definitions
  const tabs = [
    { key: 'all', label: 'All Materials', count: materials.length },
    {
      key: 'published',
      label: 'Published',
      count: materials.filter((m) => m.status === 'Published').length,
    },
    {
      key: 'reported',
      label: 'Reported / Flagged',
      count: materials.filter((m) => m.status === 'Reported').length,
    },
    {
      key: 'draft',
      label: 'Drafts',
      count: materials.filter((m) => m.status === 'Draft').length,
    },
    {
      key: 'hidden',
      label: 'Hidden by Admin',
      count: materials.filter((m) => m.status === 'Hidden').length,
    },
  ];

  // Filtered dataset
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      // Tab filter
      if (activeTab === 'published' && item.status !== 'Published') return false;
      if (activeTab === 'reported' && item.status !== 'Reported') return false;
      if (activeTab === 'draft' && item.status !== 'Draft') return false;
      if (activeTab === 'hidden' && item.status !== 'Hidden') return false;

      // File type filter
      if (fileTypeFilter !== 'ALL' && item.fileType !== fileTypeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchTeacher = item.teacher.name.toLowerCase().includes(q);
        const matchBatch = item.batch.name.toLowerCase().includes(q) || item.batch.code.toLowerCase().includes(q);
        const matchFile = item.fileName.toLowerCase().includes(q);
        if (!matchTitle && !matchTeacher && !matchBatch && !matchFile) return false;
      }

      return true;
    });
  }, [materials, activeTab, fileTypeFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMaterials.length / pageSize) || 1;
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMaterials.slice(start, start + pageSize);
  }, [filteredMaterials, currentPage, pageSize]);

  // Actions
  const handleToggleVisibility = (material) => {
    const newStatus = material.status === 'Hidden' ? 'Published' : 'Hidden';
    const updated = materials.map((m) => {
      if (m.id === material.id) {
        return {
          ...m,
          status: newStatus,
          visibility: newStatus === 'Published' ? 'Public to Batch' : 'Restricted',
        };
      }
      return m;
    });

    setMaterials(updated);

    if (detailModal.isOpen && detailModal.material?.id === material.id) {
      setDetailModal({
        ...detailModal,
        material: {
          ...detailModal.material,
          status: newStatus,
          visibility: newStatus === 'Published' ? 'Public to Batch' : 'Restricted',
        },
      });
    }

    if (newStatus === 'Published') {
      toast.success('Material Published', `"${material.title}" is now accessible to students.`);
    } else {
      toast.info('Material Hidden', `"${material.title}" is hidden from student view.`);
    }
  };

  const handleResolveReport = (material) => {
    const updated = materials.map((m) => {
      if (m.id === material.id) {
        return {
          ...m,
          status: 'Published',
          reportReason: null,
        };
      }
      return m;
    });

    setMaterials(updated);

    if (detailModal.isOpen && detailModal.material?.id === material.id) {
      setDetailModal({
        ...detailModal,
        material: { ...detailModal.material, status: 'Published', reportReason: null },
      });
    }

    toast.success('Report Cleared', 'Copyright/content safety flag resolved.');
  };

  const handleDeleteMaterial = () => {
    if (!deleteModal.material) return;
    const updated = materials.filter((m) => m.id !== deleteModal.material.id);
    setMaterials(updated);
    setDeleteModal({ isOpen: false, material: null });
    if (detailModal.isOpen) {
      setDetailModal({ isOpen: false, material: null });
    }
    toast.error('Material Deleted', 'The classroom material was permanently removed.');
  };

  // Columns definition
  const columns = [
    {
      key: 'material',
      header: 'Material & Courseware',
      render: (row) => (
        <div className="flex items-start gap-3 w-[260px]">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#123B66] flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
            <FiFileText className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div
              onClick={() => setDetailModal({ isOpen: true, material: row })}
              className="text-xs font-semibold text-slate-900 hover:text-[#123B66] hover:underline text-left block truncate cursor-pointer"
              title={row.title}
              role="button"
            >
              {row.title}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <span className="font-mono text-[10px] text-slate-400">{row.id}</span>
              <span>•</span>
              <span>{row.fileSize}</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">{(row.chapters || []).length} Chapters</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'teacher',
      header: 'Teacher',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.teacher.name} src={row.teacher.avatar} size="xs" />
          <div className="flex-1 min-w-0">
            <div
              onClick={() => navigate(`/teachers/${row.teacher.id}`)}
              className="text-xs font-medium text-slate-900 hover:text-[#123B66] hover:underline truncate block text-left cursor-pointer"
              role="button"
            >
              {row.teacher.name}
            </div>
            <span className="text-[10px] text-slate-400 truncate block">
              {row.teacher.qualification}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'batch',
      header: 'Batch',
      render: (row) => (
        <div className="max-w-[180px]">
          <div className="text-xs font-medium text-slate-900 truncate" title={row.batch.name}>
            {row.batch.name}
          </div>
          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{row.batch.code}</span>
        </div>
      ),
    },
    {
      key: 'uploadedDate',
      header: 'Uploaded',
      className: 'text-xs text-slate-500 font-mono whitespace-nowrap',
      render: (row) => row.uploadedDate,
    },
    {
      key: 'downloads',
      header: 'Engagement',
      render: (row) => (
        <div className="text-xs text-slate-700">
          <div className="flex items-center gap-1 font-medium">
            <FiDownload className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.downloads}</span>
          </div>
          <span className="text-slate-400 text-[10px] block mt-0.5">{row.viewsCount} views</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right whitespace-nowrap',
      render: (row) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => handleToggleVisibility(row)}
            className="w-7 h-7 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title={row.status === 'Hidden' ? 'Make Published' : 'Hide Material'}
            aria-label="Toggle visibility"
          >
            {row.status === 'Hidden' ? (
              <FiEye className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <FiEyeOff className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailModal({ isOpen: true, material: row })}
            leftIcon={<FiEye className="w-3.5 h-3.5" />}
            className="h-7 text-xs px-2.5"
          >
            Review
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hidden Global File Input for Chapter PDF Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.zip"
        className="hidden"
      />

      {/* Header */}
      <PageHeader
        title="Study Materials"
        subtitle="Review, audit, and moderate classroom study resources uploaded by teachers."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="navy" size="md" className="gap-1.5 py-1 px-3">
              <FiFolder className="w-3.5 h-3.5 text-[#123B66]" />
              <span>{materials.length} Total Course Files</span>
            </Badge>
          </div>
        }
      />

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#123B66] text-[#0B1F3A] font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-[#123B66] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      <FilterBar
        isFiltered={searchQuery !== '' || fileTypeFilter !== 'ALL' || activeTab !== 'all'}
        activeFilterCount={
          (searchQuery ? 1 : 0) + (fileTypeFilter !== 'ALL' ? 1 : 0) + (activeTab !== 'all' ? 1 : 0)
        }
        onReset={() => {
          setSearchQuery('');
          setFileTypeFilter('ALL');
          setActiveTab('all');
          setCurrentPage(1);
        }}
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
        <div className="w-48 sm:w-60 md:w-64 flex-1 min-w-[140px] max-w-xs">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            onClear={() => setSearchQuery('')}
            placeholder="Search by title, teacher, batch, or filename..."
            size="sm"
          />
        </div>

        <div className="w-36 sm:w-40 shrink-0">
          <select
            value={fileTypeFilter}
            onChange={(e) => {
              setFileTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
          >
            <option value="ALL">All File Types</option>
            <option value="PDF">PDF Documents</option>
            <option value="DOCX">Word Documents</option>
            <option value="ZIP">ZIP Archives</option>
          </select>
        </div>
      </FilterBar>

      {/* Materials Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredMaterials.length > 0 ? (
          <>
            <DataTable
              ref={tableRef}
              columns={columns}
              data={paginatedMaterials}
              className="border-none"
            />
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredMaterials.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            </div>
          </>
        ) : (
          <EmptyState
            icon={FiFolder}
            title="No study materials found"
            description="No files match your current filter parameters or search queries."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab('all');
                  setFileTypeFilter('ALL');
                  setSearchQuery('');
                }}
              >
                Clear all filters
              </Button>
            }
          />
        )}
      </div>

      {/* Detail Inspection Modal (Study Material Dossier) */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, material: null })}
        title="Study Material Dossier"
        size="xl"
      >
        {detailModal.material && (
          <div className="space-y-5 text-xs">
            {detailModal.material.status === 'Reported' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-red-900">
                  <FiAlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Reported Material Notice</span>
                </div>
                <p className="text-red-700">{detailModal.material.reportReason}</p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveReport(detailModal.material)}
                    className="h-7 text-xs bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                  >
                    Clear & Resolve Flag
                  </Button>
                </div>
              </div>
            )}

            {/* Material Header */}
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">{detailModal.material.title}</h3>
              <p className="text-slate-600 leading-relaxed">{detailModal.material.description}</p>
            </div>

            {/* Primary File Specs */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">File Name:</span>
                <span className="font-mono text-slate-800 font-medium">{detailModal.material.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Type & Size:</span>
                <span className="text-slate-800">
                  {detailModal.material.fileType} • {detailModal.material.fileSize}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Teacher:</span>
                <span className="font-medium text-slate-800">{detailModal.material.teacher.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch Code:</span>
                <span className="font-mono text-slate-800">{detailModal.material.batch.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Upload Date:</span>
                <span className="text-slate-800">{detailModal.material.uploadedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Engagement:</span>
                <span className="text-slate-800">
                  {detailModal.material.downloads} downloads • {detailModal.material.viewsCount} views
                </span>
              </div>
            </div>

            {/* CHAPTERS & CONTENT SECTION */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <FiBookOpen className="w-4 h-4 text-[#123B66]" />
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                    Chapters & Content Modules
                  </h4>
                  <span className="bg-blue-50 text-[#123B66] border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {(detailModal.material.chapters || []).length} Chapters
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddChapter}
                  leftIcon={<FiPlus className="w-3.5 h-3.5" />}
                  className="h-7 text-xs text-[#123B66] border-blue-200 hover:bg-blue-50"
                >
                  Add Chapter
                </Button>
              </div>

              {/* Chapters List */}
              <div className="space-y-2.5">
                {(detailModal.material.chapters || []).length > 0 ? (
                  detailModal.material.chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="p-3 bg-white hover:bg-slate-50/80 rounded-xl border border-slate-200/90 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Chapter Badge & Details */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="bg-[#123B66] text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg shrink-0 mt-0.5 shadow-2xs">
                          {chapter.chapterNo || chapter.id}
                        </span>

                        <div className="space-y-1 min-w-0 flex-1">
                          <h5 className="font-semibold text-slate-900 text-xs leading-snug line-clamp-1">
                            {chapter.title}
                          </h5>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                            <span className="inline-flex items-center gap-1 font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px] truncate max-w-[220px]">
                              <FiFileText className="w-3 h-3 text-red-500 shrink-0" />
                              <span className="truncate">{chapter.fileName}</span>
                            </span>
                            <span>•</span>
                            <span className="font-medium text-slate-700">{chapter.fileSize}</span>
                            <span>•</span>
                            <span>{chapter.pages || '10 Pages'}</span>
                            <span>•</span>
                            <span className="text-slate-400">Updated: {chapter.uploadedDate}</span>
                            {chapter.status === 'Updated' && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold">
                                <FiCheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                Replaced
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Buttons (Video, View PDF & Import File) */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center flex-wrap">
                        {/* Video Lecture Action Button (Opens directly in new tab without modal) */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenVideoInNewTab(chapter)}
                          leftIcon={<FiVideo className="w-3.5 h-3.5 text-indigo-600" />}
                          className="h-8 text-xs px-2.5 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                          title="Open lecture video directly in a new browser tab"
                        >
                          Video
                        </Button>

                        {/* Direct New-Tab Full Multi-Page PDF Viewer */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewPdfInNewTab(chapter, detailModal.material)}
                          leftIcon={<FiExternalLink className="w-3.5 h-3.5 text-[#123B66]" />}
                          className="h-8 text-xs px-2.5 bg-white hover:bg-slate-100 border-slate-200 text-slate-800"
                          title="Open complete PDF document in a new browser tab without modal"
                        >
                          View PDF
                        </Button>

                        {/* Import / Replace Action Button */}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => triggerChapterImport(chapter.id)}
                          leftIcon={<FiUpload className="w-3.5 h-3.5" />}
                          className="h-8 text-xs px-3 bg-[#123B66] hover:bg-[#0B1F3A] text-white shadow-2xs"
                          title="Import a new PDF file to replace current chapter file"
                        >
                          Import
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-500 text-xs">
                    No individual chapters attached yet. Click &quot;Add Chapter&quot; to organize content by modules.
                  </div>
                )}
              </div>
            </div>

            {/* Permissions Matrix (Clean 2-Column Balanced Grid) */}
            <div className="space-y-2 pt-1">
              <h4 className="font-semibold text-slate-800">Student Access Permissions</h4>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-3 rounded-xl border text-center transition-all ${
                    detailModal.material.permissions.viewOnline
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <FiEye className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                  <span className="font-semibold block text-xs">View Online</span>
                  <span className="text-[11px] font-medium text-emerald-600">
                    {detailModal.material.permissions.viewOnline ? 'Allowed (Batch Access)' : 'Disabled'}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-xl border text-center transition-all ${
                    detailModal.material.permissions.bookmark
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <FiBookmark className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                  <span className="font-semibold block text-xs">Bookmark</span>
                  <span className="text-[11px] font-medium text-emerald-600">
                    {detailModal.material.permissions.bookmark ? 'Enabled for Students' : 'Restricted'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleVisibility(detailModal.material)}
                className="text-xs"
              >
                {detailModal.material.status === 'Hidden' ? 'Make Visible' : 'Hide from Students'}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailModal({ isOpen: false, material: null })}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    toast.success('File Download', `Downloading ${detailModal.material.fileName}...`);
                  }}
                  leftIcon={<FiDownload className="w-3.5 h-3.5" />}
                >
                  Download Complete Dossier
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, material: null })}
        title="Delete Study Material"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold text-red-900">Are you sure you want to delete this resource?</p>
            <p className="mt-1 text-red-700">
              This action cannot be undone. Any students who bookmarked this material will lose access immediately.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setDeleteModal({ isOpen: false, material: null })}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteMaterial} leftIcon={<FiTrash2 className="w-3.5 h-3.5" />}>
              Delete File
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default StudyMaterials;
