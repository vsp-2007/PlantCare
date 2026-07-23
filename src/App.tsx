import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MyPlantsView } from './components/MyPlantsView';
import { IdentificationView } from './components/IdentificationView';
import { CareScheduleView } from './components/CareScheduleView';
import { ChatDoctorView } from './components/ChatDoctorView';
import { SettingsView } from './components/SettingsView';
import { SupportView } from './components/SupportView';
import { AddPlantModal } from './components/Modals/AddPlantModal';
import { LogCareModal } from './components/Modals/LogCareModal';
import { EmergencyRescueModal } from './components/Modals/EmergencyRescueModal';
import { DeletePlantModal } from './components/Modals/DeletePlantModal';

import { Plant, CareAlert, CareLogEntry, CareTask, SpeciesMatch } from './types';
import { 
  getStoredPlants, 
  saveStoredPlants, 
  getStoredAlerts, 
  saveStoredAlerts, 
  getStoredLogs, 
  saveStoredLogs, 
  getStoredTasks, 
  saveStoredTasks,
  resetAllStorage 
} from './utils/storage';

export function App() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [plants, setPlants] = useState<Plant[]>(getStoredPlants());
  const [selectedPlant, setSelectedPlant] = useState<Plant>(plants[0] || getStoredPlants()[0]);
  const [alerts, setAlerts] = useState<CareAlert[]>(getStoredAlerts());
  const [logs, setLogs] = useState<CareLogEntry[]>(getStoredLogs(selectedPlant.id));
  const [tasks, setTasks] = useState<CareTask[]>(getStoredTasks());

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogCareModalOpen, setIsLogCareModalOpen] = useState(false);
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync plants to storage
  useEffect(() => {
    saveStoredPlants(plants);
  }, [plants]);

  // Sync logs when selectedPlant changes
  useEffect(() => {
    setLogs(getStoredLogs(selectedPlant.id));
  }, [selectedPlant.id]);

  // Handle Add Plant
  const handleAddPlant = (newPlant: Plant) => {
    const updated = [newPlant, ...plants];
    setPlants(updated);
    setSelectedPlant(newPlant);

    // Create a new task for this plant
    const newTask: CareTask = {
      id: `task-${Date.now()}`,
      plantId: newPlant.id,
      plantName: newPlant.nickname,
      taskType: 'Water',
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      dueLabel: 'In 5 days',
      isCompleted: false,
      overdue: false
    };
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveStoredTasks(updatedTasks);
  };

  // Handle Log Care Action
  const handleAddLog = (logEntry: CareLogEntry) => {
    const updatedLogs = [logEntry, ...logs];
    setLogs(updatedLogs);
    saveStoredLogs(selectedPlant.id, updatedLogs);

    // Update plant stats (increase watersCount or healthScore)
    const updatedPlants = plants.map((p) => {
      if (p.id === selectedPlant.id) {
        return {
          ...p,
          healthScore: Math.min(100, p.healthScore + 5),
          status: 'Healthy' as const,
          watersCount: p.watersCount + 1,
          nextCareDue: 'Water in 7 days',
          nextCareDays: 7
        };
      }
      return p;
    });

    setPlants(updatedPlants);
    setSelectedPlant(prev => ({
      ...prev,
      healthScore: Math.min(100, prev.healthScore + 5),
      status: 'Healthy',
      watersCount: prev.watersCount + 1,
      nextCareDue: 'Water in 7 days',
      nextCareDays: 7
    }));
  };

  // Quick Water action from My Garden
  const handleQuickWater = (plantId: string) => {
    const targetPlant = plants.find(p => p.id === plantId);
    if (!targetPlant) return;

    const newLog: CareLogEntry = {
      id: `log-${Date.now()}`,
      plantId,
      type: 'Watered',
      title: 'Watered (Quick Action)',
      timestamp: 'Just now',
      note: '500ml filtered water added via quick action.',
      badgeText: 'Routine'
    };

    const currentLogs = getStoredLogs(plantId);
    saveStoredLogs(plantId, [newLog, ...currentLogs]);

    const updatedPlants = plants.map((p) => {
      if (p.id === plantId) {
        return {
          ...p,
          healthScore: Math.min(100, p.healthScore + 5),
          status: 'Healthy' as const,
          nextCareDue: 'Water in 7 days',
          nextCareDays: 7
        };
      }
      return p;
    });

    setPlants(updatedPlants);
    if (selectedPlant.id === plantId) {
      setLogs([newLog, ...currentLogs]);
      setSelectedPlant(prev => ({ ...prev, healthScore: Math.min(100, prev.healthScore + 5), status: 'Healthy' }));
    }
  };

  // Resolve an alert
  const handleResolveAlert = (alertId: string) => {
    const updatedAlerts = alerts.filter(a => a.id !== alertId);
    setAlerts(updatedAlerts);
    saveStoredAlerts(updatedAlerts);
  };

  // Complete Care Schedule Task
  const handleCompleteTask = (taskId: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, isCompleted: true, overdue: false };
      }
      return t;
    });
    setTasks(updatedTasks);
    saveStoredTasks(updatedTasks);
  };

  // Postpone Care Schedule Task
  const handlePostponeTask = (taskId: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, dueLabel: 'Tomorrow (+1d)', overdue: false };
      }
      return t;
    });
    setTasks(updatedTasks);
    saveStoredTasks(updatedTasks);
  };

  // Mark Care Schedule Task as Overdue
  const handleMarkTaskOverdue = (taskId: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, overdue: true, dueLabel: 'Overdue Urgent' };
      }
      return t;
    });
    setTasks(updatedTasks);
    saveStoredTasks(updatedTasks);
  };

  // Update plant health score
  const handleUpdateHealthScore = (plantId: string, newScore: number) => {
    const updated = plants.map(p => {
      if (p.id === plantId) {
        const updatedPlant = {
          ...p,
          healthScore: newScore,
          status: (newScore >= 80 ? 'Healthy' : newScore >= 50 ? 'Stable' : 'Warning') as any
        };
        if (selectedPlant.id === plantId) {
          setSelectedPlant(updatedPlant);
        }
        return updatedPlant;
      }
      return p;
    });
    setPlants(updated);
    saveStoredPlants(updated);
  };

  // Confirm Plant Delete
  const handleConfirmDelete = () => {
    if (!plantToDelete) return;

    const updated = plants.filter(p => p.id !== plantToDelete.id);
    setPlants(updated);

    if (selectedPlant.id === plantToDelete.id && updated.length > 0) {
      setSelectedPlant(updated[0]);
    }
    setPlantToDelete(null);
  };

  // Add specimen from AI Identification match
  const handleAddFromIdentification = (match: SpeciesMatch) => {
    const newPlant: Plant = {
      id: `plant-${Date.now()}`,
      nickname: match.commonName || match.species,
      species: match.species,
      scientificName: match.species,
      location: 'Indoor display',
      acquiredDate: new Date().toISOString().split('T')[0],
      healthScore: 95,
      survivalScore: 95,
      nextCareDue: 'Water in 6 days',
      nextCareDays: 6,
      waterRequirement: 'In 6 days',
      sunRequirement: match.careInfo?.light || 'Indirect',
      status: 'Healthy',
      photoUrl: match.photoUrl,
      watersCount: 1,
      fertsCount: 0,
      daysTracked: 1
    };

    handleAddPlant(newPlant);
    setActiveView('dashboard');
  };

  // Reset database to default
  const handleResetData = () => {
    resetAllStorage();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        alerts={alerts}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenRescueModal={() => setIsRescueModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Body Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex gap-0 lg:gap-6">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onOpenRescueModal={() => setIsRescueModalOpen(true)}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 lg:p-8 min-w-0">
          {activeView === 'dashboard' && (
            <DashboardView
              plants={plants}
              selectedPlant={selectedPlant}
              setSelectedPlant={setSelectedPlant}
              alerts={alerts}
              logs={logs}
              onOpenLogCareModal={() => setIsLogCareModalOpen(true)}
              onOpenRescueModal={() => setIsRescueModalOpen(true)}
              onNavigateToChat={() => setActiveView('chat')}
              onResolveAlert={handleResolveAlert}
              onUpdateHealthScore={handleUpdateHealthScore}
            />
          )}

          {activeView === 'garden' && (
            <MyPlantsView
              plants={plants}
              onSelectPlant={(p) => {
                setSelectedPlant(p);
                setActiveView('dashboard');
              }}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenDeleteModal={(p) => {
                setPlantToDelete(p);
                setIsDeleteModalOpen(true);
              }}
              onQuickWater={handleQuickWater}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeView === 'identify' && (
            <IdentificationView
              onAddFromIdentification={handleAddFromIdentification}
            />
          )}

          {activeView === 'schedule' && (
            <CareScheduleView
              tasks={tasks}
              onCompleteTask={handleCompleteTask}
              onPostponeTask={handlePostponeTask}
              onMarkOverdue={handleMarkTaskOverdue}
              onOpenLogCareModal={() => setIsLogCareModalOpen(true)}
            />
          )}

          {activeView === 'chat' && (
            <ChatDoctorView
              plants={plants}
              selectedPlant={selectedPlant}
              onSelectPlant={setSelectedPlant}
              onOpenRescueModal={() => setIsRescueModalOpen(true)}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              plants={plants}
              onResetData={handleResetData}
              onOpenDeleteModal={(p) => {
                setPlantToDelete(p);
                setIsDeleteModalOpen(true);
              }}
            />
          )}

          {activeView === 'support' && (
            <SupportView />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddPlantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPlant={handleAddPlant}
      />

      <LogCareModal
        isOpen={isLogCareModalOpen}
        onClose={() => setIsLogCareModalOpen(false)}
        plantName={selectedPlant.nickname}
        plantId={selectedPlant.id}
        onAddLog={handleAddLog}
      />

      <EmergencyRescueModal
        isOpen={isRescueModalOpen}
        onClose={() => setIsRescueModalOpen(false)}
        plantName={selectedPlant.nickname}
        onResolveRescue={() => {
          // Resolve any emergency alert for this plant
          setAlerts(prev => prev.filter(a => a.plantId !== selectedPlant.id));
        }}
      />

      <DeletePlantModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPlantToDelete(null);
        }}
        plantName={plantToDelete?.nickname || 'Plant'}
        onConfirmDelete={handleConfirmDelete}
      />

    </div>
  );
}

export default App;
