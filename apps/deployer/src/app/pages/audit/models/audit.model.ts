export interface AuditRecord {
  id: string;
  actor: string;
  timestamp: string;
  actionType: string;
  affectedEntity: string;
  description: string;
}
