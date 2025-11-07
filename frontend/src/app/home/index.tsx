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
import { FeedbackModal } from "~/components/feedbackModal";
import { TripDetails } from "~/components/tripDetails";
import axios from "axios";

// =====================================================
// Tipos auxiliares
// =====================================================
type ItemEntrega = {
  nome_item: string;
  quantidade: string;
  peso_kg: string;
  observacoes: string;
};

type EnderecoCompleto = {
  lat: number;
  lon: number;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  endereco_formatado?: string;
};

// =====================================================
// Componente principal
// =====================================================
export default function Home() {
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showFormVehicle, setShowFormVehicle] = useState(false);
  const [showFormItem, setShowFormItem] = useState(false);

  // Estados do mapa
  const [retirada, setRetirada] = useState<EnderecoCompleto | null>(null);
  const [paradas, setParadas] = useState<EnderecoCompleto[]>([]);
  const [destino, setDestino] = useState<EnderecoCompleto | null>(null);
  const [dataAgendada, setDataAgendada] = useState<Date | null>(null);
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

  // =====================================================
  // Carrega usuário logado
  // =====================================================
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

  // =====================================================
  // Função de envio dos itens
  // =====================================================
  function formatarDataLocal(date: Date | null) {
    if (!date) return null;
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 19).replace("T", " ");
  }

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

      // Mapeamento de estados → siglas
      const mapaSiglas: Record<string, string> = {
        "Acre": "AC",
        "Alagoas": "AL",
        "Amapá": "AP",
        "Amazonas": "AM",
        "Bahia": "BA",
        "Ceará": "CE",
        "Distrito Federal": "DF",
        "Espírito Santo": "ES",
        "Goiás": "GO",
        "Maranhão": "MA",
        "Mato Grosso": "MT",
        "Mato Grosso do Sul": "MS",
        "Minas Gerais": "MG",
        "Pará": "PA",
        "Paraíba": "PB",
        "Paraná": "PR",
        "Pernambuco": "PE",
        "Piauí": "PI",
        "Rio de Janeiro": "RJ",
        "Rio Grande do Norte": "RN",
        "Rio Grande do Sul": "RS",
        "Rondônia": "RO",
        "Roraima": "RR",
        "Santa Catarina": "SC",
        "São Paulo": "SP",
        "Sergipe": "SE",
        "Tocantins": "TO",
      };

      // Função auxiliar para pegar sigla ou manter valor original
      function getSigla(estado?: string) {
        if (!estado) return "";
        return mapaSiglas[estado] || estado;
      }

      // Entrega principal
      const entrega = {
        entrega_valor: Number((valorCorrida ?? 0).toFixed(2)),
        entrega_status: "pagamento",
        entrega_descricao: `Entrega de ${tipoItem}`,
        entrega_tipo_categoria: tipoNormalizado,
        entrega_tipo_transporte: tipoVeiculo?.toLowerCase() || "outro",
        entrega_data_agendada: formatarDataLocal(dataAgendada),
        entrega_data_finalizacao: null,
        veiculo_id: null,
        motorista_id: null,
        solicitante_id: user.id,
      };

      // Trajetos (endereços completos)
      const trajetos: any[] = [];

      if (retirada) {
        trajetos.push({
          trajeto_ordem: 1,
          endereco: {
            endereco_logradouro:
              retirada.logradouro ||
              retirada.endereco_formatado?.split(",")[0] ||
              "Ponto de retirada",
            endereco_numero: retirada.numero || "",
            endereco_bairro: retirada.bairro || "",
            endereco_cidade: retirada.cidade || "",
            endereco_estado: getSigla(retirada.estado) || "",
            endereco_cep: retirada.cep || "",
            endereco_latitude: retirada.lat,
            endereco_longitude: retirada.lon,
          },
        });
      }

      paradas.forEach((p, i) => {
        trajetos.push({
          trajeto_ordem: trajetos.length + 1,
          endereco: {
            endereco_logradouro:
              p.logradouro ||
              p.endereco_formatado?.split(",")[0] ||
              `Parada ${i + 1}`,
            endereco_numero: p.numero || "",
            endereco_bairro: p.bairro || "",
            endereco_cidade: p.cidade || "",
            endereco_estado: getSigla(p.estado) || "",
            endereco_cep: p.cep || "",
            endereco_latitude: p.lat,
            endereco_longitude: p.lon,
          },
        });
      });

      if (destino) {
        trajetos.push({
          trajeto_ordem: trajetos.length + 1,
          endereco: {
            endereco_logradouro:
              destino.logradouro ||
              destino.endereco_formatado?.split(",")[0] ||
              "Ponto de destino",
            endereco_numero: destino.numero || "",
            endereco_bairro: destino.bairro || "",
            endereco_cidade: destino.cidade || "",
            endereco_estado: getSigla(destino.estado) || "",
            endereco_cep: destino.cep || "",
            endereco_latitude: destino.lat,
            endereco_longitude: destino.lon,
          },
        });
      }

      // Itens
      const itens_entrega = itens.map((item) => ({
        item_entrega_nome: item.nome_item,
        item_entrega_pesagem: parseFloat(item.peso_kg.replace(/[^\d.]/g, "")) || 0,
        item_entrega_quantidade: parseInt(item.quantidade) || 0,
        item_entrega_observacoes: item.observacoes || "",
      }));

      const payload = { entrega, trajetos, itens_entrega };

      /* console.log("Enviando payload para o backend:");
      console.log(JSON.stringify(payload, null, 2)); */

      const response = await axios.post("http://localhost:3000/delivery/save", payload);

      if (response.data?.success || response.status === 200) {
        setFeedbackMessage("Entrega cadastrada com sucesso!");
        setFeedbackSuccess(true);
        setFeedbackVisible(true);

        // Fecha modal e reseta estados após sucesso
        setTimeout(() => {
          setShowFormItem(false);
          setRetirada(null);
          setParadas([]);
          setDestino(null);
          setDataAgendada(null);
          setValorCorrida(null);
          setTipoVeiculo(null);
          setTipoItem(null);
        }, 1500);
      } else {
        setFeedbackMessage("Erro ao cadastrar entrega. Verifique os dados e tente novamente.");
        setFeedbackSuccess(false);
        setFeedbackVisible(true);
      }
    } catch (error) {
      console.error("❌ Erro ao cadastrar entrega:", error);
      setFeedbackMessage("Erro ao se comunicar com o servidor.");
      setFeedbackSuccess(false);
      setFeedbackVisible(true);
    }
  };

  // =====================================================
  // Renderização principal
  // =====================================================
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
              retirada={retirada}
              paradas={paradas}
              destino={destino}
              onResumoRota={setResumoRota}
            />
          </View>

          {/* Painel lateral */}
          <View className="flex-1">
            <ScrollView contentContainerClassName="flex flex-col gap-4 m-1" showsVerticalScrollIndicator={true}>
              {userType === "solicitante" ? (
                <>
                  {!entregaId ? (
                    <>
                      <SearchBar
                        onSetRetirada={setRetirada}
                        onSetParadas={setParadas}
                        onSetDestino={setDestino}
                        onSetDataAgendada={setDataAgendada}
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
                    <TripDetails deliveryId={entregaId} onVoltar={() => setEntregaId(null)} />
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
            <View className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ backgroundColor: "white", maxHeight: "85%" }}>
              <FormItem goBack={() => setShowFormItem(false)} onConfirmar={handleSubmitItens} />
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