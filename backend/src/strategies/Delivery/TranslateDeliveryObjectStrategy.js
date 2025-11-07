class TranslateDeliveryObjectStrategy {
    static async execute(data, mode) {
        if (!data) return {};

        try {
            const keyMap = {
                entrega_valor: "value",
                entrega_status: "status",
                entrega_descricao: "description",
                entrega_tipo_categoria: "categoryType",
                entrega_tipo_transporte: "transportType",
                entrega_data_agendada: "scheduledTime",
                entrega_data_finalizacao: "completedTime",
                veiculo_id: "vehicleId",
                motorista_id: "driverId",
                solicitante_id: "requesterId",
                trajeto_ordem: "order",
                endereco_logradouro: "street",
                endereco_numero: "number",
                endereco_complemento: "unit",
                endereco_bairro: "neighborhood",
                endereco_cidade: "city",
                endereco_estado: "state",
                endereco_cep: "cep",
                endereco_latitude: "latitude",
                endereco_longitude: "longitude",
                item_entrega_nome: "name",
                item_entrega_pesagem: "weight",
                item_entrega_quantidade: "quantity",
                item_entrega_observacoes: "remarks",
                entrega: "delivery",
                trajetos: "routes",
                endereco: "address",
                itens_entrega: "deliveryItems",
                entrega_id: "deliveryId"
            };

            const translate = (obj, map) => {
                if (Array.isArray(obj)) return obj.map(item => translate(item, map));
                if (obj && typeof obj === "object") {
                    const newObj = {};
                    for (const [key, value] of Object.entries(obj)) {
                        const newKey = map[key] ?? key;
                        newObj[newKey] = translate(value, map);
                    }
                    return newObj;
                }
                return obj;
            };

            const handleInput = (input, map) => {
                if (Array.isArray(input)) return input.map(obj => translate(obj, map));
                return translate(input, map);
            };

            if (mode === "toEnglish") {
                return handleInput(data, keyMap);
            }

            else if (mode === "toPortuguese") {
                const invertedMap = Object.fromEntries(Object.entries(keyMap).map(([pt, en]) => [en, pt]));
                return handleInput(data, invertedMap);
            }

            return data;
        } catch (error) {
            throw error.message;
        }
    }
}

module.exports = TranslateDeliveryObjectStrategy;
