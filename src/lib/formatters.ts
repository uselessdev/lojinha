export const formatters = {
  date: (date?: number | Date, style: "full" | "long" | "medium" | "short" | undefined = "medium") => {
    const intl = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: style,
    });

    return intl.format(date);
  },
};
