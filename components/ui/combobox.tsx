"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
};

type ComboboxProps = {
  id?: string;
  value?: string;
  options: ComboboxOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  commandClassName?: string;
  inputClassName?: string;
  listClassName?: string;
  groupClassName?: string;
  itemClassName?: string;
  emptyClassName?: string;
};

export function Combobox({
  id,
  value,
  options,
  onValueChange,
  placeholder = "Selectionner",
  searchPlaceholder = "Rechercher...",
  emptyLabel = "Aucun resultat",
  disabled = false,
  className,
  contentClassName,
  commandClassName,
  inputClassName,
  listClassName,
  groupClassName,
  itemClassName,
  emptyClassName,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left text-sm font-normal",
            !value && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[--radix-popover-trigger-width] p-0",
          contentClassName,
        )}
        align="start"
        portalled={false}
      >
        <Command className={commandClassName}>
          <CommandInput
            placeholder={searchPlaceholder}
            className={inputClassName}
          />
          <CommandList className={cn("max-h-60", listClassName)}>
            <CommandEmpty className={emptyClassName}>{emptyLabel}</CommandEmpty>
            <CommandGroup className={groupClassName}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    className={itemClassName}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span className="truncate text-[11px] text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
