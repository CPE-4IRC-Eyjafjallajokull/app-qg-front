"use client";

import { useSSE } from "@/hooks/useSSE";
import { useState } from "react";

export default function EventsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { data, isConnected, error } = useSSE(`${apiUrl}/events`);
  const [events, setEvents] = useState<{ event: string; timestamp: string }[]>(
    []
  );

  // Ajouter chaque événement à la liste
  if (data && events[events.length - 1]?.timestamp !== data.timestamp) {
    setEvents((prev) => [...prev, data]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">SSE Events Stream</h1>

        {/* Status */}
        <div className="mb-6 p-4 rounded-lg bg-white shadow-sm border-l-4">
          <div className={`border-l-4 ${isConnected ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"} p-4`}>
            <p className="font-semibold">
              Status:{" "}
              <span
                className={isConnected ? "text-green-600" : "text-red-600"}
              >
                {isConnected ? "✓ Connected" : "✗ Disconnected"}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              API URL: <code className="bg-gray-100 px-2 py-1 rounded">{apiUrl}</code>
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700 font-semibold">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Events Log */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-t-lg">
            <h2 className="text-white font-semibold">Events Log ({events.length})</h2>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-gray-500 italic">Waiting for events...</p>
            ) : (
              <div className="space-y-2">
                {events.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded border-l-4 border-blue-400"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-semibold text-blue-600">
                        {evt.event}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> L'API envoie un événement 'connected' au démarrage,
            puis des heartbeats toutes les 5 secondes.
          </p>
        </div>
      </div>
    </div>
  );
}
