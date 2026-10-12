import type { FieldErrors } from "@/lib/validation";

/** Standard result returned by every Server Action used with useActionState. */
export interface ActionState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: FieldErrors;
}

export const IDLE_STATE: ActionState = { status: "idle" };
