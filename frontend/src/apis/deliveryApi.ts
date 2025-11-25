import { api } from "./configs/axiosConfig";
import { defineCancelApiObject } from "./configs/axiosUtils";

export const deliveryApi = {
  saveDelivery: async function (deliveryObject: any, cancel = false) {
    const response = await api.request({
      url: "/delivery/save",
      method: "POST",
      data: deliveryObject,
      headers: { "Content-Type": "application/json" },
      signal: cancel
        ? cancelApiObject[this.saveDelivery.name].handleRequestCancellation().signal
        : undefined,
    });
    return response.data;
  },

  getDeliveries: async function (cancel = false) {
    const response = await api.request({
      url: "/delivery/getAll",
      method: "GET",
      signal: cancel
        ? cancelApiObject[this.getDeliveries.name].handleRequestCancellation().signal
        : undefined,
    });
    return response.data;
  },

  updateDeliveryStatus: async function (entrega_id: number, motorista_id: number, entrega_status: string, cancel = false) {
    const response = await api.request({
      url: "/delivery/update",
      method: "POST",
      data: { entrega_id, motorista_id, entrega_status },
      headers: { "Content-Type": "application/json" },
      signal: cancel
        ? cancelApiObject[this.updateDeliveryStatus.name].handleRequestCancellation().signal
        : undefined,
    });
    return response.data;
  },

  getDeliveriesByUser: async function (usuario_id: number, cancel = false) {
    const response = await api.request({
      url: `/delivery/getByUser?usuario_id=${usuario_id}`,
      method: "GET",
      signal: cancel
        ? cancelApiObject[this.getDeliveriesByUser.name].handleRequestCancellation().signal
        : undefined,
    });
    return response.data;
  },
};

const cancelApiObject = defineCancelApiObject(deliveryApi);