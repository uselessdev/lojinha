export const formatters = {
  date: (date?: number | Date, style: "full" | "long" | "medium" | "short" | undefined = "medium") => {
    const intl = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: style,
    });

    return intl.format(date);
  },

  applyDataSpec: <T extends Record<"eid" | "store", string | number>>(data: T[] | T) => {
    if (Array.isArray(data)) {
      return data.map((data) => {
        const { eid, store, ...result } = { ...data, id: data.eid };
        return result;
      });
    }

    const { eid, store, ...result } = { ...data, id: data.eid };

    return result;
  },

  number: (value: number | string) => {
    if (typeof value === "number") {
      return value;
    }

    return Number(value.replace(/\D+/g, ""));
  },

  currency: (value: number) => {
    const intl = new Intl.NumberFormat("pt-BR", {
      currency: "BRL",
      style: "currency",
    });

    return intl.format(value / 100);
  },

  priceToNumberOrUndefined: (price?: string) => {
    if (!price) {
      return undefined;
    }

    return formatters.number(price);
  },
};
