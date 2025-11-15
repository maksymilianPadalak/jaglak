'use client';

import { useState } from 'react';
import PatientCard from '../components/PatientCard';

interface Patient {
  id: string;
  name: string;
  patientImage: string;
  robotId: string;
  robotImage: string;
}

// Mock data - replace with real data later
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Elder Patient 1',
    patientImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop',
    robotId: 'ROB-001',
    robotImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    name: 'Elder Patient 2',
    patientImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    robotId: 'ROB-042',
    robotImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'Elder Patient 3',
    patientImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    robotId: 'ROB-789',
    robotImage: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  },
];

export default function PatientsPage() {
  const [patients] = useState<Patient[]>(mockPatients);

  return (
    <main className="min-h-screen bg-white p-4 pt-12">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
            Patients
          </h1>
        </div>

        {/* Patients List */}
        <div className="space-y-4">
          {patients.map((patient) => (
            <div key={patient.id} className="w-full">
              <PatientCard
                patient={patient}
              />
            </div>
          ))}
        </div>

        {patients.length === 0 && (
          <div className="border-2 border-black p-8 bg-white text-center">
            <p className="text-xl font-black uppercase text-black mb-2">
              No patients found
            </p>
            <p className="text-sm font-bold text-black uppercase">
              Add patients to get started
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

