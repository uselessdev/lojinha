"use client";

import { useMemo, useState } from "react";
import { useCombobox, useMultipleSelection } from "downshift";
import { XIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export type Option = {
  value: string | number;
  label: string;
};

type Props = {
  options?: Option[];
  defaultSelected?: Option[];
  name?: string;
  onChange?: (event: { target: { value: Option[]; name: string } }) => void;
  createWhenNotExists?: boolean;
};

export function Autocomplete({
  onChange,
  createWhenNotExists,
  name = "autocomplete",
  options = [],
  defaultSelected = [],
}: Props) {
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<Option[]>(defaultSelected);

  const items = useMemo(() => {
    const search = value.toLocaleLowerCase();

    return options.filter(
      (option) =>
        !selected.find(({ value }) => {
          return value === option.value;
        }) && option.label.toLocaleLowerCase().includes(search),
      // option.value.toString().includes(search),
    );
  }, [selected, options, value]);

  const { removeSelectedItem, getSelectedItemProps, getDropdownProps } = useMultipleSelection({
    selectedItems: selected,
    onStateChange({ selectedItems: newSelectedItems = [], type }) {
      switch (type) {
        case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
        case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
        case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
        case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
          if (onChange) {
            onChange({ target: { value: newSelectedItems, name } });
          }
          setSelected(newSelectedItems);
          break;
        default:
          break;
      }
    },
  });

  const { getInputProps, isOpen, getToggleButtonProps, getMenuProps, highlightedIndex, getItemProps } = useCombobox({
    items: items.length <= 0 && createWhenNotExists ? [{ label: value, value }] : items,
    itemToString(item) {
      return item?.label ?? "";
    },
    defaultHighlightedIndex: 0,
    selectedItem: null,
    inputValue: value,
    stateReducer(_state, actionAndChanges) {
      const { changes, type } = actionAndChanges;

      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true,
            highlightedIndex: 0,
          };
        default:
          return changes;
      }
    },
    onStateChange({ inputValue, type, selectedItem }) {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (selectedItem) {
            setSelected([...selected, selectedItem]);
            setValue("");
          }

          if (onChange && selectedItem) {
            onChange({ target: { value: [...selected, selectedItem], name } });
          }
          break;
        case useCombobox.stateChangeTypes.InputChange:
          setValue(inputValue ?? "");
          break;
        default:
          break;
      }
    },
  });

  return (
    <div className="relative w-full">
      <div className="flex w-full flex-wrap gap-2 rounded-md border bg-background p-1 focus-within:ring-2 focus-within:ring-zinc-700 focus-within:ring-offset-2">
        {selected.map(function (selectedItemRender, index) {
          return (
            <span
              className="flex max-w-fit items-center rounded-[3px] bg-zinc-400/10 text-xs font-semibold"
              key={`selected-item-${index}`}
              {...getSelectedItemProps({
                selectedItem: selectedItemRender,
                index,
              })}
            >
              <span className="pl-2 pr-1">{selectedItemRender.label}</span>
              <button
                className="cursor-pointer rounded-e-md p-2 outline-none hover:bg-zinc-400/5 focus:bg-zinc-400/5"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSelectedItem(selectedItemRender);
                }}
              >
                <XIcon className="h-4 w-4" />
              </button>
            </span>
          );
        })}

        <div className="flex w-full flex-1 justify-between first:pl-2">
          <input
            className="h-8 w-full bg-transparent outline-none"
            {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
          />
          <button type="button" className="px-2" {...getToggleButtonProps()}>
            &#8595;
          </button>
        </div>
      </div>

      <ul
        className={cn(
          `invisible absolute z-10 w-full min-w-[200px] max-w-max translate-y-4 rounded-md border bg-background p-1 opacity-0 transition-all`,
          { "visible translate-y-2 opacity-100": isOpen },
        )}
        {...getMenuProps({
          style: {
            display: items.length <= 0 && (value.length <= 0 || !createWhenNotExists) ? "none" : "initial",
          },
        })}
      >
        {items.length <= 0 && value.length > 0 ? (
          <li
            {...getItemProps({ item: { label: value, value }, index: 0 })}
            className={`cursor-pointer rounded-[3px] px-2 py-1 text-sm font-semibold ${
              highlightedIndex === 0 ? `bg-zinc-400/10` : ""
            }`}
          >
            <span>criar {value}</span>
          </li>
        ) : null}

        {items.map((item, index) => (
          <li
            key={`${item.value}${index}`}
            {...getItemProps({ item, index })}
            className={`cursor-pointer rounded-md px-2 py-1 text-sm font-semibold ${
              highlightedIndex === index ? `bg-zinc-400/10` : ""
            }`}
          >
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
