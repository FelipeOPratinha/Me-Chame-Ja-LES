import { View, Text, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Header } from "~/components/header";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function Wallet() {
  return (
    <LinearGradient
      colors={["#4EA8DE", "#5E60CE", "#4EA8DE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1 }}
    >
      <View className="flex-1">
        {/* Header fixo no topo */}
        <Header />

        {/* Área principal */}
        <ScrollView className="flex-1 w-full xl:w-1/2 mx-auto p-4 space-y-4">
          {/* Header */}
          <View className="flex-row items-center justify-between bg-white px-2 mb-3 rounded-xl shadow p-2">
            <Text className="text-base font-semibold text-[#5E60CE] text-center m-auto">
              Minha Carteira
            </Text>
          </View>

          {/* Saldo */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-700">Saldo</Text>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-2xl font-bold text-gray-900">R$ 0,00</Text>
              <Pressable className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-700">
                <Text className="text-white font-medium">Recarregar</Text>
              </Pressable>
            </View>
          </View>

          {/* Métodos de Pagamento */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-4 space-y-3">
            <Text className="text-lg font-semibold text-gray-700 mb-2">
              Métodos de Pagamento
            </Text>

            <View className="flex-row items-center justify-between border-b pb-2">
              <View className="flex-row items-center space-x-2">
                <Ionicons name="card-outline" size={22} color="#5E60CE" />
                <Text className="text-gray-700">Visa •••• 1234</Text>
              </View>
              <Text className="text-gray-500 cursor-pointer hover:text-gray-700">Remover</Text>
            </View>

            <View className="flex-row items-center justify-between border-b pb-2">
              <View className="flex-row items-center space-x-2">
                <MaterialIcons name="account-balance-wallet" size={22} color="#5E60CE" />
                <Text className="text-gray-700">Dinheiro</Text>
              </View>
              <Text className="text-gray-500">Padrão</Text>
            </View>

            <Pressable className="min-w-52 w-full xl:w-fit mt-3 mx-auto border border-dashed border-gray-400 rounded-lg py-2 items-center hover:bg-slate-200">
              <Text className="text-gray-500">+ Adicionar novo cartão</Text>
            </Pressable>
          </View>

          {/* Histórico */}
          <View className="bg-white rounded-xl shadow-md p-4">
            <Text className="text-lg font-semibold text-gray-700 mb-3">
              Histórico de Transações
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between cursor-pointer hover:bg-slate-200 p-4 rounded-2xl">
                <Text className="text-gray-600">Pedido #1 - Recarga de crédito</Text>
                <Text className="text-green-600 font-semibold">+ R$ 50,00</Text>
              </View>
              <View className="flex-row justify-between cursor-pointer hover:bg-slate-200 p-4 rounded-2xl">
                <Text className="text-gray-600">Pedido #2 - Pagamento de entrega</Text>
                <Text className="text-red-600 font-semibold">- R$ 50,00</Text>
              </View>
              <Text className="text-gray-400 text-center mt-4 cursor-pointer hover:bg-slate-200 p-4 rounded-2xl">
                Nenhuma outra transação recente
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}