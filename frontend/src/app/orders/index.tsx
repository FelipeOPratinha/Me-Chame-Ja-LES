import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Header } from "~/components/header";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useBreakpoint } from "~/hooks/useBreakpoint";
import QRCode from "react-native-qrcode-svg";
import { FeedbackModal } from "~/components/feedbackModal";
import * as Clipboard from "expo-clipboard";

export default function Orders() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { isSm, isMd, isLg, current } = useBreakpoint();
  const [modalPagamento, setModalPagamento] = useState(false);

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get("http://localhost:3000/delivery/getAll");
        if (response.data?.status === 200) {
          setPedidos(response.data.data);
        }
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
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

  // Filtro de pesquisa ajustado para o novo formato
  const pedidosFiltrados = pedidos.filter((p) => {
    const entrega = p.entrega;
    const trajeto = p.trajetos?.[0] || {};
    const termo = search.toLowerCase();

    return (
      entrega.id?.toString().toLowerCase().includes(termo) ||
      entrega.entrega_valor?.toString().toLowerCase().includes(termo) ||
      entrega.entrega_status?.toLowerCase().includes(termo) ||
      entrega.entrega_descricao?.toLowerCase().includes(termo) ||
      entrega.entrega_tipo_categoria?.toLowerCase().includes(termo) ||
      entrega.entrega_tipo_transporte?.toLowerCase().includes(termo) ||
      trajeto.endereco.endereco_logradouro?.toLowerCase().includes(termo) ||
      trajeto.endereco.endereco_bairro?.toLowerCase().includes(termo) ||
      trajeto.endereco.endereco_cidade?.toLowerCase().includes(termo) ||
      trajeto.endereco.endereco_estado?.toLowerCase().includes(termo) ||
      trajeto.endereco.endereco_cep?.toLowerCase().includes(termo)
    );
  });

  return (
    <LinearGradient
      colors={["#4EA8DE", "#5E60CE", "#4EA8DE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1 }}
    >
      <View className="flex-1">
        <Header />

        <View className="flex-1 w-full xl:w-1/2 mx-auto p-4 space-y-4">
          {/* Header */}
          <View className="flex-row items-center justify-between bg-white px-2 mb-3 rounded-xl shadow p-2">
            <Text className="text-base font-semibold text-[#5E60CE] text-center m-auto">
              Meus Pedidos
            </Text>
          </View>

          {/* Barra de pesquisa */}
          <View className="flex-row items-center bg-white rounded-xl px-3 py-2 mx-4">
            <Ionicons name="search" size={20} color="#5E60CE" />
            <TextInput
              placeholder="Pesquisar pedidos..."
              placeholderTextColor="#888"
              className="flex-1 ml-2 text-base text-gray-700 outline-none"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Lista de Entregas */}
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#5E60CE" />
              <Text className="text-white mt-2">Carregando pedidos...</Text>
            </View>
          ) : pedidosFiltrados.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-white text-center">Nenhum pedido encontrado.</Text>
            </View>
          ) : (
            <ScrollView className="flex-1 space-y-4 px-4 py-3">
              {pedidosFiltrados.map((pedido, index) => {
                const entrega = pedido.entrega;
                const origem = pedido.trajetos?.[0]?.endereco;
                const destino = pedido.trajetos?.[pedido.trajetos.length - 1]?.endereco;

                type StatusEntrega = "pagamento" | "pendente" | "aceita" | "concluida" | "cancelada";

                const statusMap: Record<StatusEntrega, { color: string; label: string }> = {
                  pagamento: { color: "bg-red-100", label: "Pagamento" },
                  pendente: { color: "bg-orange-100", label: "Pendente" },
                  aceita: { color: "bg-yellow-100", label: "Aceita" },
                  concluida: { color: "bg-green-100", label: "Concluída" },
                  cancelada: { color: "bg-gray-100", label: "Cancelada" },
                };

                const statusKey = (entrega.entrega_status as StatusEntrega) || "pendente";
                const statusStyle = statusMap[statusKey];

                return (
                  <View
                    key={index}
                    className="bg-white rounded-2xl p-4 shadow-md mb-10"
                  >
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-2">
                      <View className="bg-gradient-to-r from-indigo-500 to-blue-500 px-3 py-1 rounded-lg">
                        <Text className="text-white text-sm font-semibold">
                          #{entrega.id} • {formatarTipoCategoria(entrega.entrega_tipo_categoria)}
                        </Text>
                      </View>
                      <View className={`px-2 py-1 rounded-full ${statusStyle.color}`}>
                        <Text className="text-gray-600 text-xs font-semibold">{statusStyle.label}</Text>
                      </View>
                    </View>

                    {/* Origem/Destino */}
                    <View className={`${isSm ? "flex-row" : "flex-col"} gap-2 mb-2`}>
                      <View className="flex-1 bg-gray-50 p-2 rounded-xl shadow-sm hover:bg-slate-200">
                        <Text className="font-semibold text-gray-700 mb-0.5">📍 Origem</Text>
                        <Text className="text-gray-600 text-sm leading-tight">
                          {origem
                            ? `${origem.endereco_logradouro}, ${origem.endereco_bairro}, ${origem.endereco_numero || "s/n"}`
                            : "Não informado"}
                        </Text>
                      </View>
                      <View className="flex-1 bg-gray-50 p-2 rounded-xl shadow-sm hover:bg-slate-200">
                        <Text className="font-semibold text-gray-700 mb-0.5">🎯 Destino</Text>
                        <Text className="text-gray-600 text-sm leading-tight">
                          {destino
                            ? `${destino.endereco_logradouro}, ${destino.endereco_bairro}, ${destino.endereco_numero || "s/n"}`
                            : "Não informado"}
                        </Text>
                      </View>
                    </View>

                    {/* Categoria, Valor */}
                    <View className={`${isSm ? "flex-row" : "flex-col"} gap-2 mb-2`}>
                      <View className="flex-1 bg-gray-50 p-2 rounded-xl shadow-sm hover:bg-slate-200">
                        <Text className="text-sm font-semibold text-gray-700 mb-0.5">🚚 Transporte</Text>
                        <Text className="text-gray-600 text-sm capitalize">
                          {entrega.entrega_tipo_transporte}
                        </Text>
                      </View>
                      <View className="flex-1 bg-gray-50 p-2 rounded-xl shadow-sm hover:bg-slate-200">
                        <Text className="text-sm font-semibold text-gray-700 mb-0.5">💰 Valor</Text>
                        <Text className="text-gray-600">
                          R$ {Number(entrega.entrega_valor).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Descrição */}
                    <View className="bg-gray-50 p-2 rounded-xl shadow-sm hover:bg-slate-200 mb-3">
                      <Text className="text-sm font-semibold text-gray-700 mb-0.5">📝 Descrição</Text>
                      <Text className="text-gray-600 text-sm">
                        {entrega.entrega_descricao || "Sem descrição"}
                      </Text>
                    </View>

                    {/* Botões */}
                    <View className="flex-row justify-end gap-2 mt-2">
                      {entrega.entrega_status === "pagamento" && (
                        <Pressable
                          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-700"
                          onPress={() => {
                            setPedidoSelecionado(pedido);
                            setModalPagamento(true);
                          }}
                        >
                          <Text className="text-white text-sm font-semibold">Pagamento</Text>
                        </Pressable>
                      )}
                      <Pressable
                        className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-700"
                        onPress={() => {
                          setPedidoSelecionado(pedido);
                          setModalVisible(true);
                        }}
                      >
                        <Text className="text-white text-sm font-semibold">Detalhes</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Modal de detalhes da entrega */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 bg-black/60 justify-center items-center px-4">
            <View className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-xl">
              {pedidoSelecionado && (
                <>
                  {/* Cabeçalho */}
                  <LinearGradient
                    colors={["#4F46E5", "#3B82F6"]}
                    className="p-3"
                  >
                    <Text className="text-white text-xl font-bold text-center">
                      Entrega #{pedidoSelecionado.entrega.id}
                    </Text>
                    <Text className="text-white text-center text-sm mt-1">
                      {formatarTipoCategoria(pedidoSelecionado.entrega.entrega_tipo_categoria)} •{" "}
                      {pedidoSelecionado.entrega.entrega_status === "pendente"
                        ? "Pendente"
                        : pedidoSelecionado.entrega.entrega_status === "pagamento"
                        ? "Aguardando Pagamento"
                        : "Concluída"}
                    </Text>
                  </LinearGradient>

                  {/* Corpo */}
                  <ScrollView className="p-5 max-h-[70vh]">
                    {/* Informações principais */}
                    <View className="mb-4">
                      <View className="flex-row items-center justify-between bg-white px-2 mb-3 rounded-xl shadow-sm p-2">
                        <Text className="text-base font-semibold text-[#5E60CE] text-center m-auto">
                          Informações principais
                        </Text>
                      </View>
                      <View className="bg-white rounded-xl p-3 shadow-sm hover:bg-slate-200">
                        <Text className="text-gray-800 py-1">
                          <Text className="font-semibold">Descrição:</Text>{" "}
                          {pedidoSelecionado.entrega.entrega_descricao}
                        </Text>
                        <Text className="text-gray-800 py-1">
                          <Text className="font-semibold">Transporte:</Text>{" "}
                          {formatarTipoTransporte(pedidoSelecionado.entrega.entrega_tipo_transporte)}
                        </Text>
                        <Text className="text-gray-800 py-1">
                          <Text className="font-semibold">Valor:</Text>{" "}
                          R${" "}
                          {Number(pedidoSelecionado.entrega.entrega_valor).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Trajetos */}
                    <View className="mb-5">
                      <View className="flex-row items-center justify-between bg-white px-2 mb-3 rounded-xl shadow-sm p-2">
                        <Text className="text-base font-semibold text-[#5E60CE] text-center m-auto">
                          Trajeto
                        </Text>
                      </View>
                      {pedidoSelecionado.trajetos.map((t: any, idx: number) => (
                        <View
                          key={idx}
                          className="bg-white rounded-xl p-3 mb-2 shadow-sm flex-row items-start hover:bg-slate-200"
                        >
                          <View className="bg-blue-200 rounded-full w-7 h-7 flex items-center justify-center mr-3">
                            <Text className="text-blue-700 font-bold">{t.trajeto_ordem}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-gray-800 font-semibold">
                              {t.endereco.endereco_logradouro}, {t.endereco.endereco_numero || "s/n"}
                            </Text>
                            <Text className="text-gray-600 text-sm">
                              {t.endereco.endereco_bairro} • {t.endereco.endereco_cidade} -{" "}
                              {t.endereco.endereco_estado}
                            </Text>
                            <Text className="text-gray-400 text-xs">
                              CEP: {t.endereco.endereco_cep}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* Itens */}
                    <View>
                      <View className="flex-row items-center justify-between bg-white px-2 mb-3 rounded-xl shadow-sm p-2">
                        <Text className="text-base font-semibold text-[#5E60CE] text-center m-auto">
                          Itens da Entrega
                        </Text>
                      </View>
                      {pedidoSelecionado.itens_entrega?.length > 0 ? (
                        pedidoSelecionado.itens_entrega.map((item: any, idx: number) => (
                          <View
                            key={idx}
                            className="bg-white rounded-xl p-3 mb-2 shadow-sm hover:bg-slate-200"
                          >
                            <Text className="text-gray-800 font-semibold mb-1">
                              {item.item_entrega_nome}
                            </Text>
                            <View className="flex-row flex-wrap justify-between">
                              <Text className="text-gray-700 text-sm">
                                Quantidade: {item.item_entrega_quantidade}
                              </Text>
                              <Text className="text-gray-700 text-sm">
                                Peso: {item.item_entrega_pesagem} kg
                              </Text>
                            </View>
                            {item.item_entrega_observacoes && (
                              <Text className="text-gray-500 italic text-sm mt-1">
                                "{item.item_entrega_observacoes}"
                              </Text>
                            )}
                          </View>
                        ))
                      ) : (
                        <Text className="text-gray-500">Nenhum item cadastrado.</Text>
                      )}
                    </View>
                  </ScrollView>
                  
                  <View className="flex flex-row my-4">
                    {/* Botão Cancelar Entrega */}
                    {pedidoSelecionado.entrega.entrega_status !== "cancelada" && pedidoSelecionado.entrega.entrega_status !== "concluida" &&  (
                      <Pressable
                        onPress={async () => {
                          try {
                            const entrega = pedidoSelecionado.entrega;
                            const updatedDelivery = {
                              id: entrega.id,
                              entrega_status: "cancelada",
                            };

                            const response = await axios.post(
                              "http://localhost:3000/delivery/update",
                              updatedDelivery
                            );

                            if (response.data?.success || response.status === 200) {
                              setModalVisible(false);
                              setFeedbackMessage("Entrega cancelada com sucesso!");
                              setFeedbackSuccess(true);

                              // Mostra o feedback com leve atraso, pra evitar sobreposição visual
                              setTimeout(() => setFeedbackVisible(true), 200);

                              // Atualiza lista após o feedback
                              setTimeout(async () => {
                                const refresh = await axios.get("http://localhost:3000/delivery/getAll");
                                setPedidos(refresh.data.data);
                              }, 1500);
                            } else {
                              setFeedbackMessage("Erro ao atualizar o status da entrega.");
                              setFeedbackSuccess(false);
                              setFeedbackVisible(true);
                            }
                          } catch (error) {
                            console.error("Erro ao atualizar status:", error);
                            setFeedbackMessage("Falha ao comunicar com o servidor.");
                            setFeedbackSuccess(false);
                            setFeedbackVisible(true);
                          }
                        }}
                        className="bg-red-500 w-fit min-w-24 mx-auto p-3 rounded-xl shadow-md hover:bg-red-700"
                      >
                        <Text className="text-center text-white font-semibold text-base">
                          Cancelar
                        </Text>
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => setModalVisible(false)}
                      className="bg-blue-500 w-fit min-w-24 mx-auto p-3 rounded-xl shadow-md hover:bg-blue-700"
                    >
                      <Text className="text-center text-white font-semibold text-base">
                        Fechar
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Modal de pagamento */}
        <Modal
          visible={modalPagamento}
          transparent
          animationType="fade"
          onRequestClose={() => setModalPagamento(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">

              {/* Cabeçalho com gradiente */}
              <LinearGradient
                colors={["#4F46E5", "#3B82F6"]}
                className="p-3 items-center"
              >
                <Text className="text-white text-lg font-bold">
                  Pagamento da Entrega #{pedidoSelecionado?.entrega.id}
                </Text>
                <Text className="text-white text-sm mt-1">
                  Escaneie o QR Code ou copie o código Pix
                </Text>
              </LinearGradient>

              <View className="p-5 items-center">
                {pedidoSelecionado && (
                  <>
                    {/* QR Code */}
                    <View className="bg-gray-50 rounded-2xl p-5 mb-4 border border-gray-200 shadow-sm">
                      <QRCode
                        value={`Pagamento da entrega #${pedidoSelecionado.entrega.id} - Valor R$ ${Number(
                          pedidoSelecionado.entrega.entrega_valor
                        ).toFixed(2)}`}
                        size={200}
                      />
                    </View>

                    {/* Valor */}
                    <Text className="text-gray-800 font-bold text-xl mb-1">
                      R$ {Number(pedidoSelecionado.entrega.entrega_valor).toFixed(2)}
                    </Text>
                    <Text className="text-gray-500 text-sm mb-3">Valor da entrega</Text>

                    {/* Código Pix */}
                    <View className="flex w-full mb-3">
                      <Text className="text-gray-700 font-semibold mb-1 text-center">
                        Código Pix (Copia e Cola)
                      </Text>
                      <View className="relative">
                        <ScrollView className="max-h-28 bg-gray-50 rounded-xl border border-gray-200 p-2">
                          <Text
                            selectable
                            className="text-[11px] text-gray-700 text-center leading-tight"
                          >
                            00020126580014BR.GOV.BCB.PIX0136pix@mechameja.com.br5204000053039865406
                            {Number(pedidoSelecionado.entrega.entrega_valor)
                              .toFixed(2)
                              .replace(".", "")}
                            5802BR5911ME CHAME JA6014MOGI DAS CRUZES62070503***6304ABCD
                          </Text>
                        </ScrollView>
                        {/* Botão copiar Pix */}
                        <Pressable
                          onPress={async () => {
                            const codigoPix = `00020126580014BR.GOV.BCB.PIX0136pix@mechameja.com.br5204000053039865406${Number(
                              pedidoSelecionado.entrega.entrega_valor
                            )
                              .toFixed(2)
                              .replace(".", "")}5802BR5911ME CHAME JA6014MOGI DAS CRUZES62070503***6304ABCD`;

                            await Clipboard.setStringAsync(codigoPix);
                            setFeedbackMessage("Código Pix copiado com sucesso!");
                            setFeedbackSuccess(true);
                            setFeedbackVisible(true);
                          }}
                          className="bg-gray-500 absolute right-0 justify-center h-full px-2 rounded-xl shadow-sm hover:bg-gray-700"
                        >
                          <Ionicons name="copy" size={20} color="white" className="p-1" />
                        </Pressable>
                      </View>
                    </View>

                    {/* Botão confirmar pagamento */}
                    <Pressable
                      onPress={async () => {
                        try {
                          const entrega = pedidoSelecionado.entrega;
                          const updatedDelivery = {
                            id: entrega.id,
                            entrega_status: "pendente",
                          };

                          const response = await axios.post(
                            "http://localhost:3000/delivery/update",
                            updatedDelivery
                          );

                          if (response.data?.success || response.status === 200) {
                            setFeedbackMessage("Pagamento confirmado! Entrega liberada para motoristas.");
                            setFeedbackSuccess(true);
                            setFeedbackVisible(true);

                            setTimeout(async () => {
                              setModalPagamento(false);
                              const refresh = await axios.get("http://localhost:3000/delivery/getAll");
                              setPedidos(refresh.data.data);
                            }, 1500);
                          } else {
                            setFeedbackMessage("Erro ao atualizar o status da entrega.");
                            setFeedbackSuccess(false);
                            setFeedbackVisible(true);
                          }
                        } catch (error) {
                          console.error("Erro ao atualizar status:", error);
                          setFeedbackMessage("Falha ao comunicar com o servidor.");
                          setFeedbackSuccess(false);
                          setFeedbackVisible(true);
                        }
                      }}
                      className="bg-green-500 w-full py-3 rounded-xl mb-2 shadow-sm hover:bg-green-700"
                    >
                      <Text className="text-center text-white font-semibold text-base">
                        Concluir pagamento
                      </Text>
                    </Pressable>

                    {/* Botão fechar */}
                    <Pressable
                      onPress={() => setModalPagamento(false)}
                      className="bg-blue-500 w-full py-3 rounded-xl mt-1 hover:bg-blue-700"
                    >
                      <Text className="text-center text-white font-semibold text-base">
                        Fechar
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* Feedback Modal */}
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