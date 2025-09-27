import { http } from "../../http";

export interface MailSettingsResponse {
  host: string | null;
  port: number | null;
  auth: boolean | null;
  starttls: boolean | null;
  username: string | null;
  enabled: boolean | null;
  from: string | null;
  passwordSet: boolean;
}

export interface MailSettingsUpdatePayload {
  host: string | null;
  port: number | null;
  auth?: boolean | null;
  starttls?: boolean | null;
  username?: string | null;
  password?: string | null;
  enabled?: boolean | null;
  from?: string | null;
}

export const mail = {
  getConfig: () => http.get<MailSettingsResponse>("/api/notificaciones/configuracion/correo"),
  updateConfig: (payload: MailSettingsUpdatePayload) =>
    http.put<void>("/api/notificaciones/configuracion/correo", payload),
};
