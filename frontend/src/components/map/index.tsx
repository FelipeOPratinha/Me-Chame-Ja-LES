import { useEffect, useRef } from "react";
import { View } from "react-native";
import { useLoadScript } from "~/hooks/useLoadScript";
import { GOOGLE_MAPS_API_KEY } from "@env";

declare global {
  interface Window {
    google: any;
  }
}

type Coords = { lat: number; lon: number };

type MapProps = {
  retirada: Coords | null;
  paradas: Coords[];
  destino: Coords | null;
  onResumoRota?: (resumo: { distanciaKm: number; duracaoMin: number } | null) => void;
};

// Função para buscar rota na Routes API
async function buscarRota(retirada: Coords, destino: Coords, paradas: Coords[]) {
  const body = {
    origin: { location: { latLng: { latitude: retirada.lat, longitude: retirada.lon } } },
    destination: { location: { latLng: { latitude: destino.lat, longitude: destino.lon } } },
    intermediates: paradas.map((p) => ({
      location: { latLng: { latitude: p.lat, longitude: p.lon } },
    })),
    travelMode: "DRIVE",
  };

  const resp = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": "routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration",
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  return data.routes?.[0];
}

export const Map: React.FC<MapProps> = ({ retirada, paradas, destino, onResumoRota }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const loaded = useLoadScript(
    `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&v=weekly&language=pt-BR&region=BR`
  );

  // Inicializa o mapa apenas uma vez
  useEffect(() => {
    if (!loaded || !window.google || !mapRef.current || mapInstanceRef.current) return;

    const google = window.google;
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: -23.55052, lng: -46.633308 },
      zoom: 12,
    });

    mapInstanceRef.current = map;
  }, [loaded]);

  // Atualiza markers e rota quando endereços mudam
  useEffect(() => {
    const google = window.google;
    const map = mapInstanceRef.current;
    if (!loaded || !google || !map) return;

    // Remove markers antigos
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Remove rota antiga
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const markers: any[] = [];

    // Adiciona marcadores
    if (retirada) {
      markers.push(
        new google.maps.Marker({
          position: { lat: retirada.lat, lng: retirada.lon },
          map,
          label: "R",
          title: "Retirada",
        })
      );
    }

    if (destino) {
      markers.push(
        new google.maps.Marker({
          position: { lat: destino.lat, lng: destino.lon },
          map,
          label: "D",
          title: "Destino",
        })
      );
    }

    paradas.forEach((p, idx) => {
      markers.push(
        new google.maps.Marker({
          position: { lat: p.lat, lng: p.lon },
          map,
          label: `${idx + 1}`,
          title: `Parada ${idx + 1}`,
        })
      );
    });

    markersRef.current = markers;

    // Ajusta o mapa para caber tudo
    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend(m.getPosition()!));
      map.fitBounds(bounds);
    }

    // Desenha rota
    async function desenharRota() {
      if (!(retirada && destino)) {
        onResumoRota?.(null);
        return;
      }

      try {
        const rota = await buscarRota(retirada, destino, paradas);
        if (rota?.polyline?.encodedPolyline) {
          const path = google.maps.geometry.encoding.decodePath(rota.polyline.encodedPolyline);
          const polyline = new google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: "#4285F4",
            strokeOpacity: 0.85,
            strokeWeight: 5,
            map,
          });
          polylineRef.current = polyline;
        }

        if (rota?.distanceMeters && rota?.duration) {
          const distanciaKm = rota.distanceMeters / 1000;
          const duracaoSeg = parseInt(rota.duration.replace("s", ""), 10);
          const duracaoMin = Math.round(duracaoSeg / 60);
          onResumoRota?.({ distanciaKm, duracaoMin });
        }
      } catch (err) {
        console.error("Erro ao buscar rota:", err);
        onResumoRota?.(null);
      }
    }

    desenharRota();
  }, [retirada?.lat, retirada?.lon, destino?.lat, destino?.lon, JSON.stringify(paradas)]);

  return (
    <View className="w-full h-full bg-white rounded-xl overflow-hidden shadow-md">
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </View>
  );
};