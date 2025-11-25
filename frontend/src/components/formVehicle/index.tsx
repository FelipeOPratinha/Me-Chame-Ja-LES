import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { FeedbackModal } from "~/components/feedbackModal";
import { Ionicons } from "@expo/vector-icons";

export function FormVehicle({ goBack }: { goBack: () => void }) {
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [tipo, setTipo] = useState("carro");
  const [capacidadeKg, setCapacidadeKg] = useState("");
  const [transporteAnimais, setTransporteAnimais] = useState(false);
  const [transporteMaterialConstrucao, setTransporteMaterialConstrucao] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(true);

  // Carrega ID do usuário logado
  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const dados = await AsyncStorage.getItem("usuarioLogado");
        if (dados) {
          const user = JSON.parse(dados);
          setUsuarioId(user.id);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário logado:", error);
      }
    };
    carregarUsuario();
  }, []);

  const camposObrigatorios = [
    { label: "Placa", valor: placa },
    { label: "Marca", valor: marca },
    { label: "Modelo", valor: modelo },
    { label: "Ano", valor: ano },
    { label: "Tipo", valor: tipo },
    { label: "Capacidade (kg)", valor: capacidadeKg },
  ];

  const validarCampos = () => {
    const campoFaltando = camposObrigatorios.find((c) => !c.valor.trim());
    if (campoFaltando) {
      setFeedbackMessage(`O campo "${campoFaltando.label}" é obrigatório.`);
      setFeedbackSuccess(false);
      setFeedbackVisible(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validarCampos()) return;
    if (!usuarioId) {
      setFeedbackMessage("Usuário não identificado.");
      setFeedbackSuccess(false);
      setFeedbackVisible(true);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3000/vehicle/save", {
        userId: usuarioId,
        licensePlate: placa,
        manufacturer: marca,
        model: modelo,
        year: parseInt(ano),
        type: tipo,
        capacity: parseInt(capacidadeKg),
        transportsAnimals: transporteAnimais,
        transportsMaterials: transporteMaterialConstrucao,
      });

      if (response.data?.status === 409) {
        setFeedbackMessage("Veículo já existente no banco.");
        setFeedbackSuccess(false);
      } else if (response.status === 200) {
        setFeedbackMessage("Veículo cadastrado com sucesso!");
        setFeedbackSuccess(true);

        // Dispara evento global para atualizar VehicleCard
        window.dispatchEvent(new Event("novoVeiculoCadastrado"));

        setPlaca("");
        setMarca("");
        setModelo("");
        setAno("");
        setTipo("carro");
        setCapacidadeKg("");
        setTransporteAnimais(false);
        setTransporteMaterialConstrucao(false);

        setTimeout(goBack, 1000);
      } else {
        setFeedbackMessage("Não foi possível cadastrar o veículo.");
        setFeedbackSuccess(false);
      }
    } catch (error: any) {
      console.error("Erro ao salvar veículo:", error);
      if (
        error.response?.data?.message?.includes("duplicate") ||
        error.response?.data?.message?.includes("já existe")
      ) {
        setFeedbackMessage("Veículo já existente no banco.");
      } else {
        setFeedbackMessage("Veículo já existente no banco.");
      }
      setFeedbackSuccess(false);
    } finally {
      setLoading(false);
      setFeedbackVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white rounded-2xl shadow-lg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View className="w-full max-w-2xl bg-white rounded-2xl p-5 pb-0 mb-4">
        <Text className="text-lg font-bold text-[#5E60CE] text-center">
          Cadastro de Veículo
        </Text>
      </View>

      {/* Campos com scroll */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Placa */}
        <Text className="text-sm text-gray-700 mb-1">
          Placa <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={placa}
          onChangeText={setPlaca}
          placeholder="Ex: ABC1234"
          className="border border-gray-300 rounded-lg p-3 mb-2 bg-gray-50"
        />

        {/* Marca */}
        <Text className="text-sm text-gray-700 mb-1">
          Marca <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={marca}
          onChangeText={setMarca}
          placeholder="Ex: Volvo, Honda..."
          className="border border-gray-300 rounded-lg p-3 mb-2 bg-gray-50"
        />

        {/* Modelo */}
        <Text className="text-sm text-gray-700 mb-1">
          Modelo <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={modelo}
          onChangeText={setModelo}
          placeholder="Ex: FH, CG 160..."
          className="border border-gray-300 rounded-lg p-3 mb-2 bg-gray-50"
        />

        {/* Ano */}
        <Text className="text-sm text-gray-700 mb-1">
          Ano <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={ano}
          onChangeText={setAno}
          keyboardType="numeric"
          placeholder="Ex: 2020"
          className="border border-gray-300 rounded-lg p-3 mb-2 bg-gray-50"
        />

        {/* Tipo */}
        <Text className="text-sm text-gray-700 mb-1">
          Tipo <Text className="text-red-500">*</Text>
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          {[
            "carro",
            "hatch",
            "moto",
            "van",
            "utilitario",
            "caminhao",
            "outro",
          ].map((item) => (
            <Pressable
              key={item}
              onPress={() => setTipo(item)}
              className={`px-4 py-2 mr-2 rounded-lg ${
                tipo === item ? "bg-indigo-500 hover:bg-indigo-700" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <Text
                className={`text-sm ${
                  tipo === item ? "text-white" : "text-gray-700"
                }`}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        

        {/* Capacidade */}
        <Text className="text-sm text-gray-700 mb-1">
          Capacidade (kg) <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={capacidadeKg}
          onChangeText={setCapacidadeKg}
          keyboardType="numeric"
          placeholder="Ex: 100"
          className="border border-gray-300 rounded-lg p-3 mb-2 bg-gray-50"
        />

        {/* Switches */}
        <View className="flex-row items-center justify-between py-2 mb-2">
          <Text className="text-sm text-gray-700">Transporte de Animais</Text>
          <Switch
            value={transporteAnimais}
            onValueChange={setTransporteAnimais}
            thumbColor={transporteAnimais ? "#3b82f6" : "#6366f1"}
          />
        </View>

        <View className="flex-row items-center justify-between py-2 mb-2">
          <Text className="text-sm text-gray-700">
            Transporte de Material de Construção
          </Text>
          <Switch
            value={transporteMaterialConstrucao}
            onValueChange={setTransporteMaterialConstrucao}
            thumbColor={transporteMaterialConstrucao ? "#3b82f6" : "#6366f1"}
          />
        </View>
      </ScrollView>

      {/* Botões fixos */}
      <View className="flex flex-row p-5 pt-0 mt-4 bg-white rounded-b-2xl">
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className={`w-fit min-w-24 mx-auto p-3 rounded-xl shadow-md ${
            loading ? "bg-gray-400" : "bg-indigo-500 hover:bg-indigo-700"
          }`}
        >
          <View className="flex-row items-center justify-center">
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-white font-semibold text-center">
                  Salvar
                </Text>
              </>
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={goBack}
          className="bg-blue-500 w-fit min-w-24 mx-auto p-3 rounded-xl shadow-md hover:bg-blue-700"
        >
          <Text className="text-white font-semibold text-center">
            Voltar
          </Text>
        </Pressable>
      </View>

      {/* Feedback */}
      <FeedbackModal
        visible={feedbackVisible}
        message={feedbackMessage}
        success={feedbackSuccess}
        onClose={() => setFeedbackVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}