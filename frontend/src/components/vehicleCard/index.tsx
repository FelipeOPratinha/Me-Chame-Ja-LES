import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

type VehicleCardProps = {
  onAddVehicle: () => void;
};

export function VehicleCard({ onAddVehicle }: VehicleCardProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSelectModal, setShowSelectModal] = useState(false);

  // Carrega veículos do motorista logado
  useEffect(() => {
    const carregarVeiculos = async () => {
      try {
        const userData = await AsyncStorage.getItem("usuarioLogado");
        if (!userData) return;

        const user = JSON.parse(userData);
        if (user?.type !== "motorista") return;

        const response = await axios.get("http://localhost:3000/vehicle/getAll");
        const allVehicles = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const userVehicles = allVehicles.filter((v: any) => v.userId === user.id);
        setVehicles(userVehicles);

        const savedVehicleId = await AsyncStorage.getItem("veiculoSelecionado");
        if (savedVehicleId) {
          const found = userVehicles.find(
            (v: { id: number }) => v.id === Number(savedVehicleId)
          );
          if (found) setSelectedVehicle(found);
        } else if (userVehicles.length > 0) {
          setSelectedVehicle(userVehicles[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar veículos:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarVeiculos();

    // Escuta evento global e recarrega veículos automaticamente
    const atualizarAoCadastrar = () => carregarVeiculos();
    window.addEventListener("novoVeiculoCadastrado", atualizarAoCadastrar);

    return () => {
      window.removeEventListener("novoVeiculoCadastrado", atualizarAoCadastrar);
    };
  }, []);

  // Seleciona e salva o veículo
  const handleSelectVehicle = async (vehicle: any) => {
    setSelectedVehicle(vehicle);
    await AsyncStorage.setItem("veiculoSelecionado", vehicle.id.toString());
    window.dispatchEvent(new Event("veiculoSelecionadoAtualizado"));
    setShowSelectModal(false);
  };

  return (
    <View className="w-full mt-4">
      <View className="flex-row items-center justify-center px-4 mb-3 bg-white rounded-xl shadow p-2">
        <Text className="text-base font-semibold text-[#5E60CE]">
          Lista de veículos
        </Text>
      </View>

      <View className="bg-white rounded-2xl shadow-lg p-2">
        {/* Header */}
        <View className="flex-row justify-between items-center p-2 bg-gradient-to-r from-[#5E60CE] to-[#4EA8DE] rounded-t-2xl">
          <Text className="text-white font-bold text-sm">
            Veículo Ativo
          </Text>
          <View className="bg-white/20 p-1 rounded-lg">
            <Ionicons name="car" size={20} color="#fff" />
          </View>
        </View>

        {/* Corpo */}
        <View className="bg-white rounded-b-2xl shadow-lg p-4">
          {loading ? (
            <View className="items-center justify-center py-6">
              <ActivityIndicator size="large" color="#5E60CE" />
              <Text className="mt-2 text-gray-600">Carregando veículo...</Text>
            </View>
          ) : selectedVehicle ? (
            <>
              {/* Informações principais */}
              <View className="space-y-1 mb-2">
                <Text className="text-lg font-bold text-gray-800 text-center">
                  {selectedVehicle.manufacturer} {selectedVehicle.model}{" "}
                  <Text className="text-gray-500">({selectedVehicle.year})</Text>
                </Text>
                <Text className="text-center text-gray-600">
                  Placa:{" "}
                  <Text className="font-semibold text-gray-800">
                    {selectedVehicle.licensePlate}
                  </Text>
                </Text>
              </View>

              {/* Detalhes com ícones */}
              <View className="flex-row flex-wrap justify-center gap-x-4 mt-2">
                <View className="flex-row items-center p-1 rounded-lg hover:bg-slate-200">
                  <Ionicons name="barbell" size={18} color="#5E60CE" />
                  <Text className="text-xs text-gray-700 ml-1">
                    {selectedVehicle.capacity} kg
                  </Text>
                </View>
                <View className="flex-row items-center p-1 rounded-lg hover:bg-slate-200">
                  <Ionicons name="speedometer" size={18} color="#5E60CE" />
                  <Text className="text-xs text-gray-700 ml-1 capitalize">
                    {selectedVehicle.type}
                  </Text>
                </View>
                <View className="flex-row items-center p-1 rounded-lg hover:bg-slate-200">
                  <Ionicons name="color-palette" size={18} color="#5E60CE" />
                  <Text className="text-xs text-gray-700 ml-1">
                    {selectedVehicle.color || "Cor não informada"}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View className="items-center py-6">
              <Ionicons name="alert-circle" size={28} color="#5E60CE" />
              <Text className="text-gray-500 mt-2">
                Nenhum veículo selecionado
              </Text>
            </View>
          )}

          {/* Ações */}
          <View className="flex-row justify-around mt-5">
            <Pressable
              onPress={() => setShowSelectModal(true)}
              className="flex-row items-center justify-center bg-blue-500 w-fit px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Text className="text-white font-semibold">
                Selecionar Veículo
              </Text>
            </Pressable>

            <Pressable
              onPress={onAddVehicle}
              className="flex-row items-center justify-center bg-indigo-500 w-fit px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Text className="text-white font-semibold">
                Novo Veículo
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Modal de Seleção */}
        <Modal
          visible={showSelectModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSelectModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center p-6">
            <View className="w-full max-w-2xl bg-white rounded-2xl p-5 max-h-[80%] shadow-lg">
              <Text className="text-lg font-bold text-[#5E60CE] mb-4 text-center">
                Selecione seu veículo
              </Text>

              <ScrollView>
                {vehicles.length > 0 ? (
                  vehicles.map((v) => (
                    <Pressable
                      key={v.id}
                      onPress={() => handleSelectVehicle(v)}
                      className={`p-4 rounded-xl mb-3 border-2 transition-all duration-200 ${
                        selectedVehicle?.id === v.id
                          ? "border-indigo-500 bg-violet-50 hover:border-indigo-700 hover:bg-violet-200"
                          : "border-gray-300 bg-white hover:border-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="text-base font-semibold text-gray-800">
                            {v.manufacturer} {v.model}
                          </Text>
                          <Text className="text-xs text-gray-600">
                            Placa: {v.licensePlate}
                          </Text>
                          <Text className="text-xs text-gray-600 capitalize">
                            Tipo: {v.type}
                          </Text>
                        </View>
                        <Ionicons
                          name={
                            selectedVehicle?.id === v.id
                              ? "checkmark-circle"
                              : "speedometer"
                          }
                          size={24}
                          color={
                            selectedVehicle?.id === v.id ? "#5E60CE" : "#888"
                          }
                        />
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <Text className="text-gray-500 text-center mt-6">
                    Nenhum veículo cadastrado.
                  </Text>
                )}
              </ScrollView>

              <Pressable
                onPress={() => setShowSelectModal(false)}
                className="bg-blue-500 w-fit min-w-24 mx-auto p-3 rounded-xl shadow-md hover:bg-blue-700"
              >
                <Text className="text-white font-semibold text-center">
                  Voltar
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}