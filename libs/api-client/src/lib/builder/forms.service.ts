import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Form, PaginatedResponse } from '@qo/models';

@Injectable({ providedIn: 'root' })
export class FormsService {
  private mockData: Form[] = [
    { 
      id: 'frm_1', name: 'Customer Intake', slug: 'customer-intake', appId: 'app_1', 
      fields: [
        { id: 'f_1', type: 'text', name: 'companyName', label: 'Company Name', required: true },
        { id: 'f_2', type: 'email', name: 'contactEmail', label: 'Contact Email', required: true }
      ],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() 
    },
    {
      id: 'form_add_employee',
      name: 'Add Employee Form',
      slug: 'add-employee',
      appId: 'app_hr_management',
      fields: [
        { id: 'first_name', type: 'text', name: 'firstName', label: 'First Name', required: true },
        { id: 'last_name', type: 'text', name: 'lastName', label: 'Last Name', required: true },
        { id: 'email', type: 'email', name: 'email', label: 'Email', required: true },
        { id: 'mobile_number', type: 'text', name: 'mobileNumber', label: 'Mobile Number', required: false },
        { id: 'department', type: 'select', name: 'department', label: 'Department', required: true },
        { id: 'joining_date', type: 'date', name: 'joiningDate', label: 'Joining Date', required: false },
        { id: 'employment_type', type: 'select', name: 'employmentType', label: 'Employment Type', required: false },
        { id: 'manager_comments', type: 'text', name: 'managerComments', label: 'Manager Comments', required: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  getForms(appId: string): Observable<Form[]> {
    return of(this.mockData.filter(f => f.appId === appId)).pipe(delay(300));
  }
}
