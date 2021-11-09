/** Status messages to return from the API's `health` endpoint */
export enum HealthStatusMessage {
  bad = 'WARNING: RAPID ORBITAL DECAY IMMINENT',
  good = 'Altitude is A-OK',
  recovered = 'Sustained Low Earth Orbit Resumed',
}
