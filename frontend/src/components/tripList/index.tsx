import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { FeedbackModal } from "~/components/feedbackModal";

const { height } = Dimensions.get("window");

const enderecoCache: Record<string, string> = {};
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getEnderecoGoogle = async (coords: string): Promise<string> => {
  try {
    if (!coords) return "Endereço desconhecido";
    if (!/^[-]?\d+(\.\d+)?\s*,\s*[-]?\d+(\.\d+)?$/.test(coords.trim())) return coords;

    if (enderecoCache[coords]) return enderecoCache[coords];
    const cacheSalvo = await AsyncStorage.getItem(`geocode_${coords}`);
    if (cacheSalvo) {
      enderecoCache[coords] = cacheSalvo;
      return cacheSalvo;
    }

    const [lat, lon] = coords.split(",");
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat.trim()},${lon.trim()}&key=${apiKey}`
    );
    const data = await res.json();
    await delay(150);

    if (data.status === "OK" && data.results.length > 0) {
      const endereco = data.results[0].formatted_address;
      enderecoCache[coords] = endereco;
      await AsyncStorage.setItem(`geocode_${coords}`, endereco);
      return endereco;
    }
    return coords;
  } catch {
    return coords;
  }
};

export function TripList({ onTripAccepted }: { onTripAccepted?: (trip: any) => void }) {
  const [trips, setTrips] = useState<any[]>([]);
  const [activeTrip, setActiveTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvendoEnderecos, setResolvendoEnderecos] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(true);
  const carregandoRef = useRef(false);

  // Busca corridas compatíveis com o veículo
  const carregarCorridas = async () => {
    if (carregandoRef.current) return;
    carregandoRef.current = true;
    setIsRefreshing(true);

    try {
      const userData = await AsyncStorage.getItem("usuarioLogado");
      if (!userData) return;
      const user = JSON.parse(userData);

      const vehicleResponse = await axios.get("http://localhost:3000/vehicle/getAll");
      const veiculos = vehicleResponse.data?.data || [];
      const veiculoMotorista = veiculos.find((v: any) => v.userId === user.id);
      const tipoVeiculoMotorista = veiculoMotorista?.type?.toLowerCase();

      const response = await axios.get("http://localhost:3000/delivery/getAll");
      const entregas = Array.isArray(response.data?.data) ? response.data.data : [];

      const pendentes = entregas.filter(
        (e: any) =>
          e.status === "pendente" &&
          (!e.vehicleType || e.vehicleType.toLowerCase() === tipoVeiculoMotorista)
      );

      setResolvendoEnderecos(true);
      const atualizadas: any[] = [];
      for (const e of pendentes) {
        const origem = await getEnderecoGoogle(e.originAddress);
        const destino = await getEnderecoGoogle(e.destinationAddress);
        atualizadas.push({ ...e, originAddress: origem, destinationAddress: destino });
      }

      setTrips(atualizadas);
      setResolvendoEnderecos(false);
    } catch (err) {
      console.error("❌ Erro ao buscar entregas:", err);
      setFeedbackMessage("Erro ao carregar corridas disponíveis.");
      setFeedbackSuccess(false);
      setFeedbackVisible(true);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      carregandoRef.current = false;
    }
  };

  // Atualiza status da entrega (aceita, pendente, concluída)
  const atualizarStatusCorrida = async (trip: any, novoStatus: string) => {
    try {
      const userData = await AsyncStorage.getItem("usuarioLogado");
      if (!userData) throw new Error("Usuário não encontrado.");

      const user = JSON.parse(userData);

      const payload = {
        id: trip.id,
        driverId: user.id,
        requesterId: trip.requesterId,
        status: novoStatus,
        type: trip.type,
        originAddress: trip.originAddress,
        destinationAddress: trip.destinationAddress,
        value: trip.value,
        items: trip.items || [],
      };

      const response = await axios.post("http://localhost:3000/delivery/update", payload);

      if (response.data?.status !== 200) {
        throw new Error("Falha ao atualizar status da entrega.");
      }

      // Atualiza estados e feedback com base no novo status
      switch (novoStatus) {
        case "aceita":
          setActiveTrip(trip);
          setTrips([]);
          await AsyncStorage.setItem("corridaAtiva", JSON.stringify(trip)); // <-- salva no storage
          onTripAccepted?.(trip);
          break;

        case "pendente":
          setActiveTrip(null);
          await AsyncStorage.removeItem("corridaAtiva"); // <-- limpa se cancelar
          onTripAccepted?.(null);
          await carregarCorridas();
          setFeedbackMessage("Entrega cancelada e devolvida à lista.");
          break;

        case "concluida":
          setShowQRCode(true);
          await AsyncStorage.removeItem("corridaAtiva"); // <-- limpa ao concluir
          setFeedbackMessage("Entrega concluída com sucesso!");
          break;

        default:
          setFeedbackMessage("Status atualizado.");
      }

      setFeedbackSuccess(true);
      setFeedbackVisible(true);
    } catch (err: any) {
      console.error("❌ Erro ao atualizar status:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Erro inesperado ao atualizar a entrega.";
      setFeedbackMessage(`❌ ${msg}`);
      setFeedbackSuccess(false);
      setFeedbackVisible(true);
    }
  };

  useEffect(() => {
    const carregarCorridaAtiva = async () => {
      try {
        const corridaSalva = await AsyncStorage.getItem("corridaAtiva");
        if (corridaSalva) {
          const trip = JSON.parse(corridaSalva);
          setActiveTrip(trip);
          onTripAccepted?.(trip);
        } else {
          await carregarCorridas();
        }
      } catch (error) {
        console.error("❌ Erro ao carregar corrida ativa:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarCorridaAtiva();
  }, []);

  // Loader
  if (loading || resolvendoEnderecos)
    return (
      <View className="w-full mt-4 bg-white rounded-2xl shadow-lg p-8 items-center justify-center">
        <ActivityIndicator size="large" color="#5E60CE" />
        <Text className="mt-2 text-gray-600">
          {resolvendoEnderecos ? "Resolvendo endereços..." : "Carregando corridas..."}
        </Text>
      </View>
    );

  // Corrida ativa
  if (activeTrip && !showQRCode) {
    return (
      <ScrollView className="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <Text className="text-lg font-bold text-[#5E60CE] mb-4 text-center">
          Corrida em Andamento
        </Text>

        <Text className="text-gray-800 font-semibold mb-1">Origem:</Text>
        <Text className="text-gray-600 mb-2">{activeTrip.originAddress}</Text>

        <Text className="text-gray-800 font-semibold mb-1">Destino:</Text>
        <Text className="text-gray-600 mb-2">{activeTrip.destinationAddress}</Text>

        <Text className="text-gray-800 font-semibold mb-1">Categoria:</Text>
        <Text className="text-gray-600 mb-2">
          {activeTrip.type?.replaceAll("_", " ") || "Não informado"}
        </Text>

        <Text className="text-gray-800 font-semibold mb-1">Valor:</Text>
        <Text className="text-gray-600 mb-4">
          R$ {parseFloat(activeTrip.value || 0).toFixed(2)}
        </Text>

        <View className="flex-row justify-end gap-3 mt-3">
          <Pressable
            onPress={() => atualizarStatusCorrida(activeTrip, "pendente")}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Cancelar Corrida</Text>
          </Pressable>

          <Pressable
            onPress={() => atualizarStatusCorrida(activeTrip, "concluida")}
            className="bg-green-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Concluir Corrida</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // QR Code de pagamento
  if (showQRCode && activeTrip) {
    const fakePixLink = `https://pagamento.pix/${activeTrip.id}-${activeTrip.value}`;
    return (
      <View className="bg-white rounded-2xl shadow-lg p-6 mt-4 items-center">
        <Text className="text-lg font-bold text-[#5E60CE] mb-4 text-center">
          Corrida Concluída
        </Text>

        <Image
          source={{
            uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${fakePixLink}`,
          }}
          style={{ width: 200, height: 200, marginBottom: 20 }}
        />

        <Text className="text-gray-800 text-center mb-3">Valor da Corrida:</Text>
        <Text className="text-xl font-bold text-[#5E60CE] mb-4">
          R$ {parseFloat(activeTrip.value || 0).toFixed(2)}
        </Text>

        <Text className="text-gray-500 text-center mb-4">{fakePixLink}</Text>

        <Pressable
          onPress={() => {
            setActiveTrip(null);
            setShowQRCode(false);
            onTripAccepted?.(null);
            carregarCorridas();
          }}
          className="bg-[#5E60CE] px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Voltar às Corridas</Text>
        </Pressable>
      </View>
    );
  }

  // Lista padrão
  return (
    <View className="w-full mt-4 relative">
      <View className="flex-row items-center justify-between px-4 mb-3 bg-white rounded-xl shadow p-2">
        <Text className="text-base font-semibold text-[#5E60CE]">Corridas Disponíveis</Text>
        <Pressable
          onPress={carregarCorridas}
          disabled={isRefreshing}
          className={`flex-row items-center px-3 py-2 rounded-lg ${
            isRefreshing ? "bg-gray-300" : "bg-[#5E60CE]"
          }`}
        >
          <Ionicons name="refresh-outline" size={16} color="white" />
          <Text className="text-white ml-2">
            {isRefreshing ? "Atualizando..." : "Atualizar"}
          </Text>
        </Pressable>
      </View>

      <View className="bg-white rounded-2xl shadow-lg p-4">
        {trips.length > 0 ? (
          <FlatList
            data={trips}
            keyExtractor={(item, index) => String(item.id ?? index)}
            renderItem={({ item }) => (
              <View className="border-b border-gray-200 py-3">
                <Text className="font-semibold text-gray-800">
                  {item.originAddress} ➜ {item.destinationAddress}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Categoria: {item.type?.replaceAll("_", " ") || "Não informado"}
                </Text>
                <Text className="text-sm text-gray-500">
                  Tipo de Veículo: {item.vehicleType || "Não especificado"}
                </Text>

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-sm text-gray-600">
                    Valor: R$ {parseFloat(item.value || 0).toFixed(2)}
                  </Text>

                  <Pressable
                    onPress={() => atualizarStatusCorrida(item, "aceita")}
                    className="flex-row items-center bg-green-600 px-3 py-1 rounded-lg active:bg-green-700"
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                    <Text className="text-white ml-2 text-sm">Aceitar</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        ) : (
          <View className="items-center py-6">
            <Text className="text-gray-500 text-center">
              Nenhuma corrida disponível.
            </Text>
          </View>
        )}
      </View>

      <FeedbackModal
        visible={feedbackVisible}
        message={feedbackMessage}
        success={feedbackSuccess}
        onClose={() => setFeedbackVisible(false)}
      />
    </View>
  );
}