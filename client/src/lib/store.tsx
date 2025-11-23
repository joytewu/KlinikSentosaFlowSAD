import React, { createContext, useContext, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { addDays, format } from 'date-fns';

// Types
export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'cashier' | null;

export interface Patient {
  id: string;
  name: string;
  mrNumber: string; // Medical Record Number
  age: number;
  phone: string;
  address: string;
  registeredAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface Diagnosis {
  notes: string;
  prescriptions: {
    medicineId: string;
    medicineName: string;
    dosage: string; // "3x1", "2x1", etc.
    quantity: number;
    price: number;
  }[];
}

export interface Visit {
  id: string;
  patientId: string;
  doctorName: string;
  status: 'waiting' | 'in-consultation' | 'payment-pending' | 'completed';
  complaint: string;
  diagnosis?: Diagnosis;
  totalCost: number;
  paymentMethod?: 'cash' | 'transfer';
  date: string;
}

interface ClinicContextType {
  currentUser: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
  
  patients: Patient[];
  visits: Visit[];
  medicines: Medicine[];
  
  registerPatient: (patient: Omit<Patient, 'id' | 'mrNumber' | 'registeredAt'>, isNew: boolean, existingId?: string) => string;
  createVisit: (patientId: string, complaint: string) => void;
  updateVisitStatus: (visitId: string, status: Visit['status']) => void;
  submitDiagnosis: (visitId: string, diagnosis: Diagnosis) => void;
  processPayment: (visitId: string, method: 'cash' | 'transfer') => void;
  
  getQueue: (status: Visit['status']) => (Visit & { patient: Patient })[];
  getRevenue: () => { total: number; today: number; byMethod: { cash: number; transfer: number } };
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

// Mock Initial Data
const INITIAL_MEDICINES: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', price: 5000, stock: 100 },
  { id: '2', name: 'Amoxicillin 500mg', price: 12000, stock: 50 },
  { id: '3', name: 'Vitamin C', price: 3000, stock: 200 },
  { id: '4', name: 'Ibuprofen 400mg', price: 8000, stock: 80 },
  { id: '5', name: 'OBH Sirup', price: 25000, stock: 30 },
];

const INITIAL_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Budi Santoso', mrNumber: 'RM-001', age: 45, phone: '08123456789', address: 'Jl. Merdeka No. 1', registeredAt: '2024-01-01' },
  { id: 'p2', name: 'Siti Aminah', mrNumber: 'RM-002', age: 32, phone: '08198765432', address: 'Jl. Mawar No. 12', registeredAt: '2024-02-15' },
];

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserRole>(null);
  
  // Initialize state from localStorage if available
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('clinic_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [medicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  
  const [visits, setVisits] = useState<Visit[]>(() => {
    const saved = localStorage.getItem('clinic_visits');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('clinic_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('clinic_visits', JSON.stringify(visits));
  }, [visits]);

  const login = (role: UserRole) => setCurrentUser(role);
  const logout = () => setCurrentUser(null);

  const registerPatient = (data: Omit<Patient, 'id' | 'mrNumber' | 'registeredAt'>, isNew: boolean, existingId?: string) => {
    let patientId = existingId;
    
    if (isNew || !existingId) {
      const newPatient: Patient = {
        ...data,
        id: nanoid(),
        mrNumber: `RM-${(patients.length + 1).toString().padStart(3, '0')}`,
        registeredAt: new Date().toISOString(),
      };
      setPatients([...patients, newPatient]);
      patientId = newPatient.id;
    }
    
    return patientId!;
  };

  const createVisit = (patientId: string, complaint: string) => {
    const newVisit: Visit = {
      id: nanoid(),
      patientId,
      doctorName: 'Dr. Sentosa',
      status: 'waiting',
      complaint,
      totalCost: 0,
      date: new Date().toISOString(),
    };
    setVisits([...visits, newVisit]);
  };

  const updateVisitStatus = (visitId: string, status: Visit['status']) => {
    setVisits(visits.map(v => v.id === visitId ? { ...v, status } : v));
  };

  const submitDiagnosis = (visitId: string, diagnosis: Diagnosis) => {
    const totalCost = diagnosis.prescriptions.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) + 50000; // + Consultation Fee
    
    setVisits(visits.map(v => v.id === visitId ? {
      ...v,
      diagnosis,
      totalCost,
      status: 'payment-pending'
    } : v));
  };

  const processPayment = (visitId: string, method: 'cash' | 'transfer') => {
    setVisits(visits.map(v => v.id === visitId ? {
      ...v,
      paymentMethod: method,
      status: 'completed'
    } : v));
  };

  const getQueue = (status: Visit['status']) => {
    return visits
      .filter(v => v.status === status)
      .map(v => ({
        ...v,
        patient: patients.find(p => p.id === v.patientId)!
      }));
  };

  const getRevenue = () => {
    const completed = visits.filter(v => v.status === 'completed');
    const total = completed.reduce((acc, curr) => acc + curr.totalCost, 0);
    const today = completed
      .filter(v => new Date(v.date).toDateString() === new Date().toDateString())
      .reduce((acc, curr) => acc + curr.totalCost, 0);
    
    const cash = completed.filter(v => v.paymentMethod === 'cash').reduce((acc, curr) => acc + curr.totalCost, 0);
    const transfer = completed.filter(v => v.paymentMethod === 'transfer').reduce((acc, curr) => acc + curr.totalCost, 0);

    return { total, today, byMethod: { cash, transfer } };
  };

  return (
    <ClinicContext.Provider value={{
      currentUser, login, logout,
      patients, visits, medicines,
      registerPatient, createVisit, updateVisitStatus, submitDiagnosis, processPayment,
      getQueue, getRevenue
    }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) throw new Error('useClinic must be used within a ClinicProvider');
  return context;
}
