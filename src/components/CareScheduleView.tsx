import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Droplets, 
  Sparkles, 
  Scissors, 
  AlertTriangle,
  Plus,
  Bell,
  BellRing,
  ShieldAlert,
  Info
} from 'lucide-react';
import { CareTask } from '../types';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission, 
  pushOverduePlantNotification 
} from '../utils/notifications';

interface CareScheduleViewProps {
  tasks: CareTask[];
  onCompleteTask: (taskId: string) => void;
  onPostponeTask: (taskId: string) => void;
  onMarkOverdue?: (taskId: string) => void;
  onOpenLogCareModal: () => void;
}

export const CareScheduleView: React.FC<CareScheduleViewProps> = ({
  tasks,
  onCompleteTask,
  onPostponeTask,
  onMarkOverdue,
  onOpenLogCareModal
}) => {
  const [taskFilter, setTaskFilter] = useState<'all' | 'overdue' | 'today' | 'upcoming'>('all');
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [lastNotifMessage, setLastNotifMessage] = useState<string | null>(null);

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  // Request browser notification permission
  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      setLastNotifMessage('Browser notifications enabled! You will receive alerts when care tasks become overdue.');
      setTimeout(() => setLastNotifMessage(null), 5000);
    } else if (perm === 'denied') {
      setLastNotifMessage('Notification permission denied in browser settings.');
      setTimeout(() => setLastNotifMessage(null), 5000);
    }
  };

  // Push notification for a single overdue task
  const handleTriggerTaskNotification = async (task: CareTask) => {
    const sent = await pushOverduePlantNotification(task.plantName, task.taskType, task.dueLabel);
    if (sent) {
      setLastNotifMessage(`Sent browser notification alert for ${task.plantName}!`);
    } else {
      setLastNotifMessage(`Could not send notification. Permission status: ${notifPermission}`);
    }
    setTimeout(() => setLastNotifMessage(null), 5000);
  };

  // Mark task as overdue & trigger browser notification
  const handleMarkAsOverdue = async (task: CareTask) => {
    if (onMarkOverdue) {
      onMarkOverdue(task.id);
    }
    await handleTriggerTaskNotification(task);
  };

  // Push notifications for all overdue tasks
  const handlePushAllOverdueAlerts = async () => {
    const overdueTasks = tasks.filter(t => t.overdue && !t.isCompleted);
    if (overdueTasks.length === 0) {
      setLastNotifMessage('No overdue tasks found to send alerts for.');
      setTimeout(() => setLastNotifMessage(null), 4000);
      return;
    }

    let count = 0;
    for (const t of overdueTasks) {
      const sent = await pushOverduePlantNotification(t.plantName, t.taskType, t.dueLabel);
      if (sent) count++;
    }

    setLastNotifMessage(`Dispatched ${count} browser alert notification(s) for overdue plants.`);
    setTimeout(() => setLastNotifMessage(null), 5000);
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'overdue') return t.overdue && !t.isCompleted;
    if (taskFilter === 'today') return t.dueLabel.toLowerCase().includes('today') && !t.isCompleted;
    if (taskFilter === 'upcoming') return !t.overdue && !t.isCompleted;
    return true;
  });

  const overdueCount = tasks.filter(t => t.overdue && !t.isCompleted).length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="neo-card p-5 lg:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Calendar className="text-emerald-400" size={22} />
            <span>Care Task Schedule</span>
            <span className="text-xs neo-badge text-emerald-300 font-extrabold px-3 py-1 rounded-xl">
              {tasks.filter(t => !t.isCompleted).length} Pending
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Automated botanical schedule with Browser Notification API integration</p>
        </div>

        <button
          onClick={onOpenLogCareModal}
          className="neo-btn-emerald px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Log Unscheduled Action</span>
        </button>
      </div>

      {/* Browser Notification API Status Panel */}
      <div className="neo-card p-4 lg:p-5 rounded-2xl space-y-3 border-l-4 border-l-emerald-400">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 neo-inset text-emerald-400 rounded-xl">
              <BellRing size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Browser Desktop Notifications
                </h3>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg neo-badge ${
                  notifPermission === 'granted' ? 'text-emerald-400' :
                  notifPermission === 'denied' ? 'text-rose-400' : 'text-amber-300'
                }`}>
                  {notifPermission === 'granted' ? '✓ Granted' :
                   notifPermission === 'denied' ? '✕ Blocked' : '⚡ Permission Prompt'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically pushes native browser notifications whenever a plant is marked overdue.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {notifPermission !== 'granted' && isNotificationSupported() && (
              <button
                onClick={handleEnableNotifications}
                className="neo-btn px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-1.5"
              >
                <Bell size={14} />
                <span>Enable Alerts</span>
              </button>
            )}

            {overdueCount > 0 && (
              <button
                onClick={handlePushAllOverdueAlerts}
                className="neo-btn-rose px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                title="Send browser notifications for all overdue plant tasks"
              >
                <ShieldAlert size={14} />
                <span>Push Overdue Alerts ({overdueCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Message Toast */}
        {lastNotifMessage && (
          <div className="p-3 neo-badge rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <Info size={15} className="text-emerald-400 flex-shrink-0" />
            <span>{lastNotifMessage}</span>
          </div>
        )}
      </div>

      {/* Task Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Tasks' },
          { id: 'overdue', label: `Overdue Urgent (${overdueCount})` },
          { id: 'today', label: 'Due Today' },
          { id: 'upcoming', label: 'Upcoming' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setTaskFilter(f.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              taskFilter === f.id
                ? 'neo-active text-emerald-300'
                : 'neo-btn text-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3.5">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center neo-inset rounded-2xl text-slate-400 text-xs font-medium">
            No care tasks found for this filter view. All plants are currently satisfied!
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`
                p-4 lg:p-5 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4
                ${task.isCompleted 
                  ? 'neo-card opacity-50' 
                  : task.overdue 
                    ? 'neo-card-rose' 
                    : 'neo-card'}
              `}
            >
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-2xl neo-inset ${
                  task.taskType === 'Water' ? 'text-blue-400' :
                  task.taskType === 'Fertilize' ? 'text-amber-300' :
                  'text-teal-300'
                }`}>
                  {task.taskType === 'Water' ? <Droplets size={20} /> :
                   task.taskType === 'Fertilize' ? <Sparkles size={20} /> : <Scissors size={20} />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{task.plantName}</h4>
                    <span className="text-xs text-emerald-400 font-bold">• {task.taskType}</span>
                    {task.overdue && !task.isCompleted && (
                      <span className="text-[10px] font-extrabold text-rose-300 neo-badge px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <AlertTriangle size={11} /> OVERDUE
                      </span>
                    )}
                  </div>

                  <p className={`text-xs mt-1 flex items-center gap-1.5 ${
                    task.overdue ? 'text-rose-400 font-bold' : 'text-slate-400 font-medium'
                  }`}>
                    {task.overdue && <AlertTriangle size={13} className="text-rose-400" />}
                    <span>Due: {task.dueLabel} ({task.dueDate})</span>
                  </p>
                </div>
              </div>

              {/* Task Controls */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                {!task.isCompleted ? (
                  <>
                    {!task.overdue && (
                      <button
                        onClick={() => handleMarkAsOverdue(task)}
                        className="neo-btn px-3 py-2 rounded-xl text-rose-300 hover:text-rose-100 text-xs font-bold transition-all flex items-center gap-1"
                        title="Mark task as overdue and push browser notification"
                      >
                        <AlertTriangle size={13} />
                        <span>Mark Overdue</span>
                      </button>
                    )}

                    {task.overdue && (
                      <button
                        onClick={() => handleTriggerTaskNotification(task)}
                        className="neo-btn-rose px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                        title="Trigger browser notification alert"
                      >
                        <Bell size={13} />
                        <span>Push Alert</span>
                      </button>
                    )}

                    <button
                      onClick={() => onPostponeTask(task.id)}
                      className="neo-btn px-3.5 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-bold transition-all"
                    >
                      Postpone +1d
                    </button>

                    <button
                      onClick={() => onCompleteTask(task.id)}
                      className="neo-btn-emerald px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={15} />
                      <span>Complete</span>
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 neo-badge px-3 py-1.5 rounded-xl">
                    <CheckCircle2 size={14} /> Completed
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

