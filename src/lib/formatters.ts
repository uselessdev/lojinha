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
};
