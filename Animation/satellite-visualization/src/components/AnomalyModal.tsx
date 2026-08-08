import React, { useState } from 'react';
import type { AIPlan } from '../types/SatelliteState';
import { supabase } from '../lib/supabase';

interface AnomalyModalProps {
  plan: AIPlan;
  onDismiss: () => void;
  onApprove: () => void;
}

export const AnomalyModal: React.FC<AnomalyModalProps> = ({ plan, onDismiss, onApprove }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    // Save immediately on mount without approval
    const saveToDb = async () => {
      try {
        await supabase.from('anomalies').insert([{
          headline: plan.headline,
          risk_level: plan.risk_level,
          what_happened: plan.what_happened,
          next_action: plan.next_action,
          precautions: plan.precautions,
          status: 'Detected - Awaiting Operator Action'
        }]);
      } catch (e) {
        console.error("Failed to insert auto-logged anomaly:", e);
      }
    };
    saveToDb();
  }, [plan]);

  const handleApprove = async () => {
    onDismiss();
  };

  return (
    <div className="anomaly-modal-overlay">
      <div className="anomaly-modal">
        <div className="anomaly-header">
          <div className="anomaly-icon">⚠️</div>
          <h2>Anomaly Detected: {plan.headline}</h2>
        </div>
        
        <div className="anomaly-content">
          <div className="anomaly-section">
            <h3>Situation Report</h3>
            <p>{plan.what_happened}</p>
          </div>
          
          <div className="anomaly-section">
            <h3>Recommended Action</h3>
            <p className="highlight-action">{plan.next_action}</p>
            <p className="highlight-instruction">{plan.satellite_instruction}</p>
          </div>

          {plan.precautions && plan.precautions.length > 0 && (
            <div className="anomaly-section">
              <h3>Operator Precautions</h3>
              <ul>
                {plan.precautions.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="anomaly-actions">
          <button className="btn btn-primary w-full" onClick={onDismiss}>
            Acknowledge Notification
          </button>
        </div>
      </div>
    </div>
  );
};
