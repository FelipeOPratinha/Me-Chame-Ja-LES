import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "~/context/AuthContext";
import { FeedbackModal } from "~/components/feedbackModal";

type Props = {
  goBack: () => void;
  onLoginSuccess: () => void;
};

export function FormLogin({ goBack, onLoginSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Modal de feedback
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSuccess, setModalSuccess] = useState(true);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isSenhaValid = senha.length >= 8;

  const handleLogin = async () => {
    if (!isEmailValid || !isSenhaValid) {
      setModalMessage("Preencha os campos corretamente.");
      setModalSuccess(false);
      setModalVisible(true);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("http://localhost:3000/user/login", {
        email,
        password: senha,
      });

      const { success, user, message } = response.data;

      if (success && user) {
        const u = user;
        const userData = {
          id: u.id || u.usuario_id || null,
          name: u.name || u.nome || "Usuário",
          email: u.email || "",
          password: u.password || u.senha || "",
          cellphone: u.cellphone || u.telefone || "",
          type: u.type || u.tipo_usuario || "",
          createdAt: u.createdAt || u.criado_em || null,
        };

        await AsyncStorage.setItem("usuarioLogado", JSON.stringify(userData));
        login(userData);

        // Mostra feedback de sucesso
        setModalMessage(message || "Login realizado com sucesso!");
        setModalSuccess(true);
        setModalVisible(true);

        // Fecha o modal e redireciona
        setTimeout(() => {
          setModalVisible(false);
          onLoginSuccess();
        }, 1500);
      } else {
        // Mostra a mensagem exata do backend
        setModalMessage(message || "Falha ao realizar login.");
        setModalSuccess(false);
        setModalVisible(true);
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Erro inesperado ao tentar conectar ao servidor.";
      setModalMessage(msg);
      setModalSuccess(false);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg">
      <Text className="text-center text-2xl font-bold text-[#5E60CE] mb-6">
        Login
      </Text>

      {/* Email */}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        className="w-full h-12 px-4 border rounded-lg mb-4"
        style={{
          borderColor: isEmailValid ? "green" : "gray",
          backgroundColor: "#f9f9f9",
        }}
      />

      {/* Senha */}
      <TextInput
        value={senha}
        onChangeText={setSenha}
        placeholder="Senha"
        secureTextEntry
        className="w-full h-12 px-4 border rounded-lg mb-4"
        style={{
          borderColor: isSenhaValid ? "green" : "gray",
          backgroundColor: "#f9f9f9",
        }}
      />

      {/* Botão Entrar */}
      <Pressable
        onPress={handleLogin}
        disabled={loading}
        className="w-full h-12 bg-[#5E60CE] rounded-lg flex items-center justify-center mt-2"
      >
        <Text className="text-white font-semibold text-lg">
          {loading ? "Entrando..." : "Entrar"}
        </Text>
      </Pressable>

      {/* Voltar */}
      <Pressable
        onPress={goBack}
        className="mt-6 w-full h-12 border border-gray-300 rounded-lg flex items-center justify-center"
      >
        <Text className="text-gray-600 font-medium">Voltar</Text>
      </Pressable>

      {/* Modal de Feedback */}
      <FeedbackModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        message={modalMessage}
        success={modalSuccess}
      />
    </View>
  );
}