import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

export function StatusBadge({ status, size = 'sm', showIcon = true }) {
  const normStatus = (status || 'UNKNOWN').toUpperCase();

  const configs = {
    SUCCESS: {
      label: 'SUCCESS',
      bg: 'bg-[#EAF3ED]',
      text: 'text-[#3D7A5A]',
      border: 'border-[#B8D9C5]',
      icon: CheckCircle2,
    },
    VERIFIED: {
      label: 'VERIFIED',
      bg: 'bg-[#EAF3ED]',
      text: 'text-[#3D7A5A]',
      border: 'border-[#B8D9C5]',
      icon: CheckCircle2,
    },
    FAILED: {
      label: 'FAILED',
      bg: 'bg-[#FCEFEB]',
      text: 'text-[#B93826]',
      border: 'border-[#F2BEB6]',
      icon: XCircle,
    },
    PARTIAL: {
      label: 'PARTIAL',
      bg: 'bg-[#FCF5E8]',
      text: 'text-[#B57414]',
      border: 'border-[#EED7A1]',
      icon: AlertTriangle,
    },
    RUNNING: {
      label: 'RUNNING',
      bg: 'bg-[#F8E9E3]',
      text: 'text-[#D85C3A]',
      border: 'border-[#E5D8C8]',
      icon: RefreshCw,
      animate: true,
    },
    PENDING: {
      label: 'PENDING',
      bg: 'bg-cream-200',
      text: 'text-muted',
      border: 'border-sand',
      icon: Clock,
    },
    VERIFYING: {
      label: 'VERIFYING...',
      bg: 'bg-[#FCF5E8]',
      text: 'text-[#B57414]',
      border: 'border-[#EED7A1]',
      icon: RefreshCw,
      animate: true,
    },
  };

  const config = configs[normStatus] || configs.PENDING;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5 font-medium',
    lg: 'text-base px-4 py-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase font-semibold ${config.bg} ${config.text} ${config.border} ${sizeClasses[size] || sizeClasses.sm}`}
    >
      {showIcon && Icon && (
        <Icon className={`w-3.5 h-3.5 ${config.animate ? 'animate-spin' : ''}`} />
      )}
      <span>{config.label}</span>
    </span>
  );
}

export default StatusBadge;
