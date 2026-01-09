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
  phases: string[];
};

export type AssignmentProposalItem = {
  incident_phase_id: string;
  vehicle_id: string;
  distance_km: number;
  estimated_time_min: number;
  energy_level: number;
  score: number;
  rationale?: string | null;
};

export type AssignmentProposal = {
  proposal_id: string;
  incident_id: string;
  generated_at: string;
  proposals: AssignmentProposalItem[];
  missing_by_vehicle_type: Record<string, number>;
  validated_at?: string | null;
  rejected_at?: string | null;
};

export type VehicleStatus =
  | "available"
  | "engaged"
  | "out_of_service"
  | "unavailable"
  | "returning"
  | "on_intervention"
  | "transport";
export type VehicleType =
  | "VSAV"
  | "FPT"
  | "EPA"
  | "VTU"
  | "BEA"
  | "CCF"
  | "CCGC"
  | "FPTSR"
  | "PC_Mobile"
  | "VAR"
  | "VIRT"
  | "VLCG"
  | "VLM"
  | "VLR"
  | "VPI"
  | "VSR";

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
