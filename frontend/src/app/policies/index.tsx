import { View, Text, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Header } from "~/components/header";

export default function Policies() {
  return (
    <LinearGradient
      colors={["#4EA8DE", "#5E60CE", "#4EA8DE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1 }}
    >
      <View className="flex-1">
        {/* Header fixo */}
        <Header />

        {/* Conteúdo */}
        <ScrollView className="flex-1 w-full xl:w-1/2 mx-auto p-4 space-y-4">
          {/* Header */}
          <View className="flex-row items-center justify-between bg-white px-2 mb-3 rounded-xl shadow p-2">
            <Text className="text-base font-semibold text-[#5E60CE] text-center m-auto">
              Suporte e Atendimento
            </Text>
          </View>

          {/* Termos e Condições */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-5 hover:bg-slate-200">
            <Text className="text-lg font-semibold text-gray-800">
              Termos e Condições
            </Text>
            <Text className="text-gray-600 mt-2">
              Ao utilizar nosso aplicativo, você concorda com os termos
              estabelecidos nesta plataforma.
            </Text>
            <Pressable className="bg-indigo-500 mt-3 self-end px-3 py-2 rounded-md hover:bg-indigo-700">
              <Text className="text-white font-medium">Mais informações</Text>
            </Pressable>
          </View>

          {/* Política de Privacidade */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-5 hover:bg-slate-200">
            <Text className="text-lg font-semibold text-gray-800">
              Política de Privacidade
            </Text>
            <Text className="text-gray-600 mt-2">
              Veja como coletamos, armazenamos e utilizamos suas informações
              pessoais de forma segura.
            </Text>
            <Pressable className="bg-indigo-500 mt-3 self-end px-3 py-2 rounded-md hover:bg-indigo-700">
              <Text className="text-white font-medium">Mais informações</Text>
            </Pressable>
          </View>

          {/* Segurança */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-5 hover:bg-slate-200">
            <Text className="text-lg font-semibold text-gray-800">
              Segurança
            </Text>
            <Text className="text-gray-600 mt-2">
              Suas informações são protegidas por criptografia e medidas
              avançadas de segurança digital.
            </Text>
            <Pressable className="bg-indigo-500 mt-3 self-end px-3 py-2 rounded-md hover:bg-indigo-700">
              <Text className="text-white font-medium">Mais informações</Text>
            </Pressable>
          </View>

          {/* Suporte */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-5 hover:bg-slate-200">
            <Text className="text-lg font-semibold text-gray-800">
              Suporte
            </Text>
            <Text className="text-gray-600 mt-2">
              Precisa de ajuda com o aplicativo? Confira nossa central de ajuda
              com respostas para as dúvidas mais comuns.
            </Text>
            <Pressable className="bg-indigo-500 mt-3 self-end px-3 py-2 rounded-md hover:bg-indigo-700">
              <Text className="text-white font-medium">Consultar Suporte</Text>
            </Pressable>
          </View>

          {/* Atendimento */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-8 hover:bg-slate-200">
            <Text className="text-lg font-semibold text-gray-800">
              Atendimento
            </Text>
            <Text className="text-gray-600 mt-2">
              Entre em contato diretamente com nossa equipe de atendimento para
              resolver qualquer problema ou enviar feedback.
            </Text>
            <Pressable className="bg-indigo-500 mt-3 self-end px-3 py-2 rounded-md hover:bg-indigo-700">
              <Text className="text-white font-medium">Solicitar Atendimento</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}