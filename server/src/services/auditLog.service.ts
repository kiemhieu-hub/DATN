import AuditLog from "../models/AuditLog";

interface AuditInput {
  actorId?: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export const writeAuditLog = async (input: AuditInput) =>
  AuditLog.create({
    actor: input.actorId || undefined,
    actorRole: input.actorRole,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    before: input.before ?? {},
    after: input.after ?? {},
    metadata: input.metadata ?? {},
  });

