import { useState, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Keyboard,
  Modal,
} from "react-native";
import {
  Entypo,
  Fontisto,
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome,
} from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/datepicker.css";
import { GOOGLE_MAPS_API_KEY } from "@env";

// =========================================
// Tipos
// =========================================
type EnderecoCompleto = {
  lat: number;
  lon: number;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  endereco_formatado?: string;
};

type OpenKey = "retirada" | "destino" | number | null;

type Props = {
  onSetRetirada: (endereco: EnderecoCompleto | null) => void;
  onSetParadas: (enderecos: EnderecoCompleto[]) => void;
  onSetDestino: (endereco: EnderecoCompleto | null) => void;
  onSetDataAgendada?: (data: Date | null) => void; // <--- NOVO
};

const INPUT_ROW_HEIGHT = 48;
const SUGGESTION_LIMIT = 5;

// =========================================
// Busca de endereços completa (com dados detalhados)
// =========================================
async function buscarSugestoes(query: string): Promise<EnderecoCompleto[]> {
  if (!query.trim()) return [];
  try {
    const resp = await fetch(`https://places.googleapis.com/v1/places:autocomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
      },
      body: JSON.stringify({
        input: query,
        languageCode: "pt-BR",
        regionCode: "BR",
      }),
    });

    const data = await resp.json();
    if (!data.suggestions) return [];

    const results: EnderecoCompleto[] = [];

    for (const sug of data.suggestions.slice(0, SUGGESTION_LIMIT)) {
      const placeId = sug.placePrediction?.placeId;
      if (!placeId) continue;

      const detailResp = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?languageCode=pt-BR&regionCode=BR`,
        {
          headers: {
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask": `
              id,
              formattedAddress,
              location,
              addressComponents
            `.replace(/\s+/g, ""),
          },
        }
      );

      const detail = await detailResp.json();

      if (detail?.location) {
        const endereco: EnderecoCompleto = {
          lat: detail.location.latitude,
          lon: detail.location.longitude,
          endereco_formatado: detail.formattedAddress || "",
        };

        // Extrai informações detalhadas do endereço
        if (detail.addressComponents) {
          for (const comp of detail.addressComponents) {
            const tipo = comp.types?.[0];
            const valor = comp.longText || comp.shortText || "";
            switch (tipo) {
              case "route":
                endereco.logradouro = valor;
                break;
              case "street_number":
                endereco.numero = valor;
                break;
              case "sublocality":
              case "sublocality_level_1":
                endereco.bairro = valor;
                break;
              case "administrative_area_level_2":
                endereco.cidade = valor;
                break;
              case "administrative_area_level_1":
                endereco.estado = valor;
                break;
              case "postal_code":
                endereco.cep = valor;
                break;
            }
          }
        }

        results.push(endereco);
      }
    }

    return results;
  } catch (err) {
    console.error("Erro ao buscar endereços:", err);
    return [];
  }
}

// =========================================
// Componente principal
// =========================================
export function SearchBar({
  onSetRetirada,
  onSetParadas,
  onSetDestino,
  onSetDataAgendada,
}: Props) {
  const [retirada, setRetirada] = useState("");
  const [destino, setDestino] = useState("");
  const [extraDestinos, setExtraDestinos] = useState<string[]>([]);
  const [paradasCoords, setParadasCoords] = useState<(EnderecoCompleto | null)[]>([]);
  const [sugestoesRetirada, setSugestoesRetirada] = useState<EnderecoCompleto[]>([]);
  const [sugestoesDestino, setSugestoesDestino] = useState<EnderecoCompleto[]>([]);
  const [sugestoesExtras, setSugestoesExtras] = useState<Record<number, EnderecoCompleto[]>>({});
  const [openDropdown, setOpenDropdown] = useState<OpenKey>(null);

  const [modoHorario, setModoHorario] = useState<"Agora" | "Agendar">("Agora");
  const [dataAgendada, setDataAgendada] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  const debounceRetiradaRef = useRef<NodeJS.Timeout | null>(null);
  const debounceDestinoRef = useRef<NodeJS.Timeout | null>(null);
  const debounceExtrasRef = useRef<Record<number, NodeJS.Timeout | null>>({});

  function atualizarParadasNoPai(novas: (EnderecoCompleto | null)[]) {
    onSetParadas(novas.filter(Boolean) as EnderecoCompleto[]);
  }

  function closeAllDropdowns() {
    setOpenDropdown(null);
    setSugestoesRetirada([]);
    setSugestoesDestino([]);
    setSugestoesExtras({});
  }

  // ==============================
  // Funções de busca e seleção
  // ==============================
  async function handleChangeRetirada(texto: string) {
    setRetirada(texto);
    if (debounceRetiradaRef.current) clearTimeout(debounceRetiradaRef.current);
    if (texto.length <= 3) {
      setSugestoesRetirada([]);
      onSetRetirada(null);
      return;
    }
    setOpenDropdown("retirada");
    debounceRetiradaRef.current = setTimeout(async () => {
      const lista = await buscarSugestoes(texto);
      setSugestoesRetirada(lista);
    }, 600);
  }

  function handleSelectRetirada(item: EnderecoCompleto) {
    setRetirada(item.endereco_formatado || "");
    setSugestoesRetirada([]);
    setOpenDropdown(null);
    onSetRetirada(item);
    Keyboard.dismiss();
  }

  async function handleChangeDestino(texto: string) {
    setDestino(texto);
    if (debounceDestinoRef.current) clearTimeout(debounceDestinoRef.current);
    if (texto.length <= 3) {
      setSugestoesDestino([]);
      onSetDestino(null);
      return;
    }
    setOpenDropdown("destino");
    debounceDestinoRef.current = setTimeout(async () => {
      const lista = await buscarSugestoes(texto);
      setSugestoesDestino(lista);
    }, 600);
  }

  function handleSelectDestino(item: EnderecoCompleto) {
    setDestino(item.endereco_formatado || "");
    setSugestoesDestino([]);
    setOpenDropdown(null);
    onSetDestino(item);
    Keyboard.dismiss();
  }

  async function handleChangeExtra(texto: string, index: number) {
    const novos = [...extraDestinos];
    novos[index] = texto;
    setExtraDestinos(novos);
    if (debounceExtrasRef.current[index])
      clearTimeout(debounceExtrasRef.current[index] as NodeJS.Timeout);
    if (texto.length <= 3) {
      setSugestoesExtras((prev) => ({ ...prev, [index]: [] }));
      const novasCoords = [...paradasCoords];
      novasCoords[index] = null;
      setParadasCoords(novasCoords);
      atualizarParadasNoPai(novasCoords);
      return;
    }
    setOpenDropdown(index);
    debounceExtrasRef.current[index] = setTimeout(async () => {
      const lista = await buscarSugestoes(texto);
      setSugestoesExtras((prev) => ({ ...prev, [index]: lista }));
    }, 600);
  }

  function handleSelectExtra(item: EnderecoCompleto, index: number) {
    const novosTxt = [...extraDestinos];
    novosTxt[index] = item.endereco_formatado || "";
    setExtraDestinos(novosTxt);
    setSugestoesExtras((prev) => ({ ...prev, [index]: [] }));
    setOpenDropdown(null);
    const novasCoords = [...paradasCoords];
    while (novasCoords.length < novosTxt.length) novasCoords.push(null);
    novasCoords[index] = item;
    setParadasCoords(novasCoords);
    atualizarParadasNoPai(novasCoords);
    Keyboard.dismiss();
  }

  function handleAddDestino() {
    setExtraDestinos((prev) => [...prev, ""]);
    setParadasCoords((prev) => [...prev, null]);
  }

  function handleRemoveDestino(index: number) {
    const novosTxt = extraDestinos.filter((_, i) => i !== index);
    setExtraDestinos(novosTxt);
    const novasCoords = paradasCoords.filter((_, i) => i !== index);
    setParadasCoords(novasCoords);
    atualizarParadasNoPai(novasCoords);
  }

  // ==============================
  // Modal de agendamento
  // ==============================
  function handleModoHorarioChange(value: "Agora" | "Agendar") {
    setModoHorario(value);
    if (value === "Agendar") setShowModal(true);
    else setDataAgendada(null);
  }

  const dropdownStyle = {
    position: "absolute" as const,
    top: INPUT_ROW_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 20,
    zIndex: 999,
    overflow: "hidden" as const,
  };

  // ==============================
  // Render
  // ==============================
  return (
    <View className="w-full mt-4">
      {/* Cabeçalho */}
      <View className="flex-row items-center justify-between bg-white px-2 mb-3 rounded-xl shadow p-2">
        <Text className="text-base font-semibold text-[#5E60CE] text-center m-auto">Rota</Text>
      </View>

      {/* Campos principais (retirada, paradas, destino) */}
      <View className="w-full bg-white rounded-xl shadow-md p-2 mb-4 z-10">
        {/* RETIRADA */}
        <View
          style={{ position: "relative", zIndex: openDropdown === "retirada" ? 30 : 1, marginBottom: 8 }}
        >
          <View className="flex flex-row items-center border-b border-slate-400 bg-white rounded-t-md" style={{ height: INPUT_ROW_HEIGHT }}>
            <View className="w-5"><Entypo name="circle" size={20} color="#5390D9" /></View>
            <TextInput
              placeholder="Retirada (Rua e número)"
              value={retirada}
              onChangeText={handleChangeRetirada}
              className="flex-1 text-sm text-gray-700 p-2 outline-none"
              placeholderTextColor="#999"
            />
            <Picker selectedValue={modoHorario} onValueChange={handleModoHorarioChange} className="w-fit h-full bg-transparent">
              <Picker.Item label="Agora" value="Agora" />
              <Picker.Item label="Agendar" value="Agendar" />
            </Picker>
          </View>

          {openDropdown === "retirada" && sugestoesRetirada.length > 0 && (
            <View style={dropdownStyle}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {sugestoesRetirada.map((item, idx) => (
                  <TouchableOpacity key={`retirada-${idx}`} onPress={() => handleSelectRetirada(item)} className="px-2 py-3 border-b border-slate-200">
                    <Text className="text-sm text-gray-800">{item.endereco_formatado}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* PARADAS */}
        {extraDestinos.map((valor, index) => (
          <View key={index} style={{ position: "relative", zIndex: openDropdown === index ? 30 : 1, marginBottom: 8 }}>
            <View className="flex flex-row items-center border-b border-slate-400 bg-white" style={{ height: INPUT_ROW_HEIGHT }}>
              <View className="w-5"><MaterialCommunityIcons name="dots-vertical" size={20} color="#64DFDF" /></View>
              <TextInput
                placeholder={`Parada ${index + 1}`}
                value={valor}
                onChangeText={(t) => handleChangeExtra(t, index)}
                className="flex-1 text-sm text-gray-700 p-2 outline-none"
                placeholderTextColor="#999"
              />
              <Pressable onPress={() => handleRemoveDestino(index)} className="px-2 py-1">
                <Ionicons name="close-outline" size={22} color="#E63946" />
              </Pressable>
            </View>

            {openDropdown === index && (sugestoesExtras[index]?.length ?? 0) > 0 && (
              <View style={dropdownStyle}>
                <ScrollView keyboardShouldPersistTaps="handled">
                  {sugestoesExtras[index]!.map((item, idx2) => (
                    <TouchableOpacity key={`extra-${index}-${idx2}`} onPress={() => handleSelectExtra(item, index)} className="px-2 py-3 border-b border-slate-200">
                      <Text className="text-sm text-gray-800">{item.endereco_formatado}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        ))}

        {/* DESTINO */}
        <View style={{ position: "relative", zIndex: openDropdown === "destino" ? 30 : 1, marginBottom: 8 }}>
          <View className="flex flex-row items-center border-b border-slate-400 bg-white" style={{ height: INPUT_ROW_HEIGHT }}>
            <View className="w-5"><Fontisto name="map-marker-alt" size={20} color="#5390D9" /></View>
            <TextInput
              placeholder="Destino (Rua e número)"
              value={destino}
              onChangeText={handleChangeDestino}
              className="flex-1 text-sm text-gray-700 p-2 outline-none"
              placeholderTextColor="#999"
            />
          </View>

          {openDropdown === "destino" && sugestoesDestino.length > 0 && (
            <View style={dropdownStyle}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {sugestoesDestino.map((item, idx) => (
                  <TouchableOpacity key={`destino-${idx}`} onPress={() => handleSelectDestino(item)} className="px-2 py-3 border-b border-slate-200">
                    <Text className="text-sm text-gray-800">{item.endereco_formatado}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Adicionar parada */}
        <Pressable onPress={handleAddDestino} className="flex-row items-center justify-center py-2 rounded-b-md">
          <FontAwesome name="plus" size={16} color="#5E60CE" />
          <Text className="ml-2 text-base font-medium text-[#5E60CE]">Adicionar ponto de entrega</Text>
        </Pressable>

        {dataAgendada && (
          <Text className="text-center text-[#5E60CE] font-medium mt-2">
            Agendado para {dataAgendada.toLocaleDateString()}{" "}
            {dataAgendada.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        )}
      </View>

      {/* Modal de Agendamento */}
      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 items-center justify-center">
          <View className="bg-white rounded-2xl w-full max-w-2xl p-5 shadow-lg">
            <Text className="text-center text-lg font-semibold text-[#5E60CE] mb-4">
              Agendar viagem
            </Text>

            <DatePicker
              selected={dataAgendada || new Date()}
              onChange={(date: Date | null) => {
                if (date) setDataAgendada(date);
              }}
              showTimeSelect
              dateFormat="Pp"
              minDate={new Date()}
              className="border border-gray-300 rounded-md p-2 w-full text-center"
              timeCaption="Horário"
            />

            <View className="flex-row justify-around mt-5">
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                <Text className="text-gray-700 font-medium">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (onSetDataAgendada) onSetDataAgendada(dataAgendada);
                  setShowModal(false);
                }}
                className="bg-[#5E60CE] px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {openDropdown !== null && (
        <Pressable
          onPress={closeAllDropdowns}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}
    </View>
  );
}