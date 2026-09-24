import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUploadCloud,
  FiFileText,
  FiEye,
  FiSend,
  FiCalendar,
  FiLink,
  FiUsers,
  FiTag,
} from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';

export function AnnouncementEditor() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'General Announcement',
    audience: 'All Users',
    publishImmediately: true,
    startDate: '2026-09-24',
    endDate: '2026-10-24',
    ctaLabel: '',
    ctaDestination: '',
    status: 'Published',
    attachmentName: '',
  });

  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    if (!formData.title.trim()) {
      toast.error('Missing Title', 'Please provide an announcement title before saving draft.');
      return;
    }
    toast.info('Draft Saved', `Announcement "${formData.title}" saved to local drafts.`);
    navigate('/announcements-promotions/announcements');
  };

  const handlePublish = () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Required Fields Missing', 'Please fill in both the title and message body.');
      return;
    }
    toast.success(
      'Announcement Published',
      `"${formData.title}" is now active and published to ${formData.audience}.`
    );
    navigate('/announcements-promotions/announcements');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="hidden sm:flex items-center text-xs">
        <ol className="flex items-center gap-1.5 text-slate-500 flex-wrap">
          <li>
            <Link to="/dashboard" className="hover:text-[#123B66] hover:underline font-medium">
              Dashboard
            </Link>
          </li>
          <li className="text-slate-400">/</li>
          <li>
            <Link
              to="/announcements-promotions/announcements"
              className="hover:text-[#123B66] hover:underline font-medium"
            >
              Announcements & Promotions
            </Link>
          </li>
          <li className="text-slate-400">/</li>
          <li className="font-semibold text-slate-800">Create Announcement</li>
        </ol>
      </nav>

      {/* Header */}
      <PageHeader
        title="Create Platform Announcement"
        subtitle="Compose and broadcast system-wide updates, notices, or promotional campaigns."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/announcements-promotions/announcements')}
              leftIcon={<FiArrowLeft className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleSaveDraft}
              leftIcon={<FiFileText className="w-4 h-4" />}
            >
              Save Draft
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => setPreviewModalOpen(true)}
              leftIcon={<FiEye className="w-4 h-4" />}
            >
              Preview
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handlePublish}
              leftIcon={<FiSend className="w-4 h-4" />}
            >
              Publish
            </Button>
          </div>
        }
      />

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main Content (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Announcement Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FiTag className="w-4 h-4 text-[#123B66]" />
              <span>Announcement Information</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label htmlFor="announcement-title" className="block font-semibold text-slate-700 mb-1">
                  Announcement Title *
                </label>
                <input
                  id="announcement-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Platform Scheduled Maintenance or Diwali Scholarship Grant"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B66]"
                />
              </div>

              <div>
                <label htmlFor="announcement-type" className="block font-semibold text-slate-700 mb-1">
                  Announcement Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['General Announcement', 'Important Announcement', 'Promotional Announcement'].map(
                    (t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleChange('type', t)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          formData.type === t
                            ? 'bg-[#123B66]/10 border-[#123B66] text-[#0B1F3A] font-semibold ring-1 ring-[#123B66]'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block text-xs">{t.replace(' Announcement', '')}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {t === 'Important Announcement'
                            ? 'High visibility alert'
                            : t === 'Promotional Announcement'
                            ? 'Discount or discount code'
                            : 'Standard update'}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="announcement-message" className="block font-semibold text-slate-700 mb-1">
                  Message Body *
                </label>
                <textarea
                  id="announcement-message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Write the full announcement text that users will see inside their portal..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B66] resize-y"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Call to Action (CTA) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FiLink className="w-4 h-4 text-[#123B66]" />
              <span>Call to Action (Optional)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label htmlFor="announcement-cta-label" className="block font-semibold text-slate-700 mb-1">
                  CTA Button Label
                </label>
                <input
                  id="announcement-cta-label"
                  type="text"
                  value={formData.ctaLabel}
                  onChange={(e) => handleChange('ctaLabel', e.target.value)}
                  placeholder="e.g. Enroll Now, Explore Batches"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B66]"
                />
              </div>

              <div>
                <label htmlFor="announcement-cta-dest" className="block font-semibold text-slate-700 mb-1">
                  Destination URL / Route
                </label>
                <input
                  id="announcement-cta-dest"
                  type="text"
                  value={formData.ctaDestination}
                  onChange={(e) => handleChange('ctaDestination', e.target.value)}
                  placeholder="e.g. /students, /enrollments, https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B66]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Media & Attachments */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FiUploadCloud className="w-4 h-4 text-[#123B66]" />
              <span>Media & Attachments</span>
            </h2>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-slate-300 transition-colors">
              <FiUploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Click to upload banner image or PDF attachment</p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or PDF up to 10MB</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => {
                  handleChange('attachmentName', 'TutorOn_Policy_Annexure_2026.pdf');
                  toast.success('File Attached', 'Attached "TutorOn_Policy_Annexure_2026.pdf"');
                }}
              >
                Choose Mock Document
              </Button>
            </div>

            {formData.attachmentName && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <FiFileText className="w-4 h-4 text-[#123B66]" />
                  <span>{formData.attachmentName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('attachmentName', '')}
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audience & Scheduling (1 Col) */}
        <div className="space-y-6">
          {/* Audience Targeting */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FiUsers className="w-4 h-4 text-[#123B66]" />
              <span>Audience Targeting</span>
            </h2>

            <div className="space-y-2 text-xs">
              {[
                { key: 'All Users', desc: 'Broadcasted to all students & faculty' },
                { key: 'Students', desc: 'Visible only on student dashboard' },
                { key: 'Teachers', desc: 'Visible only on educator portal' },
              ].map((aud) => (
                <label
                  key={aud.key}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.audience === aud.key
                      ? 'bg-blue-50/50 border-[#1D4ED8] ring-1 ring-[#1D4ED8]'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="audience"
                    checked={formData.audience === aud.key}
                    onChange={() => handleChange('audience', aud.key)}
                    className="mt-0.5 text-[#123B66] focus:ring-[#123B66]"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">{aud.key}</span>
                    <span className="text-[11px] text-slate-500">{aud.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Schedule & Duration */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-[#123B66]" />
              <span>Broadcast Schedule</span>
            </h2>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.publishImmediately}
                  onChange={(e) => handleChange('publishImmediately', e.target.checked)}
                  className="rounded text-[#123B66] focus:ring-[#123B66]"
                />
                <span className="font-medium text-slate-800">Publish Immediately upon saving</span>
              </label>

              <div>
                <label htmlFor="announcement-start-date" className="block text-slate-600 font-medium mb-1">
                  Start Date
                </label>
                <input
                  id="announcement-start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#123B66]"
                />
              </div>

              <div>
                <label htmlFor="announcement-end-date" className="block text-slate-600 font-medium mb-1">
                  End Date
                </label>
                <input
                  id="announcement-end-date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#123B66]"
                />
              </div>
            </div>
          </div>

          {/* Publishing Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h2 className="text-sm font-semibold font-geist text-slate-900 border-b border-slate-100 pb-2">
              Publication Status
            </h2>

            <div className="space-y-1.5">
              <label htmlFor="announcement-status-select" className="text-xs text-slate-500 block">
                Target Status
              </label>
              <select
                id="announcement-status-select"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#123B66]"
              >
                <option value="Published">Published (Active)</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="pt-3 space-y-2">
              <Button
                variant="primary"
                size="md"
                onClick={handlePublish}
                className="w-full justify-center"
                leftIcon={<FiSend className="w-4 h-4" />}
              >
                Publish Announcement
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleSaveDraft}
                className="w-full justify-center"
              >
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Announcement Live In-App Preview"
        size="xl"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-linear-to-r from-slate-900 to-[#123B66] text-white rounded-xl space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-white/20">
                {formData.type}
              </span>
              <span className="text-[10px] text-slate-300">Audience: {formData.audience}</span>
            </div>

            <h3 className="text-sm font-bold font-geist">
              {formData.title || 'Announcement Title Preview'}
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {formData.message || 'Write a message to preview how it appears to students and faculty.'}
            </p>

            {formData.ctaLabel && (
              <div className="pt-2">
                <span className="inline-block px-3 py-1.5 rounded-lg bg-white text-[#0B1F3A] font-bold text-xs shadow-xs">
                  {formData.ctaLabel} →
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setPreviewModalOpen(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AnnouncementEditor;
