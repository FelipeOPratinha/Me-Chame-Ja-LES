import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [rotaSalva, setRotaSalva] = useState<{
    retirada: Coords | null;
    destino: Coords | null;
    paradas: Coords[];
  }>({ retirada: null, destino: null, paradas: [] });

  const loaded = useLoadScript(
    `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&v=weekly&language=pt-BR&region=BR`
  );

  // Ao carregar o componente, tenta ler a corrida ativa salva
  useEffect(() => {
    const carregarCorridaAtiva = async () => {
      try {
        const corridaSalva = await AsyncStorage.getItem("corridaAtiva");
        if (corridaSalva) {
          const corrida = JSON.parse(corridaSalva);
          const trajetos = corrida.trajetos || [];

          if (trajetos.length >= 2) {
            const origem = trajetos[0].endereco;
            const destino = trajetos[trajetos.length - 1].endereco;
            const intermediarias =
              trajetos.length > 2 ? trajetos.slice(1, -1).map((t: any) => t.endereco) : [];

            const formatar = (e: any) => ({
              lat: Number(e.endereco_latitude),
              lon: Number(e.endereco_longitude),
            });

            setRotaSalva({
              retirada: formatar(origem),
              destino: formatar(destino),
              paradas: intermediarias.map(formatar),
            });
          }
        }
      } catch (err) {
        console.error("❌ Erro ao carregar corrida ativa do AsyncStorage:", err);
      }
    };

    carregarCorridaAtiva();
  }, []);

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

  // Atualiza markers e rota quando props mudam OU rota salva é carregada
  useEffect(() => {
    const google = window.google;
    const map = mapInstanceRef.current;
    if (!loaded || !google || !map) return;

    // 🧹 LIMPA O MAPA se não houver rota (ex: corrida cancelada)
    if (!retirada && !destino && paradas.length === 0 && !rotaSalva.retirada && !rotaSalva.destino) {
      // Remove todos os marcadores
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      // Remove polilinha
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }

      // Limpa rota salva (para evitar re-render com dados antigos)
      setRotaSalva({ retirada: null, destino: null, paradas: [] });

      // Centraliza o mapa novamente
      map.setCenter({ lat: -23.55052, lng: -46.633308 });
      map.setZoom(12);

      // Reseta o resumo
      onResumoRota?.(null);

      return; // Sai do useEffect (não redesenha nada)
    }


    const origem = retirada || rotaSalva.retirada;
    const destinoFinal = destino || rotaSalva.destino;
    const paradasFinais = paradas.length > 0 ? paradas : rotaSalva.paradas;

    // Remove markers antigos
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Remove rota antiga
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const markers: any[] = [];

    // Adiciona marcador da retirada assim que houver
    if (origem) {
      const markerRetirada = new google.maps.Marker({
        position: { lat: origem.lat, lng: origem.lon },
        map,
        label: "R",
        title: "Retirada",
      });
      markers.push(markerRetirada);
      map.setCenter({ lat: origem.lat, lng: origem.lon });
      map.setZoom(14);
    }

    // Adiciona marcador de destino se já houver
    if (destinoFinal) {
      const markerDestino = new google.maps.Marker({
        position: { lat: destinoFinal.lat, lng: destinoFinal.lon },
        map,
        label: "D",
        title: "Destino",
      });
      markers.push(markerDestino);
    }

    // Adiciona paradas (se existirem)
    paradasFinais.forEach((p, idx) => {
      const markerParada = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lon },
        map,
        label: `${idx + 1}`,
        title: `Parada ${idx + 1}`,
      });
      markers.push(markerParada);
    });

    markersRef.current = markers;

    // Ajusta o mapa se tiver mais de um marcador
    if (markers.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend(m.getPosition()!));
      map.fitBounds(bounds);
    }

    // Desenha rota SOMENTE se houver origem e destino
    async function desenharRota() {
      if (!(origem && destinoFinal)) return;

      try {
        const rota = await buscarRota(origem, destinoFinal, paradasFinais);
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
  }, [
    loaded,
    retirada?.lat,
    retirada?.lon,
    destino?.lat,
    destino?.lon,
    JSON.stringify(paradas),
    JSON.stringify(rotaSalva),
  ]);


  return (
    <View className="w-full h-full bg-white rounded-xl overflow-hidden shadow-md">
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </View>
  );
};