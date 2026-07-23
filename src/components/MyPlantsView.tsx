import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Droplets, 
  Sun, 
  MapPin, 
  Trash2, 
  Heart, 
  Filter, 
  ShieldAlert, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Plant } from '../types';

interface MyPlantsViewProps {
  plants: Plant[];
  onSelectPlant: (p: Plant) => void;
  onOpenAddModal: () => void;
  onOpenDeleteModal: (p: Plant) => void;
  onQuickWater: (plantId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const MyPlantsView: React.FC<MyPlantsViewProps> = ({
  plants,
  onSelectPlant,
  onOpenAddModal,
  onOpenDeleteModal,
  onQuickWater,
  searchQuery,
  setSearchQuery
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredPlants = plants.filter((p) => {
    const matchesSearch = p.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'thirsty') return matchesSearch && (p.status === 'Thirsty' || p.status === 'Warning');
    if (filterStatus === 'healthy') return matchesSearch && (p.status === 'Healthy' || p.status === 'Growing' || p.status === 'Stable');
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 neo-card p-5 lg:p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <span>My Garden Collection</span>
            <span className="text-xs neo-badge text-emerald-300 font-extrabold px-3 py-1 rounded-xl">
              {plants.length} Specimens
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage, inspect, and track watering schedules for all your indoor & outdoor plants</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Plant Action */}
          <button
            onClick={onOpenAddModal}
            className="neo-btn-emerald flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add New Plant</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 neo-inset p-3.5 rounded-2xl">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-emerald-400" />
          <input
            type="text"
            placeholder="Search by nickname, species, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full neo-input rounded-xl pl-10 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-emerald-400" />
          <span className="text-xs text-slate-300 font-bold">Filter:</span>
          {['all', 'healthy', 'thirsty'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterStatus === st 
                  ? 'neo-active text-emerald-300' 
                  : 'neo-btn text-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Plant Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlants.map((plant) => (
          <div
            key={plant.id}
            className="neo-card p-4 rounded-2xl group flex flex-col justify-between"
          >
            <div>
              {/* Photo Banner */}
              <div className="relative h-48 w-full overflow-hidden rounded-xl neo-inset p-1">
                <img
                  src={plant.photoUrl}
                  alt={plant.nickname}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Status Badge */}
                <span className={`
                  absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider neo-badge
                  ${plant.status === 'Healthy' || plant.status === 'Growing'
                    ? 'text-emerald-300'
                    : plant.status === 'Thirsty' || plant.status === 'Warning'
                      ? 'text-rose-300'
                      : 'text-teal-300'}
                `}>
                  {plant.status}
                </span>

                {/* Health % Tag */}
                <span className="absolute top-3 right-3 neo-badge text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <Heart size={12} className="text-emerald-400" /> {plant.healthScore}%
                </span>
              </div>

              {/* Plant Info */}
              <div className="p-2 pt-4 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {plant.nickname}
                  </h3>
                  <p className="text-xs text-slate-400 italic font-serif">{plant.species}</p>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{plant.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Sun size={14} className="text-amber-300 flex-shrink-0" />
                    <span>{plant.sunRequirement} Sunlight</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Droplets size={14} className="text-blue-400 flex-shrink-0" />
                    <span className="font-bold text-teal-300">{plant.nextCareDue}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2 mt-3">
              <button
                onClick={() => onSelectPlant(plant)}
                className="flex-1 neo-btn py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>View Specimen</span>
                <ExternalLink size={13} />
              </button>

              <button
                onClick={() => onQuickWater(plant.id)}
                className="neo-btn p-2 rounded-xl text-blue-400"
                title="Quick Water (+1 Log)"
              >
                <Droplets size={16} />
              </button>

              <button
                onClick={() => onOpenDeleteModal(plant)}
                className="neo-btn p-2 rounded-xl text-rose-400"
                title="Remove Plant"
              >
                <Trash2 size={16} />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
