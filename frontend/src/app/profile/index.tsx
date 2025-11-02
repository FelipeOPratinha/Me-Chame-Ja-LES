import { useEffect, useState } from "react";
import { View, Text, Image, Pressable, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Header } from "~/components/header";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Profile() {
  const [user, setUser] = useState<{
    id?: number;
    name?: string;
    email?: string;
    cellphone?: string;
    type?: string;
    createdAt?: string;
  } | null>(null);

  const router = useRouter();

  // Carregar usuário logado
  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const dados = await AsyncStorage.getItem("usuarioLogado");
        if (dados) setUser(JSON.parse(dados));
      } catch (error) {
        console.error("Erro ao carregar usuário logado:", error);
      }
    };
    carregarUsuario();
  }, []);

  // Formata número de celular vindo do banco (11996680081 → (11) 99668-0081)
  const formatarCelular = (numero?: string) => {
    if (!numero) return "(00) 00000-0000";
    const digits = numero.replace(/\D/g, "");
    if (digits.length === 11) {
      return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
    }
    return numero;
  };

  // Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("usuarioLogado");
      Alert.alert("Logout", "Você saiu da sua conta.");
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

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
          {/* Card do usuário */}
          <View className="bg-white rounded-2xl shadow-lg p-6 mb-4 items-center hover:bg-slate-200">
            {/* Gera imagem com iniciais do nome */}
            <Image
              source={{
                uri:
                  "https://api.dicebear.com/8.x/initials/png?seed=" +
                  encodeURIComponent(user?.name || "Usuário") +
                  "&backgroundType=gradientLinear&fontWeight=700",
              }}
              className="w-28 h-28 rounded-full mb-4 border-4 border-indigo-200 hover:border-indigo-400"
            />

            <Text className="text-xl font-bold text-gray-900">
              {user?.name || "Usuário"}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {user?.email || "email@exemplo.com"}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {formatarCelular(user?.cellphone)}
            </Text>

            {user?.createdAt && (
              <Text className="text-xs text-gray-500 mt-1">
                Membro desde {new Date(user.createdAt).toLocaleDateString("pt-BR")}
              </Text>
            )}
          </View>

          {/* Opções */}
          <View className="bg-white rounded-2xl shadow-md divide-y mb-4">
            <Pressable className="bg-white border-none flex-row items-center justify-between p-4 m-2 hover:bg-slate-200 rounded-2xl">
              <View className="flex-row items-center space-x-3">
                <Ionicons name="person-circle-outline" size={22} color="#5E60CE" />
                <Text className="text-gray-800">Editar Perfil</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#555" />
            </Pressable>

            <Pressable className="bg-white border-none flex-row items-center justify-between p-4 m-2 hover:bg-slate-200 rounded-2xl">
              <View className="flex-row items-center space-x-3">
                <MaterialIcons name="lock-outline" size={22} color="#5E60CE" />
                <Text className="text-gray-800">Mudar Senha</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#555" />
            </Pressable>

            <Pressable className="bg-white border-none flex-row items-center justify-between p-4 m-2 hover:bg-slate-200 rounded-2xl">
              <View className="flex-row items-center space-x-3">
                <Ionicons name="notifications-outline" size={22} color="#5E60CE" />
                <Text className="text-gray-800">Notificações</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#555" />
            </Pressable>

            <Pressable className="bg-white border-none flex-row items-center justify-between p-4 m-2 hover:bg-slate-200 rounded-2xl">
              <View className="flex-row items-center space-x-3">
                <Ionicons name="document-text-outline" size={22} color="#5E60CE" />
                <Text className="text-gray-800">Termos & Condições</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#555" />
            </Pressable>
          </View>

          {/* Botão de sair */}
          <View className="space-y-3">
            <Pressable
              onPress={handleLogout}
              className="bg-red-500 w-full xl:w-fit min-w-24 mx-auto rounded-xl p-4 items-center shadow hover:bg-red-700"
            >
              <Text className="text-white font-bold">Sair</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}