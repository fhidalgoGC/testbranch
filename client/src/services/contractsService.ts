import { PurchaseSaleContract } from "@/types/purchaseSaleContract.types";
import { authenticatedFetch } from "@/utils/apiInterceptors";
import { environment } from "@/environment/environment";

// Interface para la respuesta de contratos basada en la respuesta real de la API
interface ContractResponse {
  data: Array<{
    _id: string;
    folio: string;
    reference_number?: string;
    type: string;
    sub_type: string;
    commodity: {
      commodity_id: string;
      name: string;
    };
    characteristics: {
      configuration_id: string;
      configuration_name: string;
    };
    grade: number;
    participants: Array<{
      people_id: string;
      name: string;
      role: "buyer" | "seller";
    }>;
    price_schedule: Array<{
      pricing_type: string;
      price: number;
      basis: number;
      basis_operation: string;
      future_price: number;
      option_month: string;
      option_year: number;
      payment_currency: string;
      exchange: string;
    }>;
    logistic_schedule: Array<{
      logistic_payment_responsability: string;
      logistic_coordination_responsability: string;
      freight_cost: {
        type: string;
        min: number;
        max: number;
        cost: number;
      };
      payment_currency: string;
    }>;
    quantity: number;
    measurement_unit_id: string;
    measurement_unit: string;
    shipping_start_date: string;
    shipping_end_date: string;
    contract_date: string;
    delivered: string;
    transport: string;
    weights: string;
    inspections: string;
    proteins: string;
    application_priority: number;
    thresholds: {
      min_thresholds_percentage: number;
      max_thresholds_percentage: number;
      min_thresholds_weight: number;
      max_thresholds_weight: number;
    };
    status?: string;
    inventory?: {
      total: number;
      open: number;
      fixed: number;
      unsettled: number;
      settled: number;
      reserved: number;
    };
    remarks: Array<{
      comment: string;
    }>;
  }>;
  _meta: {
    total_elements: number;
    total_pages: number;
    page_number: number;
    page_size: number;
  };
}

interface FetchContractsParams {
  page: number;
  limit: number;
  search?: string;
  filters?: Record<string, any>;
  sort?: { key: string; direction: "asc" | "desc" };
  commodities: Array<{ key: string; value: string; label: string }>;
  authData: {
    partitionKey: string;
    idToken: string;
  };
  contractType?: "purchase" | "sale";
}

// Mapeo de campos de la UI a campos de la API para ordenamiento
const sortFieldMapping: Record<string, string> = {
  customer: "participants.name",
  date: "contract_date",
  commodity: "commodity.name",
  quantity: "quantity",
  price: "price_schedule.price",
  basis: "price_schedule.basis",
  future: "price_schedule.future_price",
  reserve: "reserved",
  id: "_id",
};

