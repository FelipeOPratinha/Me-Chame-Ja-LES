import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Header } from "~/components/header";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userApi } from "~/apis/userApi";
import { deliveryApi } from "~/apis/deliveryApi";
import { FeedbackModal } from "~/components/feedbackModal";
import { useRouter } from "expo-router";

export default function Fidelity() {
  const [usuario, setUsuario] = useState<any>(null);
  const [pontos, setPontos] = useState(0);
  const [totalEntregas, setTotalEntregas] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Feedback modal
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(true);

  const meta = 500;
  const progresso = pontos / meta;

  useEffect(() => {
    carregarUsuario();
    carregarTotalEntregas();
  }, []);

  async function carregarUsuario() {
    try {
      const userData = await AsyncStorage.getItem("usuarioLogado");
      if (!userData) return;
      const parsed = JSON.parse(userData);

      const userLogged = await userApi.getUserById(parsed.id);
      setUsuario(userLogged);
      setPontos(userLogged.data.loyaltyPoints || 0);
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
      abrirFeedback("Não foi possível carregar seus pontos.", false);
    } finally {
      setLoading(false);
    }
  }

  async function carregarTotalEntregas() {
    try {
      const userData = await AsyncStorage.getItem("usuarioLogado");
      if (!userData) return;
      const usuario = JSON.parse(userData);

      const response = await deliveryApi.getDeliveries();
      const entregasUsuario = response.data.filter(
        (entrega: any) =>
          entrega.entrega.solicitante_id === usuario.id &&
          entrega.entrega.entrega_status === "concluida"
      );

      setTotalEntregas(entregasUsuario.length);
    } catch (err) {
      console.error("Erro ao carregar entregas:", err);
    }
  }

  function abrirFeedback(message: string, success: boolean) {
    setFeedbackMessage(message);
    setFeedbackSuccess(success);
    setFeedbackVisible(true);
  }

  // Suporte a cupons percentuais
  async function ativarCupom(tipo: "valor" | "frete" | "percentual", custo: number, valor: number) {
    try {
      if (!usuario) return;

      if (pontos < custo) {
        abrirFeedback("Você não tem pontos suficientes para esse cupom.", false);
        return;
      }

      // Salva o cupom ativo localmente
      await AsyncStorage.setItem(
        "cupomAtivo",
        JSON.stringify({ tipo, valor, ativo: true })
      );

      // Atualiza os pontos no banco
      const novosPontos = pontos - custo;
      await userApi.updateUser({
        id: usuario.data.id,
        type: usuario.data.type,
        name: usuario.data.name,
        email: usuario.data.email,
        password: usuario.data.password,
        loyaltyPoints: novosPontos,
      });

      setPontos(novosPontos);
      abrirFeedback("Cupom ativado com sucesso! Você será redirecionado para solicitar sua entrega.", true);

      // Aguarda 2 segundos e redireciona
      setTimeout(() => {
        router.push("/home");
      }, 2000);
    } catch (err) {
      console.error("Erro ao ativar cupom:", err);
      abrirFeedback("Erro ao ativar o cupom. Tente novamente.", false);
    }
  }

  function calcularNivel(qtd: number) {
    if (qtd < 5) return "Bronze I";
    if (qtd < 10) return "Bronze II";
    if (qtd < 15) return "Bronze III";
    if (qtd < 20) return "Prata I";
    if (qtd < 25) return "Prata II";
    if (qtd < 30) return "Prata III";
    if (qtd < 35) return "Ouro I";
    if (qtd < 40) return "Ouro II";
    return "Ouro III";
  }

  // Ícone temático para o nível
  function getNivelIcon(qtd: number) {
    if (qtd < 20) return <MaterialIcons name="military-tech" size={24} color="#cd7f32" />;
    if (qtd < 30) return <MaterialIcons name="military-tech" size={24} color="#c0c0c0" />;
    return <MaterialIcons name="military-tech" size={24} color="#ffd700" />;
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
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

        <ScrollView className="flex-1 w-full xl:w-1/2 mx-auto p-4 space-y-4">
          {/* Header */}
          <View className="flex-row items-center justify-between bg-white px-2 mb-3 rounded-xl shadow p-2">
            <Text className="text-base font-semibold text-[#5E60CE] text-center m-auto">
              Centro de Fidelidade
            </Text>
          </View>

          {/* Pontuação */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                Pontuação Atual
              </Text>
              <Ionicons name="star" size={24} color="#fbbf24" />
            </View>
            <Text className="text-3xl font-bold text-indigo-600">{pontos} pts</Text>
            <Text className="text-gray-500 mt-1">
              Utilize seus pontos para adquirir vouchers exclusivos!
            </Text>

            <View className="h-3 bg-gray-200 rounded-full mt-3 overflow-hidden hover:bg-slate-400">
              <View
                className="h-3 bg-indigo-500 rounded-full hover:bg-indigo-700"
                style={{ width: `${Math.min(progresso * 100, 100)}%` }}
              />
            </View>
          </View>

          {/* Nível baseado em entregas */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Seu Nível
            </Text>

            <Text className="text-indigo-600 font-bold text-lg flex flex-row items-center">
              {getNivelIcon(totalEntregas)} {calcularNivel(totalEntregas)}
            </Text>

            <Text className="text-gray-500 text-sm mt-1">
              {totalEntregas} entregas concluídas
            </Text>

            <View className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden hover:bg-slate-400">
              <View
                className="h-2 bg-indigo-500 rounded-full hover:bg-indigo-700"
                style={{ width: `${(totalEntregas % 5) * 20}%` }}
              />
            </View>
          </View>

          {/* Vouchers */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Vouchers Disponíveis
            </Text>

            {/* Percentuais de desconto */}
            {[
              { label: "5% OFF", custo: 100, valor: 5 },
              { label: "10% OFF", custo: 200, valor: 10 },
              { label: "15% OFF", custo: 300, valor: 15 },
              { label: "20% OFF", custo: 400, valor: 20 },
              { label: "25% OFF", custo: 500, valor: 25 },
            ].map((cupom, index) => (
              <View
                key={index}
                className="flex-row relative items-center justify-between rounded-lg shadow-sm border border-gray-200 mb-2 hover:bg-gray-200"
              >
                <View className="flex-row items-center space-x-3 rounded-xl p-2 my-2">
                  <Ionicons name="pricetag" size={24} color="#5E60CE" />
                  <View>
                    <Text className="font-semibold text-gray-700">
                      {cupom.label}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Custa {cupom.custo} pts
                    </Text>
                  </View>
                </View>
                <Pressable
                  disabled={pontos < cupom.custo}
                  onPress={() => ativarCupom("percentual", cupom.custo, cupom.valor)}
                  className={`absolute right-0 px-3 py-1 mr-3 rounded-lg ${
                    pontos >= cupom.custo ? "bg-indigo-500 hover:bg-indigo-700" : "bg-gray-400"
                  }`}
                >
                  <Text className="text-white text-sm">Ativar</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Feedback modal */}
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