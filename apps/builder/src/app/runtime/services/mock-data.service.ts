import { Injectable, computed, signal } from '@angular/core';
import type { Signal } from '@angular/core';
import { RuntimeEngineService } from './runtime-engine.service';

// ─────────────────────────────────────────────────────────────────────────────
// MockDataService
//
// Generates realistic, deterministic Hexaware HR data using a seeded PRNG.
// All data is generated lazily on first access and memoized in signals.
// Supports virtual-scroll-friendly page-slicing via getPage().
// ─────────────────────────────────────────────────────────────────────────────

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

function createRng(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Reference data ────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  'Engineering', 'Product Management', 'Design', 'Data Science',
  'Quality Assurance', 'DevOps', 'Cloud Infrastructure', 'Cybersecurity',
  'Human Resources', 'Finance & Accounts', 'Legal & Compliance', 'Marketing',
  'Sales', 'Business Development', 'Customer Success', 'Operations',
  'Supply Chain', 'Procurement', 'IT Support', 'Analytics & Insights',
  'Training & Development', 'Corporate Communications', 'Administration',
  'Research & Innovation', 'Executive Office',
];

const LOCATIONS = ['Mumbai', 'Chennai', 'Bangalore', 'Pune', 'Hyderabad', 'Remote', 'Noida', 'Kolkata'];

const DESIGNATIONS: Record<string, string[]> = {
  Engineering: ['Software Engineer', 'Senior Software Engineer', 'Lead Engineer', 'Principal Engineer', 'Staff Engineer'],
  'Product Management': ['Product Manager', 'Senior PM', 'Product Lead', 'Group PM', 'VP of Product'],
  Design: ['UI Designer', 'UX Designer', 'Senior Designer', 'Design Lead', 'Head of Design'],
  'Data Science': ['Data Analyst', 'Data Scientist', 'ML Engineer', 'Senior Data Scientist', 'Head of Data'],
  'Quality Assurance': ['QA Engineer', 'Senior QA', 'QA Lead', 'Automation Engineer', 'QA Manager'],
  DevOps: ['DevOps Engineer', 'Site Reliability Engineer', 'Platform Engineer', 'DevOps Lead', 'Head of DevOps'],
  'Cloud Infrastructure': ['Cloud Engineer', 'Cloud Architect', 'Senior Cloud Engineer', 'Infrastructure Lead', 'CTO'],
  Cybersecurity: ['Security Analyst', 'Penetration Tester', 'Security Engineer', 'CISO', 'Security Lead'],
  'Human Resources': ['HR Executive', 'HR Business Partner', 'Talent Acquisition Lead', 'HRBP Manager', 'CHRO'],
  'Finance & Accounts': ['Finance Executive', 'Senior Accountant', 'Finance Manager', 'CFO', 'Finance Analyst'],
};

const FIRST_NAMES_MALE = [
  'Rahul', 'Arjun', 'Amit', 'Deepak', 'Raj', 'Vikas', 'Sunil', 'Manoj',
  'Sanjay', 'Rohit', 'Karan', 'Akash', 'Ankit', 'Vivek', 'Nitin', 'Gaurav',
  'Pavan', 'Siddharth', 'Aditya', 'Ravi', 'Pradeep', 'Ajay', 'Abhishek', 'Rajan',
  'Sachin', 'Mohit', 'Prakash', 'Naveen', 'Dinesh', 'Krishnan', 'Suresh', 'Balu',
];

const FIRST_NAMES_FEMALE = [
  'Priya', 'Ananya', 'Sneha', 'Pooja', 'Kavitha', 'Divya', 'Meera', 'Sunita',
  'Rekha', 'Anjali', 'Shruti', 'Nisha', 'Ritu', 'Pallavi', 'Swati', 'Bhavana',
  'Lavanya', 'Rashmi', 'Padma', 'Usha', 'Archana', 'Geeta', 'Lalitha', 'Shobha',
  'Deepa', 'Asha', 'Kamala', 'Indira', 'Sumitha', 'Vimala', 'Geetha', 'Revathi',
];

