"use client";

import NextImage from "next/image";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Collection, Image } from "~/lib/db";
import { formatters } from "~/lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { ArchiveIcon, ArchiveRestoreIcon, MoreHorizontal, PenIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useServerAction } from "~/lib/actions/use-server-action";
import { archiveCollectionAction } from "../actions/archive";
import { useToast } from "~/components/ui/use-toast";
import { useState } from "react";
import { restoreCollectionAction } from "../actions/restore";
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
import { useDisclosure } from "~/hooks/use-disclosure";
import { destroyCollectionAction } from "../actions/destroy";

type CollectionWithRelations = Collection & { parents: Collection[]; images: Image[] };

type Props = {
  collections: CollectionWithRelations[];
};

const column = createColumnHelper<CollectionWithRelations>();

export function CollectionsList({ collections }: Props) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState("");
  const [toDelete, setToDelete] = useState<number | undefined>();
  const confirm = useDisclosure();

  const archive = useServerAction(archiveCollectionAction);
  const restore = useServerAction(restoreCollectionAction);
  const destroy = useServerAction(destroyCollectionAction);

  const columns = [
    column.accessor("name", {
      header: "Coleção",
      cell(props) {
        const archived = props.row.original.deletedAt;

        return (
          <div className="flex items-center gap-2">
            {archived ? <Badge variant="secondary">arquivada</Badge> : null}
            {props.getValue()}
          </div>
        );
      },
    }),

    column.accessor("parents", {
      header: "",
      cell(props) {
        const parents = props.getValue();

        return (
          <div className="flex gap-2">
            {parents.map((parent) => (
              <Badge key={parent.id}>{parent.name}</Badge>
            ))}
          </div>
        );
      },
    }),

    column.accessor("images", {
      header: "Imagens",
      cell(props) {
        const images = props.getValue();

        return (
          <div className="flex flex-wrap gap-2">
            {images.map((image) => (
              <NextImage
                src={image.url}
                key={image.id}
                alt="Imagem adicionanda nesta coleção."
                width={40}
                height={40}
                className="h-10 w-10 rounded-md object-cover object-center"
              />
            ))}
          </div>
        );
      },
    }),

    column.accessor("createdAt", {
      header: "Criada em",
      cell(props) {
        return formatters.date(props.getValue() as Date);
      },
    }),

    column.accessor(({ id, deletedAt }) => ({ id, deletedAt }), {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const collection = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <span className="sr-only">abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild className="flex gap-2">
                  <Link href={`collections/${collection.eid}`}>
                    <PenIcon className="h-3 w-3" /> Editar
                  </Link>
                </DropdownMenuItem>

                {collection.deletedAt ? (
                  <DropdownMenuItem
                    className="flex gap-2"
                    onClick={() => {
                      setUpdating(collection.eid);

                      restore.mutate(
                        { id: collection.id },
                        {
                          onSuccess: () => {
                            toast({
                              title: "Coleção restaurada.",
                              description: `A coleção ${collection.name} foi restaurada.`,
                              className: "p-3",
                            });

                            setUpdating("");
                          },
                        },
                      );
                    }}
                  >
                    <ArchiveRestoreIcon className="h-4 w-4 text-gray-500" />
                    Restaurar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="flex gap-2"
                    onClick={() => {
                      setUpdating(collection.eid);

                      archive.mutate(
                        { id: collection.id },
                        {
                          onSuccess: () => {
                            toast({
                              title: "Coleção arquivada.",
                              description: `A coleção ${collection.name} foi arquivada.`,
                              className: "shadow-none p-3",
                            });

                            setUpdating("");
                          },
                        },
                      );
                    }}
                  >
                    <ArchiveIcon className="h-3 w-3 text-gray-500" />
                    Arquivar
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="group flex gap-2 text-red-500"
                  onClick={() => {
                    setUpdating(collection.eid);
                    setToDelete(collection.id);
                    confirm.onOpen();
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
    columns,
    data: collections,
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
              data-state={(archive.isLoading || restore.isLoading) && row.original.eid === updating ? "loading" : ""}
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
            <AlertDialogTitle>Excluir coleção</AlertDialogTitle>
            <AlertDialogDescription>
              Essa coleção será excluida de forma permanente e não poderá ser recuperada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={confirm.onClose}>Não quero excluir</AlertDialogCancel>

            <AlertDialogAction
              disabled={destroy.isLoading}
              onClick={() => {
                destroy.mutate(
                  { id: toDelete as number },
                  {
                    onSuccess: () => {
                      toast({
                        title: "Coleção excluida.",
                        description: `A coleção foi excluida.`,
                        className: "p-3",
                      });

                      setUpdating("");
                      setToDelete(undefined);
                      confirm.onClose();
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