export const fetchContractsData = async (params: FetchContractsParams) => {
  const {
    page,
    limit,
    search,
    filters,
    sort,
    commodities,
    authData,
    contractType = "purchase",
  } = params;
  const { partitionKey, idToken } = authData;

  try {
    // Validar tokens de autenticación
    if (!partitionKey || !idToken) {
      console.error("Missing authentication data");
      return {
        data: [] as PurchaseSaleContract[],
        total: 0,
        totalPages: 0,
      };
    }

    // Construir filtros para la API usando $and structure
    const andConditions: any[] = [{ type: contractType }];

    console.log("🔍 SERVICIO - Filtros recibidos:", filters);

    if (filters?.pricingType?.length && !filters.pricingType.includes("all")) {
      console.log(
        "📍 SERVICIO - Aplicando filtro pricingType:",
        filters.pricingType[0],
      );
      andConditions.push({
        "price_schedule.pricing_type": filters.pricingType[0],
      });
    }

    if (filters?.commodity?.length && !filters.commodity.includes("all")) {
      // Los filtros ya contienen los IDs directamente, solo necesitamos usarlos
      const selectedCommodityIds = filters.commodity;

      console.log(
        "📍 SERVICIO - Commodities seleccionadas (IDs):",
        filters.commodity,
      );
      console.log(
        "📍 SERVICIO - Aplicando filtro con IDs:",
        selectedCommodityIds,
      );

      if (selectedCommodityIds.length > 0) {
        andConditions.push({
          "commodity.commodity_id": { $in: selectedCommodityIds },
        });
      }
    }

    // Agregar búsqueda si existe - implementar OR sobre todos los campos relevantes
    if (search) {
      const searchTerm = search.trim();
      if (searchTerm) {
        const orConditions: any[] = [
          // Buscar en participantes (seller/buyer names)
          { "participants.name": { $regex: `.*${searchTerm}`, $options: "i" } },
          // Buscar en commodity name
          { "commodity.name": { $regex: `.*${searchTerm}`, $options: "i" } },
          // Buscar en folio/reference number
          { folio: { $regex: `.*${searchTerm}`, $options: "i" } },
          // Buscar en measurement unit
          { measurement_unit: { $regex: `.*${searchTerm}`, $options: "i" } },
        ];

        // Intentar convertir a número para campos numéricos
        const numericValue = parseFloat(searchTerm);
        if (!isNaN(numericValue)) {
          orConditions.push(
            { "price_schedule.price": numericValue },
            { "price_schedule.basis": numericValue },
            { "price_schedule.future_price": numericValue },
            { quantity: numericValue },
          );
        }

        andConditions.push({ $or: orConditions });
      }
    }

    const apiFilter = { $and: andConditions };

    console.log(
      "🎯 SERVICIO - Filtro final para API:",
      JSON.stringify(apiFilter, null, 2),
    );

    // Construir parámetros de consulta usando el mismo formato que fetchContracts
    const queryParams = new URLSearchParams({
      all: "true",
      filter: JSON.stringify(apiFilter),
      page: (page || 1).toString(),
      limit: (limit || 10).toString(),
    });

    // Agregar ordenamiento en el mismo formato que fetchContracts
    console.log(
      "🔧 SERVICIO - Sort recibido:",
      sort,
      "Type:",
      typeof sort,
      "Sort.key:",
      sort?.key,
    );
    if (sort && sort.key && sort.key !== "undefined" && sort.key !== null) {
      const apiFieldName = sortFieldMapping[sort.key] || sort.key;
      console.log(
        "🔧 SERVICIO - Usando sort:",
        sort.key,
        "→",
        apiFieldName,
        "Direction:",
        sort.direction,
      );
      queryParams.append(
        `sort[${apiFieldName}]`,
        sort.direction === "asc" ? "1" : "-1",
      );
    } else {
      // Ordenamiento por defecto por fecha de contrato descendente
      console.log("🔧 SERVICIO - Usando sort por defecto: contract_date");
      queryParams.append("sort[contract_date]", "-1");
    }

    console.log("🌐 SERVICIO - URL con parámetros:", queryParams.toString());

    const url = `${environment.TRM_BASE_URL}/contracts/sp-contracts?${queryParams.toString()}`;
    console.log("📡 SERVICIO - URL completa:", url);

    // Headers de la petición
    const headers = {
      _partitionkey: partitionKey,
      accept: "*/*",
      "accept-language": "es-419,es;q=0.9",
      authorization: `Bearer ${idToken}`,
      "bt-organization": partitionKey,
      "bt-uid": partitionKey,
      organization_id: partitionKey,
      origin: "https://contracts-develop.grainchain.io",
      "pk-organization": partitionKey,
    };

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `HTTP error! status: ${response.status}, response: ${errorText}`,
      );
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ContractResponse = await response.json();

    // Check if data exists and has data array
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.log("⚠️ SERVICIO - No data found in API response:", data);
      return {
        contracts: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: page,
      };
    }

    // Mapear los datos de la API real a nuestro formato
    const mappedContracts: PurchaseSaleContract[] = data.data.map(
      (contract) => ({
        _id: contract._id,
        folio: contract.folio,
        reference_number: contract.reference_number || "N/A",
        commodity: contract.commodity,
        participants: (contract.participants || []).map((p) => ({
          ...p,
          role: p.role as "buyer" | "seller",
        })),
        characteristics: contract.characteristics,
        type: contract.type as "purchase",
        sub_type: contract.sub_type as
          | "direct"
          | "imported"
          | "importedFreight",
        grade: contract.grade,
        quantity: contract.quantity,
        measurement_unit_id: contract.measurement_unit_id,
        measurement_unit: contract.measurement_unit,
        price_schedule: (contract.price_schedule || []).map((ps) => ({
          ...ps,
          pricing_type: ps.pricing_type as "fixed" | "basis",
          basis_operation: ps.basis_operation as "add" | "subtract",
          payment_currency: ps.payment_currency as "USD" | "MXN",
        })),
        logistic_schedule: (contract.logistic_schedule || []).map((ls) => ({
          ...ls,
          logistic_payment_responsability:
            ls.logistic_payment_responsability as "buyer" | "seller" | "other",
          logistic_coordination_responsability:
            ls.logistic_coordination_responsability as
              | "buyer"
              | "seller"
              | "other",
          payment_currency: ls.payment_currency as "USD" | "MXN",
          freight_cost: {
            ...ls.freight_cost,
            type: ls.freight_cost?.type as "none" | "fixed" | "variable",
          },
        })),
        shipping_start_date: contract.shipping_start_date,
        shipping_end_date: contract.shipping_end_date,
        contract_date: contract.contract_date,
        delivered: contract.delivered,
        transport: contract.transport,
        weights: contract.weights,
        inspections: contract.inspections,
        proteins: contract.proteins,
        application_priority: contract.application_priority,
        status: contract.status,
        thresholds: {
          min_thresholds_percentage:
            contract.thresholds?.min_thresholds_percentage || 0,
          min_thresholds_weight:
            contract.thresholds?.min_thresholds_weight || 0,
          max_thresholds_percentage:
            contract.thresholds?.max_thresholds_percentage || 0,
          max_thresholds_weight:
            contract.thresholds?.max_thresholds_weight || 0,
        },
        inventory: contract.inventory,
        remarks: contract.remarks?.map((r) => r.comment) || [],
      }),
    );

    return {
      data: mappedContracts,
      total: data._meta.total_elements,
      totalPages: data._meta.total_pages,
    };
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return {
      data: [] as PurchaseSaleContract[],
      total: 0,
      totalPages: 0,
    };
  }
};

