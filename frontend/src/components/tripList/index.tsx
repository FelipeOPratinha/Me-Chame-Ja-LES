import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { FeedbackModal } from "~/components/feedbackModal";

const { height } = Dimensions.get("window");

export function TripList({ onTripAccepted }: { onTripAccepted?: (trip: any) => void }) {
  const [trips, setTrips] = useState<any[]>([]);
  const [activeTrip, setActiveTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvendoEnderecos, setResolvendoEnderecos] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [requesterName, setRequesterName] = useState<string | null>(null);
  const carregandoRef = useRef(false);

  // =============================================================
  // Estados e controle de paradas — sempre no topo (Corrida ativa)
  // =============================================================
  const [paradaAtual, setParadaAtual] = useState(0);

  useEffect(() => {
    if (!activeTrip || !activeTrip.trajetos) return;

    const paradasIntermediarias =
      activeTrip.trajetos.length > 2 ? activeTrip.trajetos.slice(1, -1) : [];

    if (paradasIntermediarias.length === 0) return;

    const intervalo = setInterval(() => {
      setParadaAtual((prev) =>
        prev === paradasIntermediarias.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(intervalo);
  }, [activeTrip]);

  // Escuta mudanças no veículo selecionado e recarrega as corridas
  useEffect(() => {
    const atualizarListaQuandoTrocarVeiculo = () => {
      
      carregarCorridas();
    };

    // Ouve evento emitido pelo VehicleCard
    window.addEventListener("veiculoSelecionadoAtualizado", atualizarListaQuandoTrocarVeiculo);

    // Limpa o listener quando o componente for desmontado
    return () => {
      window.removeEventListener("veiculoSelecionadoAtualizado", atualizarListaQuandoTrocarVeiculo);
    };
  }, []);


  // =============================================================
  // Função: Carrega corridas disponíveis (entregas pendentes)
  // =============================================================
  const carregarCorridas = async () => {
    if (carregandoRef.current) return;
    carregandoRef.current = true;
    setIsRefreshing(true);

    try {
      const userData = await AsyncStorage.getItem("usuarioLogado");
      if (!userData) return;
      const user = JSON.parse(userData);

      // Busca todos os veículos e o veículo selecionado
      const veiculoRes = await axios.get("http://localhost:3000/vehicle/getAll");
      const veiculos = veiculoRes.data?.data || [];

      // Lê o id do veículo selecionado no AsyncStorage
      const veiculoSelecionadoId = await AsyncStorage.getItem("veiculoSelecionado");
      let veiculoSelecionado = null;

      if (veiculoSelecionadoId) {
        veiculoSelecionado = veiculos.find(
          (v: any) => v.id === Number(veiculoSelecionadoId)
        );
      }

      // Caso não exista veículo selecionado, busca o primeiro veículo do motorista logado
      if (!veiculoSelecionado) {
        veiculoSelecionado =
          veiculos.find((v: any) => v.userId === user.usuario_id) ||
          veiculos.find((v: any) => v.usuario_id === user.usuario_id);
      }

      // Determina o tipo do veículo selecionado
      const tipoVeiculoMotorista =
        veiculoSelecionado?.type?.toLowerCase() ||
        veiculoSelecionado?.veiculo_tipo?.toLowerCase() ||
        null;

      // Busca entregas (agora vem como [{ entrega, trajetos, itens_entrega }])
      const entregasRes = await axios.get("http://localhost:3000/delivery/getAll");
      const data = entregasRes.data?.data || [];

      // Converte a estrutura para um formato mais simples e padroniza os nomes
      const entregasFormatadas = data.map((item: any) => ({
        entrega_id: item.entrega.id,
        entrega_valor: item.entrega.entrega_valor,
        entrega_status: item.entrega.entrega_status,
        entrega_descricao: item.entrega.entrega_descricao,
        entrega_tipo_categoria: item.entrega.entrega_tipo_categoria,
        entrega_tipo_transporte: item.entrega.entrega_tipo_transporte,
        entrega_data_agendada: item.entrega.entrega_data_agendada,
        entrega_data_finalizacao: item.entrega.entrega_data_finalizacao,
        veiculo_id: item.entrega.veiculo_id,
        motorista_id: item.entrega.motorista_id,
        solicitante_id: item.entrega.solicitante_id,
        trajetos: item.trajetos || [],
        itens_entrega: item.itens_entrega || [],
      }));

      // Filtra pendentes compatíveis com o tipo do veículo
      const pendentes = entregasFormatadas.filter(
        (e: any) =>
          e.entrega_status === "pendente" &&
          (!e.entrega_tipo_transporte ||
            e.entrega_tipo_transporte.toLowerCase() === tipoVeiculoMotorista)
      );

      setResolvendoEnderecos(true);
      const atualizadas: any[] = [];

      // Monta endereços (origem e destino) a partir de trajetos
      for (const e of pendentes) {
        if (!e.trajetos || e.trajetos.length === 0) continue;

        const origem = e.trajetos[0].endereco;
        const destino = e.trajetos[e.trajetos.length - 1].endereco;

        const origemTexto = `${origem.endereco_logradouro} ${origem.endereco_numero || ""}, ${origem.endereco_bairro} - ${origem.endereco_cidade}`;
        const destinoTexto = `${destino.endereco_logradouro} ${destino.endereco_numero || ""}, ${destino.endereco_bairro} - ${destino.endereco_cidade}`;

        atualizadas.push({
          ...e,
          originAddress: origemTexto,
          destinationAddress: destinoTexto,
        });
      }

      setTrips(atualizadas);
    } catch (err) {
      console.error("❌ Erro ao buscar entregas:", err);
      setFeedbackMessage("Erro ao carregar corridas disponíveis.");
      setFeedbackSuccess(false);
      setFeedbackVisible(true);
    } finally {
      setResolvendoEnderecos(false);
      setLoading(false);
      setIsRefreshing(false);
      carregandoRef.current = false;
    }
  };

  // =============================================================
  // Função: Atualiza o status da entrega (aceitar, cancelar, concluir)
  // =============================================================
  const atualizarStatusCorrida = async (trip: any, novoStatus: string) => {
    try {
      const userData = await AsyncStorage.getItem("usuarioLogado");
      const vehicleData = await AsyncStorage.getItem("veiculoSelecionado");
      if (!userData) throw new Error("Usuário não encontrado.");

      const user = JSON.parse(userData);

      // Interpreta o veículo salvo
      let vehicle;
      try {
        const parsed = JSON.parse(vehicleData || "null");
        vehicle = typeof parsed === "object" ? parsed : { id: Number(parsed) };
      } catch {
        vehicle = { id: Number(vehicleData) };
      }

      // Monta payload base entrega
      const payload: any = {
        id: trip.entrega_id,
        entrega_status: novoStatus,
      };

      // Lógica específica conforme ação
      if (novoStatus === "aceita") {
        payload.motorista_id = user.id || user.usuario_id;
        payload.veiculo_id = vehicle?.id || null;
      } else if (novoStatus === "pendente") {
        payload.motorista_id = null;
        payload.veiculo_id = null;
      } else if (novoStatus === "concluida") {
        payload.motorista_id = user.id || user.usuario_id;
        payload.veiculo_id = vehicle?.id || null;
        const agora = new Date();
        const offsetMs = agora.getTimezoneOffset() * 60000; // diferença do UTC local
        const spDate = new Date(agora.getTime() - offsetMs - 3 * 60 * 60 * 1000); // força -3h
        const formatoSP = spDate.toISOString().slice(0, 19).replace("T", " ");
        payload.entrega_data_finalizacao = formatoSP;

        try {
          const solicitanteRes = await axios.get(
            `http://localhost:3000/user/getById?id=${trip.solicitante_id}`
          );

          const solicitante = solicitanteRes.data?.data;
          const pontosAtuais = solicitante?.loyaltyPoints || 0;
          const novosPontos = pontosAtuais + 10;

          await axios.post("http://localhost:3000/user/update", {
            id: trip.solicitante_id,
            type: solicitante.type,
            name: solicitante.name,
            email: solicitante.email,
            password: solicitante.password,
            loyaltyPoints: novosPontos,
          });
        } catch (error) {
          console.error("❌ Falha ao adicionar pontos de fidelidade:", error);
        }

      }

      // Envia pro backend
      const response = await axios.post("http://localhost:3000/delivery/update", payload);

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || "Falha ao atualizar status da entrega.");

      // Atualiza interface conforme o status
      switch (novoStatus) {
        case "aceita":
          setActiveTrip(trip);
          setTrips([]);
          // Garante que trajetos e endereços estejam completos antes de salvar
          if (trip.trajetos && trip.trajetos.length > 0) {
            const origem = trip.trajetos[0].endereco;
            const destino = trip.trajetos[trip.trajetos.length - 1].endereco;

            trip.originAddress = `${origem.endereco_logradouro} ${origem.endereco_numero || ""}, ${origem.endereco_bairro} - ${origem.endereco_cidade}`;
            trip.destinationAddress = `${destino.endereco_logradouro} ${destino.endereco_numero || ""}, ${destino.endereco_bairro} - ${destino.endereco_cidade}`;
          }

          // Salva versão completa e já resolvida da corrida ativa
          await AsyncStorage.setItem("corridaAtiva", JSON.stringify(trip));

          // Atualiza o mapa e UI principal
          onTripAccepted?.(trip);
          break;

        case "pendente":
          setActiveTrip(null);
          await AsyncStorage.removeItem("corridaAtiva");
          onTripAccepted?.(null);
          await carregarCorridas();
          setFeedbackMessage("Corrida devolvida à lista de pendentes.");
          break;

        case "concluida":
          await AsyncStorage.removeItem("corridaAtiva");
          const solicitante = await axios.get(
            `http://localhost:3000/user/getById?id=${trip.solicitante_id}`
          );
          setRequesterName(
            solicitante.data?.data?.name || "Usuário desconhecido"
          );
          setShowCompleted(true);
          break;
      }

      setFeedbackSuccess(true);
      setFeedbackVisible(true);
    } catch (err: any) {
      console.error("❌ Erro ao atualizar status:", err);
      const msg = err.response?.data?.message || err.message || "Erro inesperado.";
      setFeedbackMessage(`❌ ${msg}`);
      setFeedbackSuccess(false);
      setFeedbackVisible(true);
    }
  };

  // =============================================================
  // Função: Carrega corrida ativa (persistida no AsyncStorage)
  // =============================================================
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

  // Função para padronizar o tipo de categoria
  const formatarTipoCategoria = (tipo: string) => {
    switch (tipo) {
      case "documentos":
        return "Documentos";
      case "comida":
        return "Comida";
      case "produtos_pequenos":
        return "Produtos pequenos";
      case "mudancas":
        return "Mudanças";
      case "materiais_de_construcao":
        return "Materiais de construção";
      case "outros":
        return "Outros";
      default:
        return tipo.charAt(0).toUpperCase() + tipo.slice(1);
    }
  };

  // Função para padronizar o tipo de transporte
  const formatarTipoTransporte = (tipo: string) => {
    switch (tipo) {
      case "moto":
        return "Moto";
      case "hatch":
        return "Hatch";
      case "carro":
        return "Carro";
      case "utilitario":
        return "Utilitário";
      case "van":
        return "Van";
      case "caminhao":
        return "Caminhão";
      default:
        return tipo.charAt(0).toUpperCase() + tipo.slice(1);
    }
  };

  // =============================================================
  // UI: Loader
  // =============================================================
  if (loading || resolvendoEnderecos)
    return (
      <View className="w-full mt-4 bg-white rounded-2xl shadow-lg p-8 items-center justify-center">
        <ActivityIndicator size="large" color="#5E60CE" />
        <Text className="mt-2 text-gray-600">
          {resolvendoEnderecos
            ? "Resolvendo endereços..."
            : "Carregando corridas..."}
        </Text>
      </View>
    );

  // =============================================================
  // UI: Corrida concluída (feedback)
  // =============================================================
  if (showCompleted && activeTrip) {
    return (
      <View className="bg-white rounded-2xl shadow-lg p-6 mt-4 items-center">
        <Text className="text-lg font-bold text-[#5E60CE] mb-4 text-center">
          Corrida Concluída
        </Text>

        <Text className="text-gray-700 mb-2">
          Entrega de:{" "}
          <Text className="font-semibold">{requesterName}</Text>
        </Text>

        <Text className="text-gray-700 mb-4">
          Valor ganho:{" "}
          <Text className="font-semibold text-[#5E60CE]">
            R$ {parseFloat(activeTrip.entrega_valor || 0).toFixed(2)}
          </Text>
        </Text>

        <Text className="text-gray-800 mb-2 font-medium">Avalie sua corrida:</Text>

        <View className="flex-row mb-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <Pressable key={num} onPress={() => setRating(num)}>
              <Ionicons
                name={num <= rating ? "star" : "star-outline"}
                size={32}
                color={num <= rating ? "#FFD700" : "#AAA"}
              />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={async () => {
            try {
              // (implementação futura de feedback no backend)
              setFeedbackMessage("Feedback enviado!");
              setFeedbackSuccess(true);
              setFeedbackVisible(true);

              setShowCompleted(false);
              setActiveTrip(null);
              onTripAccepted?.(null);
              await carregarCorridas();
            } catch (error) {
              setFeedbackMessage("Erro ao enviar feedback.");
              setFeedbackSuccess(false);
              setFeedbackVisible(true);
            }
          }}
          disabled={rating === 0}
          className={`px-4 py-2 rounded-lg hover:bg-indigo-700 ${
            rating === 0 ? "bg-gray-400" : "bg-indigo-500"
          }`}
        >
          <Text className="text-white font-semibold">Enviar</Text>
        </Pressable>
      </View>
    );
  }

  // =============================================================
  // UI: Corrida ativa
  // =============================================================
  if (activeTrip && !showCompleted) {
    const paradasIntermediarias =
      activeTrip.trajetos.length > 2 ? activeTrip.trajetos.slice(1, -1) : [];

    return (
      <ScrollView className="m-1 mb-4 rounded-2xl overflow-hidden shadow-lg bg-white mt-4">
        {/* Cabeçalho com gradiente e valor */}
        <View className="flex-row justify-between items-center p-2 bg-gradient-to-r from-[#5E60CE] to-[#4EA8DE]">
          <Text className="text-white font-semibold text-sm">
            Corrida em andamento
          </Text>
          <View className="bg-white/20 p-1 rounded-lg">
            <Text className="text-white font-semibold text-xs">
              R$ {parseFloat(activeTrip.entrega_valor || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Corpo */}
        <View className="p-3">
          {/* Origem */}
          <View className="flex-row items-start mb-1 p-1 rounded-lg hover:bg-slate-200">
            <Ionicons name="location-outline" size={18} color="#ef4444" style={{ marginTop: 2 }} />
            <View className="ml-2 flex-1">
              <Text className="font-semibold text-gray-800">Origem</Text>
              <Text className="text-gray-600 text-xs">{activeTrip.originAddress}</Text>
            </View>
          </View>

          {/* Paradas intermediárias */}
          {paradasIntermediarias.length > 0 && paradasIntermediarias[paradaAtual] && (
            <View className="mb-1 p-1 rounded-lg hover:bg-slate-200">
              <View className="flex-row items-center justify-between">
                {/* Conteúdo da parada atual */}
                <View className="flex-1 flex-row items-start">
                  <Ionicons
                    name="ellipsis-vertical"
                    size={18}
                    color="#5686d7"
                    style={{ margin: "auto" }}
                  />
                  {/* Botão anterior */}
                  <Pressable
                    onPress={() =>
                      setParadaAtual((prev) =>
                        prev === 0
                          ? paradasIntermediarias.length - 1
                          : prev - 1
                      )
                    }
                    className="m-auto p-1 rounded-lg hover:bg-slate-300"
                  >
                    <Ionicons name="caret-back" size={20} color="#5E60CE" />
                  </Pressable>
                  <View className="ml-2 flex-1">
                    <Text className="font-semibold text-gray-700 text-sm">
                      Parada {paradaAtual + 1} de {paradasIntermediarias.length}
                    </Text>

                    <Text className="text-gray-600 text-xs">
                      {paradasIntermediarias[paradaAtual]?.endereco?.endereco_logradouro || "—"}{" "}
                      {paradasIntermediarias[paradaAtual]?.endereco?.endereco_numero || ""},{" "}
                      {paradasIntermediarias[paradaAtual]?.endereco?.endereco_bairro || ""} -{" "}
                      {paradasIntermediarias[paradaAtual]?.endereco?.endereco_cidade || ""}
                    </Text>
                  </View>
                  {/* Botão próximo */}
                  <Pressable
                    onPress={() =>
                      setParadaAtual((prev) =>
                        prev === paradasIntermediarias.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="m-auto p-1 rounded-lg hover:bg-slate-300"
                  >
                    <Ionicons name="caret-forward" size={20} color="#5E60CE" />
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Destino */}
          <View className="flex-row items-start p-1 rounded-lg hover:bg-slate-200">
            <Ionicons name="radio-button-on" size={18} color="#22c55e" style={{ marginTop: 2 }} />
            <View className="ml-2 flex-1">
              <Text className="font-semibold text-gray-800">Destino</Text>
              <Text className="text-gray-600 text-xs">{activeTrip.destinationAddress}</Text>
            </View>
          </View>

          {/* Linha divisória */}
          <View className="h-[1px] bg-gray-200 my-1" />

          {/* Informações adicionais */}
          <View className="flex-row flex-wrap gap-x-4 justify-center">
            <View className="flex-row items-center p-1 rounded-lg hover:bg-slate-200">
              <Ionicons name="speedometer" size={20} color="#5E60CE" />
              <Text className="text-xs text-gray-600 ml-1">
                {formatarTipoTransporte(activeTrip.entrega_tipo_transporte) || "Veículo não especificado"}
              </Text>
            </View>
            <View className="flex-row items-center p-1 rounded-lg hover:bg-slate-200">
              <Ionicons name="cube" size={20} color="#5E60CE" />
              <Text className="text-xs text-gray-600 ml-1">
                {formatarTipoCategoria(activeTrip.entrega_tipo_categoria) || "Categoria desconhecida"}
              </Text>
            </View>
          </View>

          {/* Itens transportados */}
          {activeTrip.itens_entrega && activeTrip.itens_entrega.length > 0 && (
            <View className="mt-1 bg-gray-50 rounded-lg p-2">
              <Text className="font-semibold text-gray-700 mb-1 text-sm">
                Conteudo da Entrega:
              </Text>
              {activeTrip.itens_entrega.map((item: any, i: number) => (
                <View key={i} className="p-1 rounded-lg hover:bg-slate-200">
                  <View className="flex flex-row justify-between m-1">
                    <View className="flex flex-row">
                      <Ionicons name="cube-outline" size={16} color="#5E60CE" />
                      <Text className="mr-1 text-xs text-gray-800 font-semibold">
                        • Item {i + 1}: {item.item_entrega_nome}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-800 font-semibold">
                      (Qtd: {item.item_entrega_quantidade})
                    </Text>
                  </View>
                  <View className="m-1 rounded-lg">
                    <Text className="text-xs text-gray-800 font-semibold">
                      Descrição:
                    </Text>
                    <Text className="text-xs text-gray-600 font-medium">
                      - {item.item_entrega_observacoes || "Nenhuma"}
                    </Text>
                  </View>
                  <View className="flex items-end">
                    <Text className="text-xs text-gray-600 font-extralight">
                      Peso: {item.item_entrega_pesagem} kg
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Linha divisória */}
          <View className="h-[1px] bg-gray-200 my-1" />

          {/* Botões de ação */}
          <View className="flex-row justify-end gap-3 mt-1">
            <Pressable
              onPress={() => atualizarStatusCorrida(activeTrip, "pendente")}
              className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <Text className="text-white font-semibold">Cancelar Corrida</Text>
            </Pressable>

            <Pressable
              onPress={() => atualizarStatusCorrida(activeTrip, "concluida")}
              className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Text className="text-white font-semibold">Concluir Corrida</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  function TripCard({ item }: { item: any }) {
    const totalParadas = Math.max(item.trajetos.length - 2, 0);
    const paradasIntermediarias =
      item.trajetos.length > 2 ? item.trajetos.slice(1, -1) : [];

    const [paradaAtual, setParadaAtual] = useState(0);

    useEffect(() => {
      if (paradasIntermediarias.length === 0) return;
      const intervalo = setInterval(() => {
        setParadaAtual((prev) =>
          prev === paradasIntermediarias.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(intervalo);
    }, [paradasIntermediarias]);

    return (
      <View className="m-1 mb-4 rounded-xl overflow-hidden shadow-lg bg-white">
        {/* Cabeçalho com gradiente e valor */}
        <View className="flex-row justify-between items-center p-2 bg-gradient-to-r from-[#5E60CE] to-[#4EA8DE]">
          <Text className="text-white font-bold text-sm">
            {item.entrega_descricao || "Entrega"}
          </Text>
          <View className="bg-white/20 p-1 rounded-lg">
            <Text className="text-white font-semibold text-xs">
              R$ {parseFloat(item.entrega_valor || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Corpo do card */}
        <View className="p-2">
          {/* Origem */}
          <View className="flex-row items-start mb-1 p-1 rounded-lg hover:bg-slate-200">
            <Ionicons name="location-outline" size={18} color="#ef4444" style={{ marginTop: 2 }} />
            <View className="ml-2 flex-1">
              <Text className="font-semibold text-gray-800">Origem</Text>
              <Text className="text-gray-600 text-xs">{item.originAddress}</Text>
            </View>
          </View>

          {/* Paradas intermediárias (com rotação automática e navegação manual) */}
          {paradasIntermediarias.length > 0 && (
            <View className="mb-1 p-1 rounded-lg hover:bg-slate-200">
              <View className="flex-row items-center justify-between">
                

                {/* Conteúdo da parada atual */}
                <View className="flex-1 flex-row items-start">
                  <Ionicons
                    name="ellipsis-vertical"
                    size={18}
                    color="#5686d7"
                    style={{ margin: "auto" }}
                  />
                  {/* Botão anterior */}
                  <Pressable
                    onPress={() =>
                      setParadaAtual((prev) =>
                        prev === 0 ? paradasIntermediarias.length - 1 : prev - 1
                      )
                    }
                    className="m-auto p-1 rounded-lg hover:bg-slate-300"
                  >
                    <Ionicons name="caret-back" size={20} color="#5E60CE" />
                  </Pressable>
                  <View className="ml-2 flex-1">
                    <Text className="font-semibold text-gray-700 text-sm">
                      Parada {paradaAtual + 1} de {paradasIntermediarias.length}
                    </Text>
                    <Text className="text-gray-600 text-xs">
                      {paradasIntermediarias[paradaAtual].endereco.endereco_logradouro}{" "}
                      {paradasIntermediarias[paradaAtual].endereco.endereco_numero || ""},{" "}
                      {paradasIntermediarias[paradaAtual].endereco.endereco_bairro} -{" "}
                      {paradasIntermediarias[paradaAtual].endereco.endereco_cidade}
                    </Text>
                  </View>
                  {/* Botão próximo */}
                  <Pressable
                    onPress={() =>
                      setParadaAtual((prev) =>
                        prev === paradasIntermediarias.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="m-auto p-1 rounded-lg hover:bg-slate-300"
                  >
                    <Ionicons name="caret-forward" size={20} color="#5E60CE" />
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Destino */}
          <View className="flex-row items-start p-1 rounded-lg hover:bg-slate-200">
            <Ionicons name="radio-button-on" size={18} color="#22c55e" style={{ marginTop: 2 }} />
            <View className="ml-2 flex-1">
              <Text className="font-semibold text-gray-800">Destino</Text>
              <Text className="text-gray-600 text-xs">{item.destinationAddress}</Text>
            </View>
          </View>

          {/* Linha divisória */}
          <View className="h-[1px] bg-gray-200 my-1" />
          
          {/* Informações adicionais */}
          <View className="flex-row flex-wrap gap-x-4 mb-1 justify-center">
            <View className="flex-row items-center p-1 rounded-lg hover:bg-slate-200">
              <Ionicons name="speedometer" size={20} color="#5E60CE" />
              <Text className="text-xs text-gray-600 ml-1">
                {formatarTipoTransporte(item.entrega_tipo_transporte) || "Veículo não especificado"}
              </Text>
            </View>
            <View className="flex-row items-center p-1 rounded-lg hover:bg-slate-200">
              <Ionicons name="cube" size={20} color="#5E60CE" />
              <Text className="text-xs text-gray-600 ml-1">
                {formatarTipoCategoria(item.entrega_tipo_categoria) || "Categoria desconhecida"}
              </Text>
            </View>
          </View>


          {/* Data de Agendamento e Botão de ação */}
          <View className="flex flex-row justify-between">
            <View className="flex-row items-center p-1 rounded-lg hover:bg-slate-200">
              <Ionicons name="today" size={20} color="#5E60CE" />
              <Text className="text-xs text-gray-600 ml-1">
                {item.entrega_data_agendada && typeof item.entrega_data_agendada === "string"
                  ? new Date(item.entrega_data_agendada).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--"}
              </Text>
            </View>
            <Pressable
              onPress={() => atualizarStatusCorrida(item, "aceita")}
              className="bg-green-500 flex-row w-fit self-end px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Text className="text-white font-semibold">Aceitar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // =============================================================
  // UI: Lista de corridas disponíveis
  // =============================================================
  return (
    <View className="w-full mt-4 relative">
      <View className="flex-row items-center justify-center px-4 mb-3 bg-white rounded-xl shadow p-2">
        <Text className="text-base font-semibold text-[#5E60CE]">
          Corridas Disponíveis
        </Text>
        <Pressable
          onPress={carregarCorridas}
          disabled={isRefreshing}
          className={`flex-row absolute right-1 px-3 py-2 rounded-lg hover:bg-indigo-700 ${
            isRefreshing ? "bg-gray-300" : "bg-indigo-500"
          }`}
        >
          <Text className="text-white font-semibold">
            {isRefreshing ? "Atualizando..." : "Atualizar"}
          </Text>
        </Pressable>
      </View>

      <View className="bg-white rounded-2xl shadow-lg p-1">
        {trips.length > 0 ? (
          <FlatList
            data={trips}
            keyExtractor={(item, index) => String(item.entrega_id ?? index)}
            renderItem={({ item }) => <TripCard item={item} />}
            showsVerticalScrollIndicator={false}
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