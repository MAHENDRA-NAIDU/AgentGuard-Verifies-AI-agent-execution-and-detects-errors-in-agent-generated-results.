import { useState, useEffect, useRef, useCallback } from 'react';
import { socket, joinExecutionRoom, leaveExecutionRoom } from '../services/socket';
import { runAgent } from '../services/api';

export function useAgentExecution() {
  const [status, setStatus] = useState('IDLE'); // IDLE, RUNNING, COMPLETED, FAILED
  const [executionId, setExecutionId] = useState(null);
  const [taskText, setTaskText] = useState('');
  const [steps, setSteps] = useState([]);
  const [currentThinkingStep, setCurrentThinkingStep] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('PENDING');
  const [verificationReport, setVerificationReport] = useState(null);
  const [finalResponse, setFinalResponse] = useState('');
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const timerRef = useRef(null);

  // Live timer tick during execution
  useEffect(() => {
    if (status === 'RUNNING' && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, startTime]);

  // Socket event listeners
  useEffect(() => {
    if (!executionId) return;

    joinExecutionRoom(executionId);

    function onAgentStarted(data) {
      if (data.executionId === executionId) {
        setStatus('RUNNING');
        setStartTime(Date.now());
        setError(null);
      }
    }

    function onAgentThinking(data) {
      if (data.executionId === executionId) {
        setCurrentThinkingStep(data.stepNumber);
      }
    }

    function onStepStart(data) {
      if (data.executionId === executionId) {
        setSteps((prev) => {
          const exists = prev.find((s) => s.stepId === data.stepId);
          if (exists) {
            return prev.map((s) => (s.stepId === data.stepId ? { ...s, ...data } : s));
          }
          return [...prev, data];
        });
      }
    }

    function onStepComplete(data) {
      if (data.executionId === executionId) {
        setSteps((prev) =>
          prev.map((s) =>
            s.stepId === data.stepId
              ? { ...s, ...data, status: 'SUCCESS' }
              : s
          )
        );
      }
    }

    function onStepError(data) {
      if (data.executionId === executionId) {
        setSteps((prev) =>
          prev.map((s) =>
            s.stepId === data.stepId
              ? { ...s, ...data, status: 'FAILED' }
              : s
          )
        );
      }
    }

    function onVerificationStarted(data) {
      if (data.executionId === executionId) {
        setVerificationStatus('VERIFYING');
      }
    }

    function onVerificationComplete(data) {
      if (data.executionId === executionId) {
        setVerificationReport(data.report);
        setVerificationStatus(data.report.status);
      }
    }

    function onAgentCompleted(data) {
      if (data.executionId === executionId) {
        setStatus('COMPLETED');
        setFinalResponse(data.finalResponse || '');
        if (data.verificationStatus) {
          setVerificationStatus(data.verificationStatus);
        }
      }
    }

    function onAgentFailed(data) {
      if (data.executionId === executionId) {
        setStatus('FAILED');
        setError(data.error || 'Execution encountered an error');
        if (data.verificationStatus) {
          setVerificationStatus(data.verificationStatus);
        }
      }
    }

    socket.on('agent:started', onAgentStarted);
    socket.on('agent:thinking', onAgentThinking);
    socket.on('agent:step-start', onStepStart);
    socket.on('agent:step-complete', onStepComplete);
    socket.on('agent:step-error', onStepError);
    socket.on('agent:verification-started', onVerificationStarted);
    socket.on('agent:verification-complete', onVerificationComplete);
    socket.on('agent:completed', onAgentCompleted);
    socket.on('agent:failed', onAgentFailed);

    return () => {
      socket.off('agent:started', onAgentStarted);
      socket.off('agent:thinking', onAgentThinking);
      socket.off('agent:step-start', onStepStart);
      socket.off('agent:step-complete', onStepComplete);
      socket.off('agent:step-error', onStepError);
      socket.off('agent:verification-started', onVerificationStarted);
      socket.off('agent:verification-complete', onVerificationComplete);
      socket.off('agent:completed', onAgentCompleted);
      socket.off('agent:failed', onAgentFailed);
      leaveExecutionRoom(executionId);
    };
  }, [executionId]);

  const executeTask = useCallback(async (task, testOptions = {}) => {
    // Generate UUID or let backend assign
    const newExecId = 'exec_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    
    // Reset state
    setStatus('RUNNING');
    setExecutionId(newExecId);
    setTaskText(task);
    setSteps([]);
    setCurrentThinkingStep(1);
    setVerificationStatus('PENDING');
    setVerificationReport(null);
    setFinalResponse('');
    setError(null);
    setStartTime(Date.now());
    setElapsedMs(0);

    try {
      await runAgent(task, newExecId, testOptions);
    } catch (err) {
      setStatus('FAILED');
      setError(err.response?.data?.error || err.message || 'Failed to start execution');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('IDLE');
    setExecutionId(null);
    setTaskText('');
    setSteps([]);
    setCurrentThinkingStep(null);
    setVerificationStatus('PENDING');
    setVerificationReport(null);
    setFinalResponse('');
    setError(null);
    setStartTime(null);
    setElapsedMs(0);
  }, []);

  return {
    status,
    executionId,
    taskText,
    steps,
    currentThinkingStep,
    verificationStatus,
    verificationReport,
    finalResponse,
    error,
    elapsedMs,
    executeTask,
    reset,
  };
}

export default useAgentExecution;