// Función para eliminar un sub-contrato
export const deleteSubContract = async (
  subContractId: string,
): Promise<boolean> => {
  try {
    console.log("🗑️ Iniciando eliminación de sub-contrato:", subContractId);

    // Usar authenticatedFetch del interceptor
    const { authenticatedFetch } = await import("@/utils/apiInterceptors");

    const response = await authenticatedFetch(
      `${environment.TRM_BASE_URL}/contracts/sp-sub-contracts/${subContractId}`,
      {
        method: "DELETE",
        customHeaders: {
          _partitionkey: localStorage.getItem("partition_key") || "",
          "bt-organization": localStorage.getItem("partition_key") || "",
          "bt-uid": localStorage.getItem("partition_key") || "",
          organization_id: localStorage.getItem("partition_key") || "",
          "pk-organization": localStorage.getItem("partition_key") || "",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
        },
      },
    );

    console.log("📡 Delete response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Error al eliminar sub-contrato! status: ${response.status}, response: ${errorText}`,
      );
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("✅ Sub-contrato eliminado exitosamente");
    return true;
  } catch (error) {
    console.error("❌ Error eliminando sub-contrato:", error);
    throw error;
  }
};

// Service function to generate a new contract ID
export const generateContractId = async (): Promise<string | null> => {
  try {
    console.log("🆔 Generating new contract ID....");
    const response = await authenticatedFetch(
      `${environment.TRM_BASE_URL}/contracts/sp-contracts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: "",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅  SERVICE Contract ID generated:", data.data.key);
    return data.data.key;
  } catch (error) {
    console.error("❌ SERVICE Error generating contract ID:", error);
    return null;
  }
};

// Service function to submit/update a contract
export const submitContract = async (
  contractId: string,
  contractData: any,
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("📝 Submitting contract:", contractId);
    console.log("📦 Contract data:", JSON.stringify(contractData, null, 2));

    const url = `${environment.TRM_BASE_URL}/contracts/sp-contracts/${contractId}`;
    console.log("📡 Submit URL:", url);

    const response = await authenticatedFetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(contractData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Error submitting contract! status: ${response.status}, response: ${errorText}`,
      );

      // Parse error message from response - prioritize messages.value from API
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        // Priority order: messages.value (API specific error) > message > error > raw text
        if (errorData.messages && errorData.messages.value) {
          errorMessage = errorData.messages.value;
        } else {
          errorMessage = errorData.message || errorData.error || errorText;
        }
      } catch {
        errorMessage = errorText || `Error ${response.status}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const responseData = await response.json();
    console.log("✅ Contract submitted successfully:", responseData);

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error submitting contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