const LAST_NAMES = [
  'Sharma', 'Mehta', 'Patel', 'Kumar', 'Singh', 'Rao', 'Nair', 'Pillai',
  'Iyer', 'Menon', 'Reddy', 'Gupta', 'Shah', 'Joshi', 'Verma', 'Mishra',
  'Tiwari', 'Pandey', 'Chauhan', 'Yadav', 'Sinha', 'Aggarwal', 'Bose', 'Das',
  'Bhat', 'Naik', 'Hegde', 'Kamath', 'Rajan', 'Krishnan', 'Subramaniam', 'Venkat',
];

const SALARY_BANDS = ['L1', 'L2', 'L3', 'L4', 'L5'];

const LEAVE_TYPES = ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'];

const TICKET_CATEGORIES = ['Hardware', 'Software', 'Network / VPN', 'Access & Permissions', 'Email', 'Other'];

const ASSET_TYPES = ['Laptop', 'Mobile Phone', 'Monitor', 'Headset', 'Standing Desk', 'Ergonomic Chair', 'Keyboard', 'Mouse'];

const RECRUITMENT_STAGES = ['Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'Rejected'];

const JOB_ROLES = [
  'Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer',
  'DevOps Engineer', 'QA Engineer', 'Business Analyst', 'Cloud Architect',
  'Security Engineer', 'Mobile Developer', 'Frontend Developer', 'Backend Developer',
];

const TRAINING_PROGRAMS = [
  'AWS Solutions Architect', 'Agile & Scrum Fundamentals', 'Leadership Excellence',
  'Data Analytics with Python', 'Angular Advanced', 'Kubernetes & Docker',
  'Cybersecurity Essentials', 'TOGAF Architecture', 'PMP Certification Prep',
  'Communication Skills for Leaders', 'Machine Learning with TensorFlow',
  'React & TypeScript Mastery', 'Corporate Finance for Non-Finance',
];

function pickRng<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function dateOffsetDays(base: Date, rng: () => number, minDays: number, maxDays: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() - Math.floor(rng() * (maxDays - minDays) + minDays));
  return d.toISOString().slice(0, 10);
}

function zeroPad(n: number, len: number): string {
  return String(n).padStart(len, '0');
}

// ── Employee record ───────────────────────────────────────────────────────────

export interface EmployeeRecord {
  employeeId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  location: string;
  joinDate: string;
  joinMonth: string;
  status: 'Active' | 'On Leave' | 'Inactive' | 'New Joiner';
  salaryBand: string;
  employmentType: string;
  gender: 'M' | 'F';
  avatar: null;
  dob: string;
}

// ── Other records ─────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  shift: string;
  workMode: 'Office' | 'WFH' | 'Field';
  status: 'Present' | 'Absent' | 'Half Day';
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  submittedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approver: string;
  reason: string;
}

export interface TicketRecord {
  ticketId: string;
  subject: string;
  category: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  raisedBy: string;
  assignedTo: string;
  createdDate: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
}

export interface AssetRecord {
  assetId: string;
  assetType: string;
  serialNumber: string;
  assignedTo: string;
  employeeId: string;
  assignedDate: string;
  status: 'Assigned' | 'Available' | 'Under Repair' | 'Retired';
  location: string;
}

export interface ExpenseRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  travelFrom: string;
  travelTo: string;
  startDate: string;
  endDate: string;
  purpose: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  submittedDate: string;
}

export interface TrainingRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  programName: string;
  provider: string;
  startDate: string;
  endDate: string;
  mode: 'Online' | 'Classroom' | 'Hybrid';
  status: 'Registered' | 'In Progress' | 'Completed' | 'Cancelled';
  score?: number;
}

export interface RecruitmentRecord {
  id: string;
  candidateName: string;
  position: string;
  department: string;
  stage: string;
  appliedDate: string;
  experience: string;
  recruiter: string;
  source: string;
}

export type EntityKey = 'employees' | 'departments' | 'attendance' | 'leaveRequests' | 'assets' | 'tickets' | 'expenses' | 'training' | 'recruitment';

