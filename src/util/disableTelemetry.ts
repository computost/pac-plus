import { disableTelemetry as pacDisableTelemetry } from "pac-wrap";

let telemetryIsDisabled = false;

export async function disableTelemetry() {
  if (!telemetryIsDisabled) {
    telemetryIsDisabled = true;
    await pacDisableTelemetry();
  }
}
