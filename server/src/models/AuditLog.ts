import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IAuditLog extends Document {
  actor?: Types.ObjectId;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", default: null },
    actorRole: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true, index: true },
    entityType: { type: String, required: true, trim: true, index: true },
    entityId: { type: String, required: true, trim: true, index: true },
    before: { type: Schema.Types.Mixed, default: {} },
    after: { type: Schema.Types.Mixed, default: {} },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  (mongoose.models.AuditLog as Model<IAuditLog> | undefined) ??
  mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;
