import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Flame } from 'lucide-react';

interface RiskBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const normLevel = (level || 'LOW').toUpperCase();

  let colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  let Icon = ShieldCheck;

  if (normLevel === 'MEDIUM') {
    colorClasses = 'bg-amber-100 text-amber-900 border-amber-300';
    Icon = ShieldAlert;
  } else if (normLevel === 'HIGH') {
    colorClasses = 'bg-orange-100 text-orange-900 border-orange-300';
    Icon = AlertTriangle;
  } else if (normLevel === 'CRITICAL') {
    colorClasses = 'bg-rose-100 text-rose-900 border-rose-300';
    Icon = Flame;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClasses}`}
      aria-label={`Risk Level: ${normLevel}`}
      role="status"
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      <span>{normLevel} RISK</span>
    </span>
  );
};
