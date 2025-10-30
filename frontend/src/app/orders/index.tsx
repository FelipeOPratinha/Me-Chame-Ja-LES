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

  // Função para padronizar o tipo
  const formatarTipo = (tipo: string) => {
    switch (tipo) {
      case "documentos":
        return "Documentos";
      case "comida":
        return "Comida";
      case "materiais_de_construcao":
        return "Materiais de construção";
      case "produtos_pequenos":
        return "Produtos pequenos";
      case "outros":
        return "Outros";
      default:
        return tipo.charAt(0).toUpperCase() + tipo.slice(1);
    }
  };

  // Filtro de pesquisa
  const pedidosFiltrados = pedidos.filter((p) =>
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    p.type?.toLowerCase().includes(search.toLowerCase()) ||
    p.status?.toLowerCase().includes(search.toLowerCase())
  );

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

          {/* Lista */}
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#fff" />
              <Text className="text-white mt-2">Carregando pedidos...</Text>
            </View>
          ) : pedidosFiltrados.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-white text-center">
                Nenhum pedido encontrado.
              </Text>
            </View>
          ) : (
            <ScrollView className="flex-1 space-y-3 px-4">
              {pedidosFiltrados.map((pedido) => (
                <View
                  key={pedido.id}
                  className="bg-white rounded-xl p-2 my-3 shadow-md"
                >
                  <View className="flex-row justify-between mb-2">
                    <View className="bg-slate-100 w-fit p-2 rounded-lg">
                      <Text className="text-sm font-semibold text-gray-800">
                        Informações:
                      </Text>
                    </View>
                    <View className="bg-slate-100 w-fit p-2 rounded-lg justify-center">
                      <Text className="text-xs text-gray-500">ID #{pedido.id}</Text>
                    </View>
                  </View>

                  <View className={`${isSm ? "flex-row" : "flex-col"} mb-2 gap-2`}>
                    <View className={`${isSm ? "flex-1" : "flex"} bg-slate-100 p-2 rounded-lg`}>
                      <Text className="font-semibold text-gray-700">
                        Origem:
                      </Text>
                      <Text className="text-gray-700">
                        {pedido.originAddress}
                      </Text>
                    </View>
                    <View className="flex-1 sm:flex bg-slate-100 p-2 rounded-lg">
                      <Text className="font-semibold text-gray-700">
                        Destino:
                      </Text>
                      <Text className="text-gray-700">
                        {pedido.destinationAddress}
                      </Text>
                    </View>
                  </View>

                  <View className={`${isSm ? "flex-row" : "flex-col"} mb-2 gap-2`}>
                    <View className={`${isSm ? "flex-1" : "flex"} bg-slate-100 p-2 rounded-lg`}>
                      <Text className="text-sm font-semibold text-gray-700">
                        Categoria do pedido:
                      </Text>
                      <Text className="text-sm text-gray-700">
                        {formatarTipo(pedido.type)}
                      </Text>
                    </View>
                    <View className="flex-1 bg-slate-100 p-2 rounded-lg">
                      <Text className="text-sm font-semibold text-gray-700">
                        Valor:
                      </Text>
                      <Text className="text-gray-700">
                        R$ {Number(pedido.value).toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View className="flex bg-slate-100 p-2 rounded-lg mb-2">
                    <Text className="text-sm font-semibold text-gray-700">
                      Descrição:
                    </Text>
                    <Text className="text-gray-700">
                      {pedido.description}
                    </Text>
                  </View>

                  <View className="flex-1 bg-slate-100 p-2 rounded-lg justify-center items-center mb-3">
                    <Text
                      className={`font-semibold ${
                        pedido.status === "concluida"
                          ? "text-green-600"
                          : pedido.status === "aceita"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      Status: {pedido.status}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-end gap-2">
                    {pedido.status === "pagamento" && (
                      <Pressable
                        className="bg-green-600 p-3 rounded-lg"
                        onPress={() => {
                          setPedidoSelecionado(pedido);
                          setModalPagamento(true);
                        }}
                      >
                        <Text className="text-white text-sm">Pagamento</Text>
                      </Pressable>
                    )}
                    <Pressable
                      className="bg-[#5E60CE] p-3 rounded-lg"
                      onPress={() => {
                        setPedidoSelecionado(pedido);
                        setModalVisible(true);
                      }}
                    >
                      <Text className="text-white text-sm">Detalhes</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Modal de detalhes */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white rounded-2xl w-full p-5 max-h-[80%] max-w-2xl">
              <Text className="text-xl font-bold text-center text-gray-800 mb-3">
                Detalhes do Pedido #{pedidoSelecionado?.id}
              </Text>

              <Text className="text-gray-700">
                Tipo: {formatarTipo(pedidoSelecionado?.type || "")}
              </Text>
              <Text className="text-gray-700">
                Descrição: {pedidoSelecionado?.description}
              </Text>
              <Text className="text-gray-700">
                Origem: {pedidoSelecionado?.originAddress}
              </Text>
              <Text className="text-gray-700">
                Destino: {pedidoSelecionado?.destinationAddress}
              </Text>
              <Text className="text-gray-700 mb-2">
                Valor: R$ {Number(pedidoSelecionado?.value || 0).toFixed(2)}
              </Text>

              <Text className="font-semibold text-gray-800 mt-2 mb-1">
                Itens:
              </Text>

              {pedidoSelecionado?.items?.length > 0 ? (
                <ScrollView className="max-h-64">
                  {pedidoSelecionado.items.map((item: any) => (
                    <View
                      key={item.id}
                      className="border-b border-gray-300 pb-2 mb-2"
                    >
                      <Text className="text-gray-700">
                        <Text className="font-semibold">Nome:</Text> {item.name}
                      </Text>
                      <Text className="text-gray-700">
                        <Text className="font-semibold">Quantidade:</Text>{" "}
                        {item.quantity}
                      </Text>
                      <Text className="text-gray-700">
                        <Text className="font-semibold">Peso:</Text>{" "}
                        {item.weight} kg
                      </Text>
                      {item.remarks ? (
                        <Text className="text-gray-700 italic">
                          "{item.remarks}"
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text className="text-gray-500">Nenhum item cadastrado.</Text>
              )}

              <Pressable
                onPress={() => setModalVisible(false)}
                className="mt-4 bg-blue-500 py-2 rounded-xl"
              >
                <Text className="text-center text-white font-semibold">
                  Fechar
                </Text>
              </Pressable>
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
            <View className="bg-white rounded-2xl w-full p-5 max-w-md items-center">
              <Text className="text-xl font-bold text-gray-800 mb-3">
                Pagamento da Entrega #{pedidoSelecionado?.id}
              </Text>

              <Text className="text-gray-700 text-center mb-2">
                Escaneie o QR Code abaixo ou copie o código Pix para pagamento.
              </Text>

              {pedidoSelecionado && (
                <>
                  {/* QR Code genérico */}
                  <View className="bg-gray-100 rounded-lg p-4 mb-3">
                    <QRCode
                      value={`Pagamento da entrega #${pedidoSelecionado.id} - Valor R$ ${Number(
                        pedidoSelecionado.value
                      ).toFixed(2)}`}
                      size={180}
                    />
                  </View>

                  {/* Valor da entrega */}
                  <Text className="text-gray-700 font-semibold text-lg mb-1">
                    Valor: R$ {Number(pedidoSelecionado.value).toFixed(2)}
                  </Text>

                  {/* Código Pix genérico */}
                  <Text className="text-gray-700 font-semibold mb-1 mt-3">
                    Código Pix (Copia e Cola):
                  </Text>

                  <ScrollView className="max-w-72 max-h-24 mb-2">
                    <Text
                      selectable
                      className="bg-gray-100 rounded-lg p-2 text-xs text-center text-gray-600"
                    >
                      00020126580014BR.GOV.BCB.PIX0136pix@mechameja.com.br5204000053039865406
                      {Number(pedidoSelecionado.value).toFixed(2).replace(".", "")}
                      5802BR5911ME CHAME JA6014MOGI DAS CRUZES62070503***6304ABCD
                    </Text>
                  </ScrollView>

                  {/* Botão de copiar código Pix */}
                  <Pressable
                    onPress={async () => {
                      const codigoPix = `00020126580014BR.GOV.BCB.PIX0136pix@mechameja.com.br5204000053039865406${Number(
                        pedidoSelecionado.value
                      )
                        .toFixed(2)
                        .replace(".", "")}5802BR5911ME CHAME JA6014MOGI DAS CRUZES62070503***6304ABCD`;

                      await Clipboard.setStringAsync(codigoPix);
                      setFeedbackMessage("Código Pix copiado com sucesso!");
                      setFeedbackSuccess(true);
                      setFeedbackVisible(true);
                    }}
                    className="bg-green-600 w-full py-3 rounded-xl mb-3"
                  >
                    <Text className="text-center text-white font-semibold">
                      Copiar código Pix
                    </Text>
                  </Pressable>

                  {/* Botão de concluir pagamento */}
                  <Pressable
                    onPress={async () => {
                      try {
                        const updatedDelivery = {
                          ...pedidoSelecionado,
                          status: "pendente",
                        };

                        const response = await axios.post(
                          "http://localhost:3000/delivery/update",
                          updatedDelivery
                        );

                        if (response.data?.success || response.status === 200) {
                          setFeedbackMessage("Pagamento confirmado! Entrega liberada para motoristas.");
                          setFeedbackSuccess(true);
                          setFeedbackVisible(true);

                          // Fecha modal e recarrega lista após feedback
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
                    className="bg-blue-600 w-full py-3 rounded-xl mb-3"
                  >
                    <Text className="text-center text-white font-semibold">
                      Concluir pagamento
                    </Text>
                  </Pressable>
                </>
              )}

              {/* Botão de fechar */}
              <Pressable
                onPress={() => setModalPagamento(false)}
                className="bg-gray-400 w-full py-3 rounded-xl"
              >
                <Text className="text-center text-white font-semibold">Fechar</Text>
              </Pressable>
            </View>
          </View>

          {/* Feedback Modal */}
          <FeedbackModal
            visible={feedbackVisible}
            message={feedbackMessage}
            success={feedbackSuccess}
            onClose={() => setFeedbackVisible(false)}
          />
        </Modal>

      </View>
    </LinearGradient>
  );
}