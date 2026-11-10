const periodLabels = {
  cafe: "Café",
  almoco: "Almoço",
  cafe_tarde: "Café da tarde",
};

const roomLabels = {
  fund1: "Fundamental 1",
  fund2: "Fundamental 2",
  em: "E.M.",
  senai: "SENAI",
};

export function parseDecimal(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = String(value ?? "")
    .trim()
    .replace(",", ".");
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatKg(value) {
  const number = parseDecimal(value);
  return number === null
    ? "—"
    : `${number.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} kg`;
}

export function formatPercent(value) {
  const number = parseDecimal(value);
  return number === null
    ? "—"
    : `${number.toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}%`;
}

export function formatDate(value) {
  if (!value) {
    return "Data não informada";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Data não informada"
    : date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      });
}

export function periodLabel(period) {
  return periodLabels[period] || "Período não informado";
}

export function roomLabelsFor(rooms) {
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return "Salas não informadas";
  }

  return rooms.map((room) => roomLabels[room] || room).join(", ");
}

export function getRecordStatus(record) {
  if (record?.peso_desperdicio === null || record?.peso_desperdicio === undefined) {
    return "Sem peso registrado";
  }

  const prepared = parseDecimal(record.quantidade_preparada);
  const weight = parseDecimal(record.peso_desperdicio);
  const target = parseDecimal(record.maximo_desperdicio);
  if (prepared === null || prepared <= 0 || weight === null) {
    return "Percentual não calculável";
  }
  if (target === null) {
    return "Meta não informada";
  }

  return (weight / prepared) * 100 <= target
    ? "Dentro da meta"
    : "Atenção";
}
