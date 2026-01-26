'use client';

// Mock CRM Actions
// Interactúa con "Base de datos" en localStorage para la demo

import { v4 as uuidv4 } from 'uuid';

const CONTACTS_KEY = 'oasis_mock_contacts';
const WORKSHOPS_KEY = 'oasis_mock_workshops';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  organization?: string; // New
  phone?: string; // New
  tags: string[];
  engagementScore: number; // 0-100
  joinedAt: string;
  // Gamification & Status
  level: 'Explorador' | 'Activo' | 'Embajador';
  xp: number;
  status: 'active' | 'inactive' | 'lead';
  lastSeen?: string;
}

export interface Workshop {
  id: string;
  title: string;
  date: string;
  capacity: number;
  enrolledCount: number;
  status: 'draft' | 'published' | 'completed';
}

// Seed Init Data if empty
const seedData = () => {
    if (typeof window === 'undefined') return;
    
    const currentData = localStorage.getItem(CONTACTS_KEY);
    let contacts: Contact[] = currentData ? JSON.parse(currentData) : [];

    // If data is missing OR too small (force expansion for demo), generate more
    if (contacts.length < 5) {
        // --- DATA GENERATOR ---
        const firstNames = ["Ana", "Carlos", "Sofia", "Miguel", "Valentina", "Javier", "Camila", "Andres", "Lucia", "Diego", "Maria", "Jose", "Fernanda", "Ricardo", "Isabella", "Daniel", "Paula", "Gabriel", "Elena", "Hugo"];
        const lastNames = ["Pérez", "Díaz", "Lagos", "Silva", "Rojas", "González", "Muñoz", "Castro", "Vargas", "Torres", "Fernandez", "Ramirez", "Soto", "Contreras", "Rodriguez", "Morales", "Herrera", "Sepulveda", "Fuentes", "Mendoza"];
        const organizations = ["TechCorp", "Fundación Educa", "Bankia", "Minera Andes", "Retail Global", "Salud Plus", "Constructora Viga", "AgroChile", "Innovación SpA", "Consultora Beta", "Fundación Summer", "Colegio San Juan", "Hospital Central"];
        const tagsList = ["vip", "donante", "taller-verano", "newsletter", "interesado-taller", "baja-interaccion", "nuevo-ingreso", "voluntario"];

        const generateContacts = (count: number): Contact[] => {
            return Array.from({ length: count }).map(() => {
                const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
                const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
                const org = organizations[Math.floor(Math.random() * organizations.length)];
                const score = Math.floor(Math.random() * 100);
                
                // Determine Level & Status based on score
                let level: Contact['level'] = 'Explorador';
                let status: Contact['status'] = 'lead';
                if (score > 80) { level = 'Embajador'; status = 'active'; }
                else if (score > 40) { level = 'Activo'; status = 'active'; }

                return {
                    id: uuidv4(),
                    firstName: fn,
                    lastName: ln,
                    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${org.toLowerCase().replace(/\s+/g, '')}.cl`,
                    role: 'Profesional',
                    organization: org,
                    phone: `+56 9 ${Math.floor(Math.random() * 90000000 + 10000000)}`,
                    tags: [
                        tagsList[Math.floor(Math.random() * tagsList.length)], 
                        Math.random() > 0.7 ? tagsList[Math.floor(Math.random() * tagsList.length)] : ''
                    ].filter(Boolean),
                    engagementScore: score,
                    joinedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
                    level,
                    xp: Math.floor(score * 15 + Math.random() * 500),
                    status,
                    lastSeen: new Date(Date.now() - Math.floor(Math.random() * 100000000)).toISOString()
                };
            });
        };

        const newContacts: Contact[] = generateContacts(50);
        
        // If it was empty, we add the fixed mock data too to ensure they exist
        if (contacts.length === 0) {
             newContacts.unshift({ 
                id: uuidv4(), 
                firstName: 'Ana', 
                lastName: 'Pérez', 
                email: 'ana.perez@techcorp.com', 
                role: 'Gerente de RRHH',
                organization: 'TechCorp',
                phone: '+56 9 1234 5678',
                tags: ['taller-verano', 'newsletter'], 
                engagementScore: 85, 
                joinedAt: new Date().toISOString(),
                level: 'Embajador',
                xp: 1250,
                status: 'active',
                lastSeen: new Date().toISOString()
            });
        }

        // Merge keeping existing ones
        contacts = [...contacts, ...newContacts];
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    }

    if (!localStorage.getItem(WORKSHOPS_KEY)) {
        const initialWorkshops: Workshop[] = [
            { id: uuidv4(), title: 'Taller de Liderazgo Joven', date: new Date(Date.now() + 86400000 * 5).toISOString(), capacity: 30, enrolledCount: 12, status: 'published' },
            { id: uuidv4(), title: 'Gestión Emocional', date: new Date(Date.now() + 86400000 * 15).toISOString(), capacity: 20, enrolledCount: 5, status: 'draft' },
        ];
        localStorage.setItem(WORKSHOPS_KEY, JSON.stringify(initialWorkshops));
    }
}


export const getContacts = async (): Promise<Contact[]> => {
    seedData();
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]');
};

export const getWorkshops = async (): Promise<Workshop[]> => {
    seedData();
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(WORKSHOPS_KEY) || '[]');
};

export const createContact = async (data: Partial<Contact>) => {
    const contacts = await getContacts();
    const newContact: Contact = {
        id: uuidv4(),
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        tags: data.tags || [],
        engagementScore: 50, // Start neutral
        joinedAt: new Date().toISOString(),
        xp: 0,
        level: 'Explorador',
        status: 'lead',
        ...data
    } as Contact;
    
    contacts.push(newContact);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    return newContact;
}

export const createWorkshop = async (data: Partial<Workshop>) => {
    const workshops = await getWorkshops();
    const newWorkshop: Workshop = {
        id: uuidv4(),
        title: data.title || 'Nuevo Taller',
        date: data.date || new Date().toISOString(),
        capacity: data.capacity || 20,
        enrolledCount: 0,
        status: 'draft',
        ...data
    } as Workshop;

    workshops.push(newWorkshop);
    localStorage.setItem(WORKSHOPS_KEY, JSON.stringify(workshops));
    return newWorkshop;
}
