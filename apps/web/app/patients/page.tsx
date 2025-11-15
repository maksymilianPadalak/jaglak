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
    name: 'Janusz',
    patientImage: '/Janusz.png',
    robotId: 'ROB-001',
    robotImage: '/RobotForJanusz.png',
  },
  {
    id: '2',
    name: 'Maria Kowalska',
    patientImage: '/grandma.jpg',
    robotId: 'ROB-042',
    robotImage: '/robot.jpg',
  },
  {
    id: '3',
    name: 'Helena Nowak',
    patientImage: '/grandma2.png',
    robotId: 'ROB-789',
    robotImage: '/robot2.jpg',
  },
];

export default function PatientsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [patients] = useState<Patient[]>(mockPatients);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setIsAuthenticated(true);
      setPasswordError(null);
    } else {
      setPasswordError('Incorrect password');
      setPassword('');
    }
  };

  // Password protection - show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white p-4 pt-12">
        <div className="max-w-md mx-auto">
          <div className="border-2 border-black mb-4 p-6 bg-white">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 text-black">
              Admin Access
            </h1>
            <p className="text-sm font-bold text-black uppercase mb-6">
              Enter password to continue
            </p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-black uppercase text-black mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter password"
                  autoFocus
                />
              </div>
              {passwordError && (
                <div className="border-2 border-black bg-black text-white p-3">
                  <p className="text-sm font-bold uppercase">{passwordError}</p>
                </div>
              )}
              <button
                type="submit"
                className="w-full border-2 border-black bg-black text-white px-6 py-3 font-black text-sm uppercase hover:bg-white hover:text-black transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-4 pt-12">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
            Patients
          </h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="border-2 border-black px-4 py-2 font-black text-sm uppercase transition-colors bg-white text-black hover:bg-black hover:text-white"
          >
            Logout
          </button>
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

