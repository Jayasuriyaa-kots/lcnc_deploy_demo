import { UserModel } from '../pages/users/models';

export const USER_RECORDS: UserModel[] = [
  {
    id: 'u-1',
    organisationId: 'org-1',
    name: 'Maya Bennett',
    email: 'maya.bennett@northstar.example',
    phone: '+1 (415) 555-0142',
    status: 'active',
    lastLogin: 'Today, 10:22',
    sessionHours: '128 h',
    createdAt: '2026-03-28T10:22:00.000Z'
  },
  {
    id: 'u-2',
    organisationId: 'org-2',
    name: 'Rohan Iyer',
    email: 'rohan.iyer@helio.example',
    phone: '+1 (646) 555-0181',
    status: 'active',
    lastLogin: 'Today, 09:48',
    sessionHours: '94 h',
    createdAt: '2026-03-22T09:48:00.000Z'
  },
  {
    id: 'u-3',
    organisationId: 'org-3',
    name: 'Elena Brooks',
    email: 'elena.brooks@axis.example',
    phone: '+1 (312) 555-0127',
    status: 'inactive',
    lastLogin: 'Apr 03, 2026',
    sessionHours: '42 h',
    createdAt: '2026-03-12T08:30:00.000Z'
  },
  {
    id: 'u-4',
    organisationId: 'org-4',
    name: 'James Cole',
    email: 'james.cole@everforge.example',
    phone: '+1 (206) 555-0169',
    status: 'active',
    lastLogin: 'Today, 08:11',
    sessionHours: '76 h',
    createdAt: '2026-02-18T08:11:00.000Z'
  },
  {
    id: 'u-5',
    organisationId: 'org-1',
    name: 'Priya Sharma',
    email: 'priya.sharma@northstar.example',
    phone: '+1 (408) 555-0153',
    status: 'inactive',
    lastLogin: 'Apr 01, 2026',
    sessionHours: '31 h',
    createdAt: '2026-02-01T16:05:00.000Z'
  }
];