export type AnyRecord = EmployeeRecord | AttendanceRecord | LeaveRecord | TicketRecord | AssetRecord | ExpenseRecord | TrainingRecord | RecruitmentRecord | string;

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class MockDataService {

  private readonly _cache = new Map<string, AnyRecord[]>();

  constructor(private readonly runtimeEngine: RuntimeEngineService) {}

  // ── Main data access ───────────────────────────────────────────────────────

  getAll<T extends AnyRecord>(entity: EntityKey): T[] {
    if (!this._cache.has(entity)) {
      this._cache.set(entity, this._generate(entity));
    }
    return this._cache.get(entity) as T[];
  }

  getPage<T extends AnyRecord>(entity: EntityKey, page: number, pageSize: number): { data: T[]; total: number } {
    const all = this.getAll<T>(entity);
    const start = (page - 1) * pageSize;
    return { data: all.slice(start, start + pageSize), total: all.length };
  }

  search<T extends AnyRecord>(entity: EntityKey, query: string, fields: string[]): T[] {
    const all = this.getAll<T>(entity);
    const q = query.toLowerCase();
    return all.filter(row =>
      fields.some(f => String((row as unknown as Record<string, unknown>)[f] ?? '').toLowerCase().includes(q)),
    );
  }

  getDistinctValues(entity: EntityKey, field: string): string[] {
    const all = this.getAll(entity);
    const vals = new Set<string>();
    for (const row of all) {
      const v = (row as unknown as Record<string, unknown>)[field];
      if (v != null) vals.add(String(v));
    }
    return Array.from(vals).sort();
  }

  aggregateCount(entity: EntityKey, filter?: Record<string, unknown>): number {
    const all = this.getAll(entity);
    if (!filter) return all.length;
    return all.filter(row =>
      Object.entries(filter).every(([k, v]) => (row as unknown as Record<string, unknown>)[k] === v),
    ).length;
  }

  groupBy(entity: EntityKey, field: string): Array<{ label: string; count: number }> {
    const all = this.getAll(entity);
    const counts = new Map<string, number>();
    for (const row of all) {
      const v = String((row as unknown as Record<string, unknown>)[field] ?? 'Unknown');
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  // ── Generator dispatcher ───────────────────────────────────────────────────

  private _generate(entity: EntityKey): AnyRecord[] {
    const schema = this.runtimeEngine.mockDataSchema();
    const count = schema.recordCounts[entity] ?? 100;
    const seed = schema.seed;

    switch (entity) {
      case 'employees':    return this._employees(count, seed);
      case 'departments':  return DEPARTMENTS.slice(0, count) as unknown as AnyRecord[];
      case 'attendance':   return this._attendance(count, seed);
      case 'leaveRequests': return this._leaveRequests(count, seed);
      case 'assets':       return this._assets(count, seed);
      case 'tickets':      return this._tickets(count, seed);
      case 'expenses':     return this._expenses(count, seed);
      case 'training':     return this._training(count, seed);
      case 'recruitment':  return this._recruitment(count, seed);
      default:             return [];
    }
  }

  // ── Employee generator ────────────────────────────────────────────────────

  private _employees(count: number, seed: number): EmployeeRecord[] {
    const rng = createRng(seed);
    const today = new Date('2026-06-18');
    const STATUSES: EmployeeRecord['status'][] = ['Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'On Leave', 'New Joiner', 'Inactive'];

    return Array.from({ length: count }, (_, i) => {
      const gender = rng() > 0.42 ? 'M' : 'F';
      const firstName = gender === 'M' ? pickRng(rng, FIRST_NAMES_MALE) : pickRng(rng, FIRST_NAMES_FEMALE);
      const lastName = pickRng(rng, LAST_NAMES);
      const name = `${firstName} ${lastName}`;
      const dept = pickRng(rng, DEPARTMENTS);
      const desigs = DESIGNATIONS[dept] ?? ['Specialist', 'Senior Specialist', 'Lead', 'Manager', 'Director'];
      const designation = pickRng(rng, desigs);
      const location = pickRng(rng, LOCATIONS);
      const joinDate = dateOffsetDays(today, rng, 30, 3650);
      const joinDateObj = new Date(joinDate);
      const joinMonth = `${joinDateObj.getFullYear()}-${zeroPad(joinDateObj.getMonth() + 1, 2)}`;
      const status = pickRng(rng, STATUSES);
      const salaryBand = pickRng(rng, SALARY_BANDS);
      const empTypes = ['Full-Time', 'Full-Time', 'Full-Time', 'Part-Time', 'Contract', 'Intern'];
      const employmentType = pickRng(rng, empTypes);
      const empId = `HEX${zeroPad(i + 1001, 5)}`;
      const dob = dateOffsetDays(today, rng, 8000, 15000);
      const emailDomain = ['hexaware.com', 'hexaware.net'][Math.floor(rng() * 2)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(rng() * 99) + 1}@${emailDomain}`;
      const phone = `+91 ${9000000000 + Math.floor(rng() * 999999999)}`.slice(0, 14);

      return {
        employeeId: empId, name, firstName, lastName, email, phone,
        department: dept, designation, location, joinDate, joinMonth,
        status, salaryBand, employmentType, gender, avatar: null, dob,
      };
    });
  }

  // ── Attendance generator ──────────────────────────────────────────────────

  private _attendance(count: number, seed: number): AttendanceRecord[] {
    const rng = createRng(seed + 1);
    const employees = this.getAll<EmployeeRecord>('employees');
    const shifts = ['Morning (6am–2pm)', 'General (9am–6pm)', 'Night (10pm–6am)'];
    const workModes: AttendanceRecord['workMode'][] = ['Office', 'WFH', 'Field'];
    const statuses: AttendanceRecord['status'][] = ['Present', 'Present', 'Present', 'Present', 'Absent', 'Half Day'];

    return Array.from({ length: count }, (_, i) => {
      const emp = pickRng(rng, employees);
      const daysAgo = Math.floor(rng() * 365);
      const d = new Date('2026-06-18');
      d.setDate(d.getDate() - daysAgo);
      const date = d.toISOString().slice(0, 10);
      const shift = pickRng(rng, shifts);
      const status = pickRng(rng, statuses);
      const checkInH = shift.startsWith('Morning') ? 6 : shift.startsWith('Night') ? 22 : 9;
      const checkIn = `${zeroPad(checkInH, 2)}:${zeroPad(Math.floor(rng() * 30), 2)}`;
      const hoursWorked = status === 'Absent' ? 0 : status === 'Half Day' ? 4 : Math.floor(rng() * 3) + 7;
      const checkOutH = checkInH + hoursWorked;
      const checkOut = status === 'Absent' ? '' : `${zeroPad(checkOutH % 24, 2)}:${zeroPad(Math.floor(rng() * 30), 2)}`;

      return {
        id: `ATT${zeroPad(i + 1, 6)}`, employeeId: emp.employeeId, employeeName: emp.name,
        date, checkIn, checkOut, hoursWorked, shift, workMode: pickRng(rng, workModes), status,
      };
    });
  }

  // ── Leave requests generator ───────────────────────────────────────────────

  private _leaveRequests(count: number, seed: number): LeaveRecord[] {
    const rng = createRng(seed + 2);
    const employees = this.getAll<EmployeeRecord>('employees');
    const approvers = employees.filter(e => e.designation.includes('Lead') || e.designation.includes('Manager') || e.designation.includes('Head'));
    const statuses: LeaveRecord['status'][] = ['Approved', 'Approved', 'Approved', 'Pending', 'Pending', 'Rejected', 'Cancelled'];

    return Array.from({ length: count }, (_, i) => {
      const emp = pickRng(rng, employees);
      const approver = pickRng(rng, approvers.length ? approvers : employees);
      const leaveType = pickRng(rng, LEAVE_TYPES);
      const daysAgo = Math.floor(rng() * 365);
      const start = new Date('2026-06-18');
      start.setDate(start.getDate() - daysAgo);
      const days = Math.floor(rng() * 10) + 1;
      const end = new Date(start);
      end.setDate(end.getDate() + days - 1);
      const submitted = new Date(start);
      submitted.setDate(submitted.getDate() - Math.floor(rng() * 7) - 1);

      return {
        id: `LR${zeroPad(i + 1, 5)}`, employeeId: emp.employeeId, employeeName: emp.name,
        department: emp.department, leaveType, startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10), days,
        submittedDate: submitted.toISOString().slice(0, 10),
        status: pickRng(rng, statuses), approver: approver.name, reason: 'Personal',
      };
    });
  }

  // ── Tickets generator ──────────────────────────────────────────────────────

  private _tickets(count: number, seed: number): TicketRecord[] {
    const rng = createRng(seed + 3);
    const employees = this.getAll<EmployeeRecord>('employees');
    const it = employees.filter(e => e.department === 'IT Support');
    const severities: TicketRecord['severity'][] = ['P1', 'P2', 'P2', 'P3', 'P3', 'P3', 'P4', 'P4', 'P4'];
    const statuses: TicketRecord['status'][] = ['Open', 'Open', 'In Progress', 'In Progress', 'Resolved', 'Resolved', 'Closed'];
    const subjects = ['Cannot login to HRMS', 'Laptop overheating', 'VPN disconnects frequently', 'Email not syncing',
      'Application crash on startup', 'Slow network performance', 'Screen flickering', 'Printer not detected',
      'Password reset not working', 'Access denied to shared drive', 'Teams audio not working', 'Monitor not recognized'];

    return Array.from({ length: count }, (_, i) => {
      const raiser = pickRng(rng, employees);
      const assignee = it.length ? pickRng(rng, it) : pickRng(rng, employees);
      const daysAgo = Math.floor(rng() * 180);
      const created = new Date('2026-06-18');
      created.setDate(created.getDate() - daysAgo);

      return {
        ticketId: `TKT${zeroPad(i + 1001, 5)}`, subject: pickRng(rng, subjects),
        category: pickRng(rng, TICKET_CATEGORIES), severity: pickRng(rng, severities),
        raisedBy: raiser.name, assignedTo: assignee.name,
        createdDate: created.toISOString().slice(0, 10), status: pickRng(rng, statuses),
      };
    });
  }

  // ── Asset generator ────────────────────────────────────────────────────────

  private _assets(count: number, seed: number): AssetRecord[] {
    const rng = createRng(seed + 4);
    const employees = this.getAll<EmployeeRecord>('employees');
    const statuses: AssetRecord['status'][] = ['Assigned', 'Assigned', 'Assigned', 'Available', 'Under Repair', 'Retired'];

    return Array.from({ length: count }, (_, i) => {
      const emp = pickRng(rng, employees);
      const daysAgo = Math.floor(rng() * 1000);
      const assigned = new Date('2026-06-18');
      assigned.setDate(assigned.getDate() - daysAgo);
      const assetType = pickRng(rng, ASSET_TYPES);

      return {
        assetId: `ASSET${zeroPad(i + 1, 5)}`,
        assetType, serialNumber: `SN${zeroPad(Math.floor(rng() * 999999), 6)}`,
        assignedTo: emp.name, employeeId: emp.employeeId,
        assignedDate: assigned.toISOString().slice(0, 10),
        status: pickRng(rng, statuses), location: emp.location,
      };
    });
  }

  // ── Expense generator ──────────────────────────────────────────────────────

  private _expenses(count: number, seed: number): ExpenseRecord[] {
    const rng = createRng(seed + 5);
    const employees = this.getAll<EmployeeRecord>('employees');
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Singapore', 'London', 'New York'];
    const statuses: ExpenseRecord['status'][] = ['Approved', 'Approved', 'Paid', 'Pending', 'Pending', 'Rejected'];
    const purposes = ['Client Meeting', 'Conference Attendance', 'Site Inspection', 'Training', 'Sales Visit', 'Audit'];

    return Array.from({ length: count }, (_, i) => {
      const emp = pickRng(rng, employees);
      const daysAgo = Math.floor(rng() * 365);
      const start = new Date('2026-06-18');
      start.setDate(start.getDate() - daysAgo);
      const tripDays = Math.floor(rng() * 6) + 1;
      const end = new Date(start);
      end.setDate(end.getDate() + tripDays - 1);
      const submitted = new Date(end);
      submitted.setDate(submitted.getDate() + Math.floor(rng() * 7));

      return {
        id: `EXP${zeroPad(i + 1, 5)}`, employeeName: emp.name, employeeId: emp.employeeId,
        travelFrom: pickRng(rng, cities), travelTo: pickRng(rng, cities),
        startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10),
        purpose: pickRng(rng, purposes), amount: Math.floor(rng() * 150000) + 5000,
        currency: 'INR', status: pickRng(rng, statuses),
        submittedDate: submitted.toISOString().slice(0, 10),
      };
    });
  }

  // ── Training generator ─────────────────────────────────────────────────────

  private _training(count: number, seed: number): TrainingRecord[] {
    const rng = createRng(seed + 6);
    const employees = this.getAll<EmployeeRecord>('employees');
    const providers = ['Coursera', 'Udemy', 'LinkedIn Learning', 'Internal L&D', 'PwC Academy', 'KPMG Training', 'PMI'];
    const modes: TrainingRecord['mode'][] = ['Online', 'Online', 'Classroom', 'Hybrid'];
    const statuses: TrainingRecord['status'][] = ['Completed', 'Completed', 'In Progress', 'Registered', 'Cancelled'];

    return Array.from({ length: count }, (_, i) => {
      const emp = pickRng(rng, employees);
      const daysAgo = Math.floor(rng() * 365);
      const start = new Date('2026-06-18');
      start.setDate(start.getDate() - daysAgo);
      const duration = Math.floor(rng() * 30) + 1;
      const end = new Date(start);
      end.setDate(end.getDate() + duration);
      const score = rng() > 0.3 ? Math.floor(rng() * 40) + 60 : undefined;

      return {
        id: `TRN${zeroPad(i + 1, 5)}`, employeeName: emp.name, employeeId: emp.employeeId,
        programName: pickRng(rng, TRAINING_PROGRAMS), provider: pickRng(rng, providers),
        startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10),
        mode: pickRng(rng, modes), status: pickRng(rng, statuses), score,
      };
    });
  }

  // ── Recruitment generator ──────────────────────────────────────────────────

  private _recruitment(count: number, seed: number): RecruitmentRecord[] {
    const rng = createRng(seed + 7);
    const recruiters = ['Neha Kapoor', 'Arjun Sharma', 'Divya Menon', 'Rajiv Nair', 'Sneha Patel'];
    const sources = ['LinkedIn', 'Naukri', 'Employee Referral', 'Campus Drive', 'Consultancy', 'Indeed'];
    const expLevels = ['0–2 yrs', '2–4 yrs', '4–7 yrs', '7–12 yrs', '12+ yrs'];

    return Array.from({ length: count }, (_, i) => {
      const gender = rng() > 0.4 ? 'M' : 'F';
      const firstName = gender === 'M' ? pickRng(rng, FIRST_NAMES_MALE) : pickRng(rng, FIRST_NAMES_FEMALE);
      const lastName = pickRng(rng, LAST_NAMES);
      const dept = pickRng(rng, DEPARTMENTS);
      const daysAgo = Math.floor(rng() * 180);
      const applied = new Date('2026-06-18');
      applied.setDate(applied.getDate() - daysAgo);

      return {
        id: `REC${zeroPad(i + 1, 5)}`,
        candidateName: `${firstName} ${lastName}`,
        position: pickRng(rng, JOB_ROLES), department: dept,
        stage: pickRng(rng, RECRUITMENT_STAGES),
        appliedDate: applied.toISOString().slice(0, 10),
        experience: pickRng(rng, expLevels),
        recruiter: pickRng(rng, recruiters),
        source: pickRng(rng, sources),
      };
    });
  }
}
