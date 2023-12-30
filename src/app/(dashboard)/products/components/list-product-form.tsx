"use client";

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ArchiveIcon, ArchiveRestoreIcon, InfoIcon, MoreHorizontal, PenIcon, Trash2Icon } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useServerAction } from "~/lib/actions/use-server-action";
import { Collection, Image, Option, Product, Variant } from "~/lib/db";
import { formatters } from "~/lib/formatters";
import { archiveProductAction } from "../actions/archive";
import { useState } from "react";
import { useToast } from "~/components/ui/use-toast";
import { restoreProductAction } from "../actions/restore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { destroyProductAction } from "../actions/destroy";
import { useDisclosure } from "~/hooks/use-disclosure";

type ProductsWithRelations = Pick<Product, "id" | "name" | "eid" | "deletedAt"> & {
  collections: Pick<Collection, "eid" | "name">[];
  options: Pick<Option, "eid" | "name" | "price" | "quantity">[];
  variants: Pick<Variant, "eid" | "name">[];
  images: Pick<Image, "eid" | "url" | "key">[];
};

type Props = {
  products: Array<ProductsWithRelations>;
};

const column = createColumnHelper<ProductsWithRelations>();

export function ProductsList({ products }: Props) {
  const { toast } = useToast();
  const [updatingId, setUpdatinhId] = useState("");
  const [deletingId, setDeletingId] = useState<number | undefined>();
  const confirm = useDisclosure();
  const archive = useServerAction(archiveProductAction);
  const restore = useServerAction(restoreProductAction);
  const destroy = useServerAction(destroyProductAction);

  const columns = [
    column.accessor("name", {
      header: "Produto",
      cell(props) {
        const arvhived = props.row.original.deletedAt;
        return (
          <div className="flex items-center gap-2">
            {arvhived ? (
              <Badge variant="secondary" className="h-min">
                arquivado
              </Badge>
            ) : null}
            {props.getValue()}
          </div>
        );
      },
    }),

    column.accessor("images", {
      header: "Imagens",
      cell(props) {
        const images = props.getValue();

        return (
          <div className="flex gap-2">
            {images.map((image) => (
              <NextImage
                alt="Imagem adicionada neste produto"
                src={image.url}
                key={image.key}
                width={40}
                height={40}
                className="h-10 w-10 rounded-md object-cover object-center"
              />
            ))}
          </div>
        );
      },
    }),

    column.accessor("collections", {
      header: "Coleções",
      cell(props) {
        const collections = props.getValue();

        return (
          <div className="flex flex-wrap gap-2">
            {collections.map((collection) => (
              <Badge key={collection.eid} variant="outline" className="cursor-pointer">
                <Link href={`/collections/${collection.eid}`}>{collection.name}</Link>
              </Badge>
            ))}
          </div>
        );
      },
    }),

    column.accessor("variants", {
      header: "Variações",
      cell(props) {
        const variants = props.getValue();

        return (
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <Badge key={variant.eid}>{variant.name}</Badge>
            ))}
          </div>
        );
      },
    }),

    column.accessor("options", {
      header: "Opções",
      cell(props) {
        const options = props.getValue();

        return (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <Badge key={option.eid}>{option.name}</Badge>
            ))}
          </div>
        );
      },
    }),

    column.accessor("options", {
      header: "Preço (R$)",
      cell(props) {
        const options = props.getValue();
        const prices = options.map((option) => option.price).sort();

        if (prices.length > 1) {
          return (
            <div className="flex flex-wrap gap-2">
              A partir de: <strong>{formatters.currency(prices.at(0) ?? 0)}</strong>
            </div>
          );
        }

        return <strong>{formatters.currency(prices.at(0) ?? 0)}</strong>;
      },
    }),

    column.accessor("options", {
      header: () => (
        <div className="flex items-center gap-1">
          <span>Quantidade</span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent asChild>
                <p className="h-min w-full max-w-[200px] text-xs normal-case text-foreground/50">
                  A quantidade exibida é a soma da quantidade de cada opção de um produto.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      cell(props) {
        const options = props.getValue();

        const total = options.reduce((acumulator, current) => {
          return acumulator + (current.quantity ?? 0);
        }, 0);

        return <span>{total}</span>;
      },
    }),

    column.accessor("id", {
      header: "",
      cell(props) {
        const product = props.row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <span className="sr-only">Abrir Menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild className="flex gap-2">
                  <Link href={`/products/${product.eid}`}>
                    <PenIcon className="h-3 w-3" /> Editar
                  </Link>
                </DropdownMenuItem>

                {product.deletedAt ? (
                  <DropdownMenuItem
                    className="flex gap-2"
                    onClick={() => {
                      setUpdatinhId(product.eid);

                      restore.mutate(
                        { id: product.id },
                        {
                          onSuccess: () => {
                            toast({
                              title: "Produto restaurado.",
                              description: `O produto ${product.name} foi restaurado.`,
                              className: `p-3`,
                            });
                          },

                          onError: () => {
                            toast({
                              title: "Ops.",
                              description: `Ocorreu um erro ao tentar restaurar este produto, tente novamente.`,
                              className: `p-3`,
                              variant: "destructive",
                            });
                          },
                        },
                      );
                    }}
                  >
                    <ArchiveRestoreIcon className="h-3 w-3" /> Restaurar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="flex gap-2"
                    onClick={() => {
                      setUpdatinhId(product.eid);

                      archive.mutate(
                        { id: product.id },
                        {
                          onSuccess() {
                            toast({
                              title: "Produto arquivado.",
                              description: `O produto ${product.name} foi arquivado.`,
                              className: `p-3`,
                            });
                          },

                          onError: () => {
                            toast({
                              title: "Ops.",
                              description: `Ocorreu um erro ao tentar arquivar este produto, tente novamente.`,
                              className: `p-3`,
                              variant: "destructive",
                            });
                          },
                        },
                      );
                    }}
                  >
                    <ArchiveIcon className="h-3 w-3" /> Arquivar
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="group flex gap-2 text-red-500"
                  onClick={() => {
                    confirm.onOpen();
                    setDeletingId(product.id);
                    setUpdatinhId(product.eid);
                  }}
                >
                  <Trash2Icon className="h-4 w-4 text-red-500" />
                  <span className="group-hover:text-red-500">Excluir</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={(archive.isLoading || restore.isLoading) && row.original.eid === updatingId ? "loading" : ""}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={confirm.isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto</AlertDialogTitle>
            <AlertDialogDescription>
              Este produto será excluido de forma permanente e não poderá ser recuperado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={confirm.onClose}>Não quero excluir</AlertDialogCancel>

            <AlertDialogAction
              disabled={destroy.isLoading}
              onClick={() => {
                destroy.mutate(
                  { id: deletingId as number },
                  {
                    onSuccess: (data) => {
                      toast({
                        title: "Produto excluido",
                        description: `O produto ${data?.name} foi excluido.`,
                        className: "p-3",
                      });

                      setUpdatinhId("");
                      confirm.onClose();
                    },
                    onError: () => {
                      toast({
                        title: "Ocorreu um problema",
                        description: `O produto não pode ser excluido no momento.`,
                        className: "p-3",
                        variant: "destructive",
                      });
                    },
                  },
                );
              }}
            >
              {destroy.isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
