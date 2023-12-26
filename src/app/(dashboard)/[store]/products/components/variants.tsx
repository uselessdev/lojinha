import { PlusIcon, Trash2Icon } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

export function Variants(props: { index: number }) {
  const { control } = useFormContext();

  const values = useFieldArray({
    control,
    name: `variants[${props.index}].values`,
  });

  return (
    <div className="space-y-3">
      {values.fields.map((value, index) => (
        <FormField
          key={value.id}
          name={`variants.${props.index}.values.${index}`}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Input {...field} placeholder="Valor" />
              </FormControl>
              <Button type="button" variant="ghost" size="icon" onClick={() => values.remove(index)}>
                <span className="sr-only">Remover Valor</span>
                <Trash2Icon />
              </Button>
            </FormItem>
          )}
        />
      ))}

      <Button type="button" variant="outline" size="sm" onClick={() => values.append("")}>
        <PlusIcon className="h-4 w-4" /> Adicionar Valor
      </Button>
    </div>
  );
}
