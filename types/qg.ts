export type GeoPoint = {
  lat: number;
  lng: number;
};

export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "new" | "assigned" | "resolved";

export type Incident = {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: GeoPoint;
  reportedAt: string;
  sector?: string;
};

export type VehicleStatus = "available" | "busy" | "maintenance";
export type VehicleType = "VSAV" | "FPT" | "EPA" | "VTU";

export type Vehicle = {
  id: string;
  callSign: string;
  type: VehicleType;
  status: VehicleStatus;
  location: GeoPoint;
  crew: number;
  updatedAt: string;
  station?: string;
};

export type InterestPoint = {
  name: string;
  address: string;
  zipcode: string;
  city: string;
  latitude: number;
  longitude: number;
  interest_point_kind_id: string;
  interest_point_id: string;
};

export type InterestPointCreatePayload = {
  name: string;
  address: string;
  zipcode: string;
  city: string;
  latitude: number;
  longitude: number;
  interest_point_kind_id: string;
};

export type InterestPointKind = {
  interest_point_kind_id: string;
  label: string;
};

export type OperatorCommand = {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
};
