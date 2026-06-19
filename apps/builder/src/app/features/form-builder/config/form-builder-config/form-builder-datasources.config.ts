export interface BuilderDatasourceColumnOption {
  id: string;
  label: string;
  dataType: string;
  required?: boolean;
  unique?: boolean;
  lookup?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface BuilderDatasourceExpectedInput {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  sourceColumnId?: string;
}

export interface BuilderQueryOption {
  id: string;
  label: string;
  queryText: string;
  qualifiedQueryName: string;
  expectedInput: BuilderDatasourceExpectedInput[];
  columns: BuilderDatasourceColumnOption[];
}

export interface BuilderDatasourceOption {
  id: string;
  label: string;
  queries: BuilderQueryOption[];
}

export interface BuilderColumnFieldMapping {
  columnId: string;
  fieldType: string;
}

export const FORM_BUILDER_MOCK_DATASOURCES: BuilderDatasourceOption[] = [
  {
    id: 'f8f8fc83-48b5-45f0-a2b2-67cb4487f13f',
    label: 'qo_hrms_stage',
    queries: [
      {
        id: '8d9fe389-cff1-4473-b0f6-52b36bb7d6be',
        label: 'Attendance Upsert Query',
        qualifiedQueryName: 'qo_hrms_stage.queries.attendance_upsert',
        queryText: 'INSERT INTO attendance_logs (employee_code, employee_name, attendance_date, check_in_time, check_out_time, shift_hours, is_late, notes) VALUES (:employee_code, :employee_name, :attendance_date, :check_in_time, :check_out_time, :shift_hours, :is_late, :notes)',
        expectedInput: [
          { key: 'employee_code', label: 'Employee Code', type: 'string', required: true, sourceColumnId: 'employee_code' },
          { key: 'employee_name', label: 'Employee Name', type: 'string', required: true, sourceColumnId: 'employee_name' },
          { key: 'attendance_date', label: 'Attendance Date', type: 'date', required: true, sourceColumnId: 'attendance_date' },
          { key: 'check_in_time', label: 'Check In Time', type: 'time', sourceColumnId: 'check_in_time' },
          { key: 'check_out_time', label: 'Check Out Time', type: 'time', sourceColumnId: 'check_out_time' },
          { key: 'shift_hours', label: 'Shift Hours', type: 'decimal', sourceColumnId: 'shift_hours' },
          { key: 'is_late', label: 'Is Late', type: 'boolean', sourceColumnId: 'is_late' },
          { key: 'notes', label: 'Notes', type: 'string', sourceColumnId: 'notes' }
        ],
        columns: [
          { id: 'employee_code', label: 'Employee Code', dataType: 'varchar', required: true, unique: true, placeholder: 'EMP-0001' },
          { id: 'employee_name', label: 'Employee Name', dataType: 'varchar', required: true },
          { id: 'attendance_date', label: 'Attendance Date', dataType: 'date', required: true },
          { id: 'check_in_time', label: 'Check In Time', dataType: 'time' },
          { id: 'check_out_time', label: 'Check Out Time', dataType: 'time' },
          { id: 'shift_hours', label: 'Shift Hours', dataType: 'decimal' },
          { id: 'is_late', label: 'Is Late', dataType: 'boolean' },
          { id: 'notes', label: 'Notes', dataType: 'longtext', placeholder: 'Add attendance note' }
        ]
      },
      {
        id: '1efac17d-9d33-4883-b4eb-79d52dc00389',
        label: 'Leave Request Create Query',
        qualifiedQueryName: 'qo_hrms_stage.queries.leave_request_create',
        queryText: 'INSERT INTO leave_requests (employee_name, employee_email, employee_phone, leave_type, start_date, end_date, half_day, reason, submitted_at) VALUES (:employee_name, :employee_email, :employee_phone, :leave_type, :start_date, :end_date, :half_day, :reason, :submitted_at)',
        expectedInput: [
          { key: 'employee_name', label: 'Employee Name', type: 'string', required: true, sourceColumnId: 'employee_name' },
          { key: 'employee_email', label: 'Employee Email', type: 'string', required: true, sourceColumnId: 'employee_email' },
          { key: 'employee_phone', label: 'Employee Phone', type: 'string', sourceColumnId: 'employee_phone' },
          { key: 'leave_type', label: 'Leave Type', type: 'string', required: true, sourceColumnId: 'leave_type' },
          { key: 'start_date', label: 'Start Date', type: 'date', required: true, sourceColumnId: 'start_date' },
          { key: 'end_date', label: 'End Date', type: 'date', required: true, sourceColumnId: 'end_date' },
          { key: 'half_day', label: 'Half Day', type: 'boolean', sourceColumnId: 'half_day' },
          { key: 'reason', label: 'Reason', type: 'string', sourceColumnId: 'reason' },
          { key: 'submitted_at', label: 'Submitted At', type: 'datetime', sourceColumnId: 'submitted_at' }
        ],
        columns: [
          { id: 'employee_name', label: 'Employee Name', dataType: 'varchar', required: true },
          { id: 'employee_email', label: 'Employee Email', dataType: 'varchar', required: true, unique: true, placeholder: 'name@company.com' },
          { id: 'employee_phone', label: 'Employee Phone', dataType: 'varchar', placeholder: '9876543210' },
          { id: 'leave_type', label: 'Leave Type', dataType: 'varchar', required: true, lookup: true, options: ['Casual', 'Sick', 'Earned', 'Maternity'] },
          { id: 'start_date', label: 'Start Date', dataType: 'date', required: true },
          { id: 'end_date', label: 'End Date', dataType: 'date', required: true },
          { id: 'half_day', label: 'Half Day', dataType: 'boolean' },
          { id: 'reason', label: 'Reason', dataType: 'longtext', placeholder: 'Enter leave reason' },
          { id: 'submitted_at', label: 'Submitted At', dataType: 'timestamp' }
        ]
      }
    ]
  },
  {
    id: 'df38b6eb-0658-44ff-b844-63d0952f04b9',
    label: 'qo_hrms_prod',
    queries: [
      {
        id: '2faef7a8-bd4b-488f-a41f-f152a7327be6',
        label: 'Employee Profile Save Query',
        qualifiedQueryName: 'qo_hrms_prod.queries.employee_profile_save',
        queryText: 'MERGE INTO employee_master USING dual ON (employee_email = :employee_email) WHEN MATCHED THEN UPDATE SET employee_name = :employee_name, phone_number = :phone_number, home_address = :home_address, department_name = :department_name, joining_date = :joining_date, salary_amount = :salary_amount, active_status = :active_status, profile_updated_at = :profile_updated_at WHEN NOT MATCHED THEN INSERT (employee_name, employee_email, phone_number, home_address, department_name, joining_date, salary_amount, active_status, profile_updated_at) VALUES (:employee_name, :employee_email, :phone_number, :home_address, :department_name, :joining_date, :salary_amount, :active_status, :profile_updated_at)',
        expectedInput: [
          { key: 'employee_name', label: 'Employee Name', type: 'string', required: true, sourceColumnId: 'employee_name' },
          { key: 'employee_email', label: 'Employee Email', type: 'string', required: true, sourceColumnId: 'employee_email' },
          { key: 'phone_number', label: 'Phone Number', type: 'string', sourceColumnId: 'phone_number' },
          { key: 'home_address', label: 'Home Address', type: 'string', sourceColumnId: 'home_address' },
          { key: 'department_name', label: 'Department Name', type: 'string', sourceColumnId: 'department_name' },
          { key: 'joining_date', label: 'Joining Date', type: 'date', required: true, sourceColumnId: 'joining_date' },
          { key: 'salary_amount', label: 'Salary Amount', type: 'decimal', sourceColumnId: 'salary_amount' },
          { key: 'active_status', label: 'Active Status', type: 'boolean', sourceColumnId: 'active_status' },
          { key: 'profile_updated_at', label: 'Profile Updated At', type: 'datetime', sourceColumnId: 'profile_updated_at' }
        ],
        columns: [
          { id: 'employee_name', label: 'Employee Name', dataType: 'varchar', required: true },
          { id: 'employee_email', label: 'Employee Email', dataType: 'varchar', required: true, unique: true, placeholder: 'name@company.com' },
          { id: 'phone_number', label: 'Phone Number', dataType: 'varchar', placeholder: '9876543210' },
          { id: 'home_address', label: 'Home Address', dataType: 'text', placeholder: 'Enter full address' },
          { id: 'department_name', label: 'Department Name', dataType: 'varchar', lookup: true, options: ['HR', 'Finance', 'Operations', 'Engineering'] },
          { id: 'joining_date', label: 'Joining Date', dataType: 'date', required: true },
          { id: 'salary_amount', label: 'Salary Amount', dataType: 'decimal' },
          { id: 'active_status', label: 'Active Status', dataType: 'boolean' },
          { id: 'profile_updated_at', label: 'Profile Updated At', dataType: 'datetime' }
        ]
      },
      {
        id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
        label: 'Asset Request Submit Query',
        qualifiedQueryName: 'qo_hrms_prod.queries.asset_request_submit',
        queryText: 'INSERT INTO asset_requests (employee_id, asset_type, asset_model, business_justification, required_by, priority) VALUES (:employee_id, :asset_type, :asset_model, :business_justification, :required_by, :priority)',
        expectedInput: [
          { key: 'employee_id', label: 'Employee ID', type: 'string', required: true, sourceColumnId: 'employee_id' },
          { key: 'asset_type', label: 'Asset Type', type: 'string', required: true, sourceColumnId: 'asset_type' },
          { key: 'asset_model', label: 'Asset Model', type: 'string', sourceColumnId: 'asset_model' },
          { key: 'business_justification', label: 'Justification', type: 'string', required: true, sourceColumnId: 'business_justification' },
          { key: 'required_by', label: 'Required By', type: 'date', required: true, sourceColumnId: 'required_by' },
          { key: 'priority', label: 'Priority', type: 'string', required: true, sourceColumnId: 'priority' }
        ],
        columns: [
          { id: 'employee_id', label: 'Employee ID', dataType: 'varchar', required: true, placeholder: 'EMP-0001' },
          { id: 'asset_type', label: 'Asset Type', dataType: 'varchar', required: true, lookup: true, options: ['Laptop', 'Monitor', 'Mouse & Keyboard', 'Headset', 'Mobile Phone', 'Desk Chair', 'Access Card', 'Other'] },
          { id: 'asset_model', label: 'Preferred Model / Spec', dataType: 'varchar', placeholder: 'e.g. Dell XPS 15' },
          { id: 'business_justification', label: 'Business Justification', dataType: 'longtext', required: true, placeholder: 'Why is this asset needed?' },
          { id: 'required_by', label: 'Required By Date', dataType: 'date', required: true },
          { id: 'priority', label: 'Priority', dataType: 'varchar', required: true, lookup: true, options: ['Critical', 'High', 'Medium', 'Low'] }
        ]
      },
      {
        id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
        label: 'Travel Reimbursement Submit Query',
        qualifiedQueryName: 'qo_hrms_prod.queries.travel_reimbursement_submit',
        queryText: 'INSERT INTO travel_expenses (employee_id, travel_purpose, travel_from, travel_to, travel_date, mode_of_transport, total_amount) VALUES (:employee_id, :travel_purpose, :travel_from, :travel_to, :travel_date, :mode_of_transport, :total_amount)',
        expectedInput: [
          { key: 'employee_id', label: 'Employee ID', type: 'string', required: true, sourceColumnId: 'employee_id' },
          { key: 'travel_purpose', label: 'Purpose', type: 'string', required: true, sourceColumnId: 'travel_purpose' },
          { key: 'travel_from', label: 'From', type: 'string', required: true, sourceColumnId: 'travel_from' },
          { key: 'travel_to', label: 'To', type: 'string', required: true, sourceColumnId: 'travel_to' },
          { key: 'travel_date', label: 'Travel Date', type: 'date', required: true, sourceColumnId: 'travel_date' },
          { key: 'mode_of_transport', label: 'Mode', type: 'string', required: true, sourceColumnId: 'mode_of_transport' },
          { key: 'total_amount', label: 'Total Amount (₹)', type: 'decimal', required: true, sourceColumnId: 'total_amount' }
        ],
        columns: [
          { id: 'employee_id', label: 'Employee ID', dataType: 'varchar', required: true, placeholder: 'EMP-0001' },
          { id: 'travel_purpose', label: 'Purpose of Travel', dataType: 'varchar', required: true, lookup: true, options: ['Client Visit', 'Conference', 'Training', 'Internal Meeting', 'Site Inspection', 'Other'] },
          { id: 'travel_from', label: 'Travel From', dataType: 'varchar', required: true, placeholder: 'Origin city' },
          { id: 'travel_to', label: 'Travel To', dataType: 'varchar', required: true, placeholder: 'Destination city' },
          { id: 'travel_date', label: 'Travel Date', dataType: 'date', required: true },
          { id: 'mode_of_transport', label: 'Mode of Transport', dataType: 'varchar', required: true, lookup: true, options: ['Flight', 'Train', 'Bus', 'Cab / Taxi', 'Own Vehicle', 'Metro'] },
          { id: 'total_amount', label: 'Total Claim Amount (₹)', dataType: 'decimal', required: true }
        ]
      },
      {
        id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
        label: 'Recruitment Application Submit Query',
        qualifiedQueryName: 'qo_hrms_prod.queries.recruitment_application_submit',
        queryText: 'INSERT INTO candidates (candidate_name, email, phone, applied_role, experience_years, current_company, notice_period) VALUES (:candidate_name, :email, :phone, :applied_role, :experience_years, :current_company, :notice_period)',
        expectedInput: [
          { key: 'candidate_name', label: 'Full Name', type: 'string', required: true, sourceColumnId: 'candidate_name' },
          { key: 'email', label: 'Email', type: 'string', required: true, sourceColumnId: 'email' },
          { key: 'phone', label: 'Phone', type: 'string', required: true, sourceColumnId: 'phone' },
          { key: 'applied_role', label: 'Role Applied For', type: 'string', required: true, sourceColumnId: 'applied_role' },
          { key: 'experience_years', label: 'Experience (Years)', type: 'decimal', required: true, sourceColumnId: 'experience_years' },
          { key: 'current_company', label: 'Current Company', type: 'string', sourceColumnId: 'current_company' },
          { key: 'notice_period', label: 'Notice Period', type: 'string', required: true, sourceColumnId: 'notice_period' }
        ],
        columns: [
          { id: 'candidate_name', label: 'Full Name', dataType: 'varchar', required: true },
          { id: 'email', label: 'Email Address', dataType: 'varchar', required: true, unique: true, placeholder: 'candidate@email.com' },
          { id: 'phone', label: 'Phone Number', dataType: 'varchar', required: true, placeholder: '+91 XXXXX XXXXX' },
          { id: 'applied_role', label: 'Applying For', dataType: 'varchar', required: true, lookup: true, options: ['Software Engineer', 'Senior SDE', 'Product Manager', 'Data Analyst', 'HR Business Partner', 'Sales Executive', 'DevOps Engineer', 'UX Designer'] },
          { id: 'experience_years', label: 'Total Experience (Years)', dataType: 'decimal', required: true },
          { id: 'current_company', label: 'Current Company', dataType: 'varchar', placeholder: 'Current employer' },
          { id: 'notice_period', label: 'Notice Period', dataType: 'varchar', required: true, lookup: true, options: ['Immediate', '15 Days', '30 Days', '60 Days', '90 Days'] }
        ]
      },
      {
        id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
        label: 'Training Registration Submit Query',
        qualifiedQueryName: 'qo_hrms_prod.queries.training_registration_submit',
        queryText: 'INSERT INTO training_registrations (employee_id, training_program, training_mode, preferred_date, manager_approved) VALUES (:employee_id, :training_program, :training_mode, :preferred_date, :manager_approved)',
        expectedInput: [
          { key: 'employee_id', label: 'Employee ID', type: 'string', required: true, sourceColumnId: 'employee_id' },
          { key: 'training_program', label: 'Program', type: 'string', required: true, sourceColumnId: 'training_program' },
          { key: 'training_mode', label: 'Mode', type: 'string', required: true, sourceColumnId: 'training_mode' },
          { key: 'preferred_date', label: 'Preferred Start Date', type: 'date', required: true, sourceColumnId: 'preferred_date' },
          { key: 'manager_approved', label: 'Manager Approved', type: 'boolean', sourceColumnId: 'manager_approved' }
        ],
        columns: [
          { id: 'employee_id', label: 'Employee ID', dataType: 'varchar', required: true, placeholder: 'EMP-0001' },
          { id: 'training_program', label: 'Training Program', dataType: 'varchar', required: true, lookup: true, options: ['Leadership Excellence', 'Advanced SQL & Analytics', 'Cloud Architecture (AWS)', 'Agile & Scrum Practitioner', 'Communication Skills', 'Cybersecurity Fundamentals', 'Project Management (PMP)', 'Design Thinking'] },
          { id: 'training_mode', label: 'Training Mode', dataType: 'varchar', required: true, lookup: true, options: ['Online', 'In-Person', 'Hybrid'] },
          { id: 'preferred_date', label: 'Preferred Start Date', dataType: 'date', required: true },
          { id: 'manager_approved', label: 'Manager Approval Obtained', dataType: 'boolean' }
        ]
      },
      {
        id: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
        label: 'IT Support Ticket Submit Query',
        qualifiedQueryName: 'qo_hrms_prod.queries.it_support_ticket_submit',
        queryText: 'INSERT INTO it_tickets (employee_id, issue_category, issue_title, issue_description, severity, affected_since) VALUES (:employee_id, :issue_category, :issue_title, :issue_description, :severity, :affected_since)',
        expectedInput: [
          { key: 'employee_id', label: 'Employee ID', type: 'string', required: true, sourceColumnId: 'employee_id' },
          { key: 'issue_category', label: 'Category', type: 'string', required: true, sourceColumnId: 'issue_category' },
          { key: 'issue_title', label: 'Issue Title', type: 'string', required: true, sourceColumnId: 'issue_title' },
          { key: 'issue_description', label: 'Description', type: 'string', required: true, sourceColumnId: 'issue_description' },
          { key: 'severity', label: 'Severity', type: 'string', required: true, sourceColumnId: 'severity' },
          { key: 'affected_since', label: 'Issue Started On', type: 'date', sourceColumnId: 'affected_since' }
        ],
        columns: [
          { id: 'employee_id', label: 'Employee ID', dataType: 'varchar', required: true, placeholder: 'EMP-0001' },
          { id: 'issue_category', label: 'Issue Category', dataType: 'varchar', required: true, lookup: true, options: ['Hardware', 'Software', 'Network / VPN', 'Email & Collaboration', 'Access & Permissions', 'Data & Backup', 'Other'] },
          { id: 'issue_title', label: 'Issue Title', dataType: 'varchar', required: true, placeholder: 'Brief title for the issue' },
          { id: 'issue_description', label: 'Issue Description', dataType: 'longtext', required: true, placeholder: 'Describe the problem in detail' },
          { id: 'severity', label: 'Severity', dataType: 'varchar', required: true, lookup: true, options: ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'] },
          { id: 'affected_since', label: 'Issue Started On', dataType: 'date' }
        ]
      }
    ]
  }
];
