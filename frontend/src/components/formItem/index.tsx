import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FeedbackModal } from "~/components/feedbackModal";

type ItemEntrega = {
  nome_item: string;
  quantidade: string;
  peso_kg: string;
  observacoes: string;
};

type FormItemProps = {
  onConfirmar: (itens: ItemEntrega[]) => void;
  goBack: () => void;
};

export function FormItem({ onConfirmar, goBack }: FormItemProps) {
  const [itens, setItens] = useState<ItemEntrega[]>([
    { nome_item: "", quantidade: "", peso_kg: "", observacoes: "" },
  ]);

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(true);

  const handleChange = (index: number, campo: keyof ItemEntrega, valor: string) => {
    const novos = [...itens];
    novos[index][campo] = valor;
    setItens(novos);
  };

  const adicionarItem = () => {
    setItens([...itens, { nome_item: "", quantidade: "", peso_kg: "", observacoes: "" }]);
  };

  const removerItem = (index: number) => {
    if (index === 0) return;
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const errosPorItem: string[] = [];

    itens.forEach((item, idx) => {
      const camposFaltando: string[] = [];
      if (!item.nome_item.trim()) camposFaltando.push("Nome do Item");
      if (!item.quantidade.trim()) camposFaltando.push("Quantidade");
      if (!item.peso_kg.trim()) camposFaltando.push("Peso (kg)");

      if (camposFaltando.length > 0) {
        errosPorItem.push(
          `Item ${idx + 1}\n${camposFaltando.map((c) => `- ${c}`).join("\n")}`
        );
      }
    });

    if (errosPorItem.length > 0) {
      const mensagem =
        "Preencha os campos obrigatórios:\n\n" + errosPorItem.join("\n\n");
      setFeedbackMessage(mensagem);
      setFeedbackSuccess(false);
      setFeedbackVisible(true);
      return;
    }

    onConfirmar(itens);
  };

  return (
    <View className="flex-1 bg-white p-6 rounded-2xl shadow-lg">
      <Text className="text-2xl font-bold text-[#5E60CE] text-center mb-4">
        Itens da Entrega
      </Text>

      <ScrollView
        className="flex-1 mb-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {itens.map((item, index) => (
          <View
            key={index}
            className="border border-gray-300 rounded-xl p-4 mb-4 bg-gray-50"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold text-[#5E60CE]">
                Item {index + 1}
              </Text>

              {index !== 0 && (
                <Pressable onPress={() => removerItem(index)}>
                  <MaterialIcons name="delete-outline" size={22} color="#D9534F" />
                </Pressable>
              )}
            </View>

            <Text className="text-sm text-gray-700 mb-1">Nome do Item *</Text>
            <TextInput
              value={item.nome_item}
              onChangeText={(valor) => handleChange(index, "nome_item", valor)}
              placeholder="Ex: Caixa de ferramentas"
              className="border border-gray-300 rounded-lg p-3 mb-3 bg-white"
            />

            <Text className="text-sm text-gray-700 mb-1">Quantidade *</Text>
            <TextInput
              value={item.quantidade}
              onChangeText={(valor) => handleChange(index, "quantidade", valor)}
              placeholder="Ex: 2"
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg p-3 mb-3 bg-white"
            />

            <Text className="text-sm text-gray-700 mb-1">Peso (kg) *</Text>
            <TextInput
              value={item.peso_kg}
              onChangeText={(valor) => handleChange(index, "peso_kg", valor)}
              placeholder="Ex: 25"
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg p-3 mb-3 bg-white"
            />

            <Text className="text-sm text-gray-700 mb-1">Observações</Text>
            <TextInput
              value={item.observacoes}
              onChangeText={(valor) => handleChange(index, "observacoes", valor)}
              placeholder="Ex: Frágil, manusear com cuidado"
              multiline
              className="border border-gray-300 rounded-lg p-3 bg-white"
            />
          </View>
        ))}
      </ScrollView>

      {/* Botões */}
      <Pressable
        onPress={adicionarItem}
        className="border border-dashed border-[#5E60CE] rounded-lg p-4 mb-4 flex-row items-center justify-center"
      >
        <MaterialIcons name="add" size={22} color="#5E60CE" />
        <Text className="text-[#5E60CE] ml-2 font-medium">
          Adicionar outro item
        </Text>
      </Pressable>

      <Pressable
        onPress={handleSubmit}
        className="bg-[#5E60CE] rounded-lg p-4 mb-3"
      >
        <Text className="text-white font-semibold text-center text-lg">
          Solicitar corrida
        </Text>
      </Pressable>

      <Pressable
        onPress={goBack}
        className="border border-gray-300 rounded-lg p-4"
      >
        <Text className="text-gray-600 font-medium text-center">Voltar</Text>
      </Pressable>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={feedbackVisible}
        message={feedbackMessage}
        success={feedbackSuccess}
        onClose={() => setFeedbackVisible(false)}
      />
    </View>
  );
}