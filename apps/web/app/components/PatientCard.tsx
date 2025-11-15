'use client';

import { useRouter } from 'next/navigation';
import { User, Bot } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  patientImage: string;
  robotId: string;
  robotImage: string;
}

interface PatientCardProps {
  patient: Patient;
}

export default function PatientCard({ patient }: PatientCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/patients/${patient.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="border-2 border-black bg-white cursor-pointer hover:bg-black hover:text-white transition-colors w-full"
    >
      <div className="p-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          {/* Patient Name */}
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 flex-shrink-0" />
            <h3 className="text-xl font-black uppercase">{patient.name}</h3>
          </div>
          {/* Robot ID */}
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase opacity-70">Robot ID</span>
              <span className="text-lg font-black uppercase font-mono">{patient.robotId}</span>
            </div>
          </div>
        </div>

        {/* Images Section - Aligned in one line */}
        <div className="flex gap-4">
          <div className="flex-1 border-2 border-current">
            <img
              src={patient.patientImage}
              alt={patient.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Patient+Image';
              }}
            />
          </div>
          <div className="flex-1 border-2 border-current">
            <img
              src={patient.robotImage}
              alt={`Robot ${patient.robotId}`}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Robot+Image';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

