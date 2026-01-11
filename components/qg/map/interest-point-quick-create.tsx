"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { MapPin, MapPinPlus } from "lucide-react";
import type { InterestPointCreatePayload, InterestPointKind } from "@/types/qg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reverseGeocode } from "@/lib/geocoding/service";

type InterestPointQuickCreateProps = {
  latitude: number;
  longitude: number;
  interestPointKinds: InterestPointKind[];
  isSubmitting: boolean;
  onCreate: (payload: InterestPointCreatePayload) => void;
};

const DEFAULT_CITY = "Lyon";
const DEFAULT_ZIPCODE = "69000";
const DEFAULT_ADDRESS = "Position map";
const DEFAULT_NAME = "Point d'interet";

const resolveCity = (address?: {
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
}): string => {
  return (
    address?.city ||
    address?.town ||
    address?.village ||
    address?.suburb ||
    DEFAULT_CITY
  );
};

export function InterestPointQuickCreate({
  latitude,
  longitude,
  interestPointKinds,
  isSubmitting,
  onCreate,
}: InterestPointQuickCreateProps) {
  const [name, setName] = useState("");
  const [kindId, setKindId] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState({
    address: DEFAULT_ADDRESS,
    city: DEFAULT_CITY,
    zipcode: DEFAULT_ZIPCODE,
    displayName: "",
  });
  const [isResolving, setIsResolving] = useState(false);
  const compactAddress = useMemo(() => {
    if (
      resolvedAddress.address &&
      resolvedAddress.address !== DEFAULT_ADDRESS
    ) {
      return resolvedAddress.address;
    }
    if (resolvedAddress.displayName) {
      return resolvedAddress.displayName
        .split(",")
        .slice(0, 2)
        .join(",")
        .trim();
    }
    return DEFAULT_ADDRESS;
  }, [resolvedAddress]);
  const kindLabel = useMemo(() => {
    return (
      interestPointKinds.find((kind) => kind.interest_point_kind_id === kindId)
        ?.label ?? ""
    );
  }, [interestPointKinds, kindId]);

  useEffect(() => {
    if (!kindId && interestPointKinds.length > 0) {
      setKindId(interestPointKinds[0].interest_point_kind_id);
    }
  }, [interestPointKinds, kindId]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setIsResolving(true);
        const result = await reverseGeocode({
          latitude,
          longitude,
          signal: controller.signal,
        });
        if (!result) {
          return;
        }

        const address = result.address;
        const street = [address?.house_number, address?.road]
          .filter(Boolean)
          .join(" ")
          .trim();
        const displayName = result.display_name ?? "";

        setResolvedAddress({
          address: street || displayName || DEFAULT_ADDRESS,
          city: resolveCity(address),
          zipcode: address?.postcode || DEFAULT_ZIPCODE,
          displayName,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      } finally {
        setIsResolving(false);
      }
    };

    load();
    return () => controller.abort();
  }, [latitude, longitude]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!kindId) {
      return;
    }

    const trimmedName = name.trim();
    onCreate({
      name: trimmedName.length > 0 ? trimmedName : DEFAULT_NAME,
      address: resolvedAddress.address,
      zipcode: resolvedAddress.zipcode,
      city: resolvedAddress.city,
      latitude,
      longitude,
      interest_point_kind_id: kindId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
        Creer un point d&apos;interet
      </p>
      <div className="grid gap-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={DEFAULT_NAME}
          className="h-8 border-white/10 bg-white/5 text-xs text-white placeholder:text-white/30 hover:bg-white/10 focus:ring-white/20"
          disabled={isSubmitting}
        />
        <Select
          value={kindId}
          onValueChange={setKindId}
          disabled={isSubmitting || interestPointKinds.length === 0}
        >
          <SelectTrigger className="h-8 w-full border-white/10 bg-white/5 text-xs text-white hover:bg-white/10 focus:ring-white/20">
            <SelectValue
              placeholder={interestPointKinds.length ? "Type" : "Aucun type"}
              aria-label={kindLabel || "Type"}
            />
          </SelectTrigger>
          <SelectContent
            align="start"
            className="border-white/10 bg-black/90 backdrop-blur-xl"
          >
            {interestPointKinds.map((kind) => (
              <SelectItem
                key={kind.interest_point_kind_id}
                value={kind.interest_point_kind_id}
                className="text-white focus:bg-white/10 focus:text-white"
              >
                {kind.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Adresse resolue */}
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5 text-[10px] text-white/50">
          <MapPin className="h-3 w-3 shrink-0 text-white/40" />
          {isResolving ? (
            <span className="h-3 w-32 animate-pulse rounded-full bg-white/10" />
          ) : (
            <span className="truncate">
              {compactAddress} - {resolvedAddress.zipcode}{" "}
              {resolvedAddress.city}
            </span>
          )}
        </div>
      </div>
      <Button
        type="submit"
        size="sm"
        className="h-8 w-full justify-center gap-2 bg-gradient-to-r from-slate-600 to-slate-500 text-xs text-white shadow-lg hover:from-slate-500 hover:to-slate-400"
        disabled={isSubmitting || !kindId || interestPointKinds.length === 0}
      >
        <MapPinPlus className="h-3.5 w-3.5" />
        {isSubmitting ? "Creation..." : "Creer le point"}
      </Button>
    </form>
  );
}
