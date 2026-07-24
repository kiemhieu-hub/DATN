import mongoose, { type ClientSession } from "mongoose";

import AppointmentActivity, {
  type AppointmentActivityActorRole,
} from "../models/AppointmentActivity";

interface RecordActivityInput {
  appointmentId: string | mongoose.Types.ObjectId;
  action: string;
  description: string;
  actorId?: string;
  actorRole: AppointmentActivityActorRole;
  metadata?: Record<string, unknown>;
  session?: ClientSession;
}

export const recordAppointmentActivity = async (
  input: RecordActivityInput
) => {
  const actor =
    input.actorId &&
    mongoose.Types.ObjectId.isValid(input.actorId)
      ? new mongoose.Types.ObjectId(input.actorId)
      : undefined;

  const [activity] = await AppointmentActivity.create(
    [
      {
        appointment: input.appointmentId,
        action: input.action,
        description: input.description,
        actor,
        actorRole: input.actorRole,
        metadata: input.metadata ?? {},
      },
    ],
    input.session ? { session: input.session } : undefined
  );

  return activity;
};

export const recordSystemActivities = async (
  appointmentIds: Array<string | mongoose.Types.ObjectId>,
  action: string,
  description: string,
  metadata: Record<string, unknown> = {}
) => {
  if (appointmentIds.length === 0) return;

  await AppointmentActivity.insertMany(
    appointmentIds.map((appointmentId) => ({
      appointment: appointmentId,
      action,
      description,
      actorRole: "SYSTEM",
      metadata,
    }))
  );
};

export const getAppointmentActivities = async (
  appointmentId: string
) =>
  AppointmentActivity.find({
    appointment: appointmentId,
  })
    .populate("actor", "fullName email role")
    .sort({ createdAt: -1 })
    .lean();

export const deleteAppointmentActivities = async (
  appointmentId: string | mongoose.Types.ObjectId
) =>
  AppointmentActivity.deleteMany({
    appointment: appointmentId,
  });
