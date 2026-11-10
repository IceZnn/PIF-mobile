import { API_BASE_URL } from "../config/api";

export class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class SessionExpiredError extends ApiError {
  constructor(message = "Sua sessão expirou. Entre novamente.") {
    super(message, 401);
    this.name = "SessionExpiredError";
  }
}

function getErrorMessage(data, fallback) {
  const validationMessages = Object.values(data?.errors || {})
    .flat()
    .filter((message) => typeof message === "string");

  if (validationMessages.length > 0) {
    return validationMessages.join("\n");
  }

  return data?.mensagem || data?.message || fallback;
}

async function request(path, { method = "GET", token, body } = {}) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique a rede e o endereço da API.",
    );
  }

  let data = null;
  if (response.status !== 204) {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      if (response.status === 401 || response.status === 419) {
        throw new SessionExpiredError();
      }

      throw new ApiError(
        "O servidor retornou uma resposta inválida. Verifique a configuração da API.",
        response.status,
      );
    }

    try {
      data = await response.json();
    } catch {
      throw new ApiError(
        "O servidor retornou dados inválidos. Tente novamente.",
        response.status,
      );
    }
  }

  if (response.status === 401 || response.status === 419) {
    throw new SessionExpiredError(getErrorMessage(data, undefined));
  }

  if (!response.ok || data?.erro === "s") {
    throw new ApiError(
      getErrorMessage(data, "Não foi possível concluir a solicitação."),
      response.status,
    );
  }

  return data;
}

export const api = {
  async login(credentials) {
    const data = await request("/api/login", {
      method: "POST",
      body: credentials,
    });

    if (typeof data?.token !== "string" || data.token.length === 0) {
      throw new ApiError("A resposta do login não contém uma sessão válida.");
    }

    return data;
  },

  register(form) {
    return request("/api/cadastro_usuario", {
      method: "POST",
      body: form,
    });
  },

  async getRecords(token) {
    const records = await request("/api/desperdicios", { token });
    if (!Array.isArray(records)) {
      throw new ApiError("A lista de registros recebida pela API é inválida.");
    }
    return records;
  },

  async getRecord(token, id) {
    const record = await request(`/api/desperdicios/${id}`, { token });
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new ApiError("Os detalhes recebidos pela API são inválidos.");
    }
    return record;
  },

  createRecord(token, record) {
    return request("/api/desperdicios", {
      method: "POST",
      token,
      body: record,
    });
  },

  recordWeight(token, recordId, weight) {
    return request("/api/desperdicios/peso", {
      method: "POST",
      token,
      body: {
        refeicao_id: recordId,
        peso_desperdicio: weight,
      },
    });
  },

  deleteRecord(token, id) {
    return request(`/api/desperdicios/${id}`, {
      method: "DELETE",
      token,
    });
  },

  logout(token) {
    return request("/api/logout", { method: "POST", token });
  },
};
