import Badge from './Badge';

export function StatusBadge({ status, label, className = '' }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase().replace(/[\s-]/g, '_');

  const statusMap = {
    // Green statuses
    active: { variant: 'success', defaultLabel: 'Active' },
    verified: { variant: 'success', defaultLabel: 'Verified' },
    approved: { variant: 'success', defaultLabel: 'Approved' },
    completed: { variant: 'success', defaultLabel: 'Completed' },
    resolved: { variant: 'success', defaultLabel: 'Resolved' },
    paid: { variant: 'success', defaultLabel: 'Paid' },
    confirmed: { variant: 'success', defaultLabel: 'Confirmed' },
    successful: { variant: 'success', defaultLabel: 'Successful' },

    // Amber statuses
    pending: { variant: 'warning', defaultLabel: 'Pending' },
    open: { variant: 'warning', defaultLabel: 'Open' },
    in_review: { variant: 'warning', defaultLabel: 'In Review' },
    under_review: { variant: 'warning', defaultLabel: 'Under Review' },
    pending_verification: { variant: 'warning', defaultLabel: 'Pending Verification' },
    pending_approval: { variant: 'warning', defaultLabel: 'Pending Approval' },
    payment_pending: { variant: 'warning', defaultLabel: 'Payment Pending' },
    awaiting_confirmation: { variant: 'warning', defaultLabel: 'Awaiting Confirmation' },
    partially_paid: { variant: 'warning', defaultLabel: 'Partially Paid' },

    // Red statuses
    rejected: { variant: 'danger', defaultLabel: 'Rejected' },
    suspended: { variant: 'danger', defaultLabel: 'Suspended' },
    blocked: { variant: 'danger', defaultLabel: 'Blocked' },
    inactive: { variant: 'danger', defaultLabel: 'Inactive' },
    failed: { variant: 'danger', defaultLabel: 'Failed' },
    reported: { variant: 'danger', defaultLabel: 'Reported' },
    flagged: { variant: 'danger', defaultLabel: 'Flagged' },
    removed: { variant: 'danger', defaultLabel: 'Removed' },

    // Blue statuses
    enrolled: { variant: 'info', defaultLabel: 'Enrolled' },
    processing: { variant: 'info', defaultLabel: 'Processing' },
    published: { variant: 'info', defaultLabel: 'Published' },
    scheduled: { variant: 'info', defaultLabel: 'Scheduled' },

    // Slate / neutral
    draft: { variant: 'slate', defaultLabel: 'Draft' },
    archived: { variant: 'slate', defaultLabel: 'Archived' },
    hidden: { variant: 'slate', defaultLabel: 'Hidden' },
    expired: { variant: 'slate', defaultLabel: 'Expired' },
    disabled: { variant: 'slate', defaultLabel: 'Disabled' },
    dismissed: { variant: 'slate', defaultLabel: 'Dismissed' },
    refunded: { variant: 'slate', defaultLabel: 'Refunded' },
  };

  const config = statusMap[normalized] || {
    variant: 'default',
    defaultLabel: status,
  };

  return (
    <Badge
      variant={config.variant}
      dot
      size="sm"
      className={className}
    >
      {label || config.defaultLabel}
    </Badge>
  );
}

export default StatusBadge;
