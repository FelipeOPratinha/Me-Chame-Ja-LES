import { useState, useEffect } from "react";
import { View, ScrollView, ActivityIndicator, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Header } from "~/components/header";
import { Map } from "~/components/map";
import { SearchBar } from "~/components/searchbar";
import { VehicleList } from "~/components/vehiclelist";
import { CategoryList } from "~/components/categoryList";
import { RouteDetails } from "~/components/routeDetails";
import { TripList } from "~/components/tripList";
import { VehicleCard } from "~/components/vehicleCard";
import { FormVehicle } from "~/components/formVehicle";
import { FormItem } from "~/components/formItem";
import { deliveryApi } from "~/apis/deliveryApi";
import { FeedbackModal } from "~/components/feedbackModal";
import { TripDetails } from "~/components/tripDetails";

type ItemEntrega = {
  nome_item: string;
  quantidade: string;
  peso_kg: string;
  observacoes: string;
};

export default function Home() {
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showFormVehicle, setShowFormVehicle] = useState(false);
  const [showFormItem, setShowFormItem] = useState(false);

  // Estados do mapa
  const [retirada, setRetirada] = useState<{ lat: number; lon: number } | null>(null);
  const [paradas, setParadas] = useState<{ lat: number; lon: number }[]>([]);
  const [destino, setDestino] = useState<{ lat: number; lon: number } | null>(null);
  const [resumoRota, setResumoRota] = useState<{ distanciaKm: number; duracaoMin: number } | null>(null);

  // Estados da entrega / corrida
  const [tipoVeiculo, setTipoVeiculo] = useState<string | null>(null);
  const [tipoItem, setTipoItem] = useState<string | null>(null);
  const [valorCorrida, setValorCorrida] = useState<number | null>(null);
  const [corridaAtiva, setCorridaAtiva] = useState<any | null>(null);
  const [entregaId, setEntregaId] = useState<number | null>(null);

  // Feedback modal
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(true);

  // Carregar usuário logado
  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const dados = await AsyncStorage.getItem("usuarioLogado");
        if (dados) {
          const user = JSON.parse(dados);
          setUserType(user.type);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário logado:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarUsuario();
  }, []);

  // Extrai coordenadas "lat,lon" → objeto { lat, lon }
  const extrairCoordenadas = (endereco: string | null): { lat: number; lon: number } | null => {
    if (!endereco) return null;
    const partes = endereco.split(",");
    if (partes.length < 2) return null;
    const lat = parseFloat(partes[0]);
    const lon = parseFloat(partes[1]);
    if (isNaN(lat) || isNaN(lon)) return null;
    return { lat, lon };
  };

  // Ao confirmar o formulário de itens
  const handleSubmitItens = async (itens: ItemEntrega[]) => {
    try {
      const dadosUsuario = await AsyncStorage.getItem("usuarioLogado");
      if (!dadosUsuario) {
        setFeedbackMessage("Usuário não encontrado. Faça login novamente.");
        setFeedbackSuccess(false);
        setFeedbackVisible(true);
        return;
      }

      const user = JSON.parse(dadosUsuario);

      const tipoNormalizado = (tipoItem || "outros")
        .toLowerCase()
        .replace(/\s+/g, "_")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const entrega = {
        requesterId: user.id,
        status: "pendente",
        type: tipoNormalizado,
        vehicleType: tipoVeiculo?.toLowerCase() || "outro",
        originAddress: `${retirada?.lat},${retirada?.lon}`,
        destinationAddress: `${destino?.lat},${destino?.lon}`,
        value: Number((valorCorrida ?? 0).toFixed(2)),
        description: `Entrega de ${tipoItem}`,
        items: itens.map((item) => ({
          name: item.nome_item,
          quantity: item.quantidade,
          weight: parseFloat(item.peso_kg.replace(/[^\d.]/g, "")),
          remarks: item.observacoes,
        })),
      };

      const resp = await deliveryApi.saveDelivery(entrega);

      // Se o backend retornar o ID da entrega, guarda pra exibir TripDetails
      if (resp.data?.data?.id) {
        setEntregaId(resp.data.data.id);
      }

      setFeedbackMessage("Entrega solicitada com sucesso!");
      setFeedbackSuccess(true);
      setFeedbackVisible(true);
      setShowFormItem(false);
    } catch (error) {
      console.error("❌ Erro ao cadastrar entrega:", error);
      setFeedbackMessage("Erro ao solicitar entrega. Verifique os dados e tente novamente.");
      setFeedbackSuccess(false);
      setFeedbackVisible(true);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#5E60CE" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#4EA8DE", "#5E60CE", "#4EA8DE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1 }}
    >
      <View className="flex-1">
        <Header />

        {/* Corpo principal */}
        <View className="flex-1 flex-col xl:flex-row">
          {/* Mapa */}
          <View className="xl:flex-[2] min-h-48 m-1">
            <Map
              retirada={
                corridaAtiva
                  ? extrairCoordenadas(corridaAtiva.originAddress)
                  : retirada
              }
              paradas={[]}
              destino={
                corridaAtiva
                  ? extrairCoordenadas(corridaAtiva.destinationAddress)
                  : destino
              }
              onResumoRota={setResumoRota}
            />
          </View>

          {/* Painel lateral */}
          <View className="flex-1">
            <ScrollView
              contentContainerClassName="flex flex-col gap-4 m-1"
              showsVerticalScrollIndicator={true}
            >
              {userType === "solicitante" ? (
                <>
                  {!entregaId ? (
                    <>
                      <SearchBar
                        onSetRetirada={setRetirada}
                        onSetParadas={setParadas}
                        onSetDestino={setDestino}
                      />
                      <VehicleList onSelectVehicle={setTipoVeiculo} />
                      <CategoryList onSelectCategory={setTipoItem} />
                      {resumoRota && (
                        <RouteDetails
                          distanciaKm={resumoRota.distanciaKm}
                          duracaoMin={resumoRota.duracaoMin}
                          onConfirmar={(valor) => {
                            setValorCorrida(valor);
                            setShowFormItem(true);
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <TripDetails
                      deliveryId={entregaId}
                      onVoltar={() => setEntregaId(null)}
                    />
                  )}
                </>
              ) : (
                <>
                  <TripList onTripAccepted={setCorridaAtiva} />
                  <VehicleCard onAddVehicle={() => setShowFormVehicle(true)} />
                </>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Modal de cadastro de veículo */}
        <Modal
          visible={showFormVehicle}
          animationType="slide"
          transparent
          onRequestClose={() => setShowFormVehicle(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-4">
            <View className="w-full max-w-2xl bg-transparent rounded-2xl p-5">
              <FormVehicle goBack={() => setShowFormVehicle(false)} />
            </View>
          </View>
        </Modal>

        {/* Modal de itens da entrega */}
        <Modal
          visible={showFormItem}
          animationType="slide"
          transparent
          onRequestClose={() => setShowFormItem(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-4">
            <View
              className="w-full max-w-2xl rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "white",
                maxHeight: "85%",
              }}
            >
              {/* aqui o conteúdo do formulário */}
              <FormItem
                goBack={() => setShowFormItem(false)}
                onConfirmar={handleSubmitItens}
              />
            </View>
          </View>
        </Modal>

        {/* Feedback */}
        <FeedbackModal
          visible={feedbackVisible}
          message={feedbackMessage}
          success={feedbackSuccess}
          onClose={() => setFeedbackVisible(false)}
        />
      </View>
    </LinearGradient>
  );
}