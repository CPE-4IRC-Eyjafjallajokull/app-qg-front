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
  phases: IncidentPhase[];
};

export type VehicleAssignment = {
  id: string;
  vehicleId: string;
  phaseId: string;
  assignedAt: string;
  validatedAt?: string | null;
  unassignedAt?: string | null;
};

export type IncidentPhase = {
  id: string;
  code: string;
  label: string;
  vehicleAssignments: VehicleAssignment[];
};

export type AssignmentProposalItem = {
  incident_phase_id: string;
  vehicle_id: string;
  distance_km: number;
  estimated_time_min: number;
  route_geometry?: {
    type: string;
    coordinates: number[][];
  };
  energy_level: number;
  score: number;
  rank: number;
};

export type AssignmentProposalMissing = {
  incident_phase_id: string;
  vehicle_type_id: string;
  missing_quantity: number;
};

export type AssignmentProposal = {
  proposal_id: string;
  incident_id: string;
  generated_at: string;
  vehicles_to_send: AssignmentProposalItem[];
  missing: AssignmentProposalMissing[];
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

// Type for incident phase with its assignment proposals
export type IncidentPhaseWithProposals = {
  phaseId: string;
  proposal: AssignmentProposal | null;
  proposalItems: AssignmentProposalItem[];
};
