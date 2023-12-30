"use client";

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Key } from "../fetch-api-keys";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CopyIcon, EyeIcon, EyeOffIcon, Trash2Icon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { formatters } from "~/lib/formatters";
import { createApiKeyAction, revokeApiKeyAction } from "../actions";
import { SubmitButton } from "~/components/submit-button";
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
import { useClipboard } from "~/hooks/use-clipboard";
import { useReducer, useState } from "react";
import { useServerAction } from "~/lib/actions/use-server-action";
import { useToast } from "~/components/ui/use-toast";

type Props = {
  keys: Key[];
};

const column = createColumnHelper<Key>();

export function ListKeys(props: Props) {
  const { toast } = useToast();
  const create = useServerAction(createApiKeyAction);
  const revoke = useServerAction(revokeApiKeyAction);

  const created = useDisclosure();
  const revoked = useDisclosure();

  const [key, setKey] = useState("");
  const [copied, copy] = useClipboard();
  const [preview, setPreview] = useState("");
  const [visible, toggleVisible] = useReducer((state) => !state, false);

  const columns = [
    column.accessor("start", {
      header: "Chave",
      cell(props) {
        return <Badge variant="secondary">{props.getValue()}...</Badge>;
      },
    }),
    column.accessor("meta", {
      header: "Tipo",
      cell(props) {
        const meta = props.getValue();
        return meta.mode === "read" ? "Pública" : "Secreta";
      },
    }),
    column.accessor("createdAt", {
      header: "Criada em:",
      cell(props) {
        return formatters.date(new Date(props.getValue()));
      },
    }),
    column.accessor("expires", {
      header: "Expira em:",
      cell(props) {
        const expires = props.getValue();

        if (!expires) {
          return null;
        }

        return formatters.date(new Date(expires));
      },
    }),
    column.accessor("id", {
      header: "",
      cell(props) {
        return (
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setKey(props.getValue());
                revoked.onOpen();
              }}
            >
              <span className="sr-only">Revogar Chave</span>
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    columns,
    data: props.keys,
    getCoreRowModel: getCoreRowModel(),
  });

  const onCreateKey = () => {
    create.mutate(
      { public: true },
      {
        onSuccess: (data) => {
          setPreview(data?.key ?? "");
          created.onOpen();
        },

        onError: () => {
          toast({
            title: "Ops",
            description: "Alguma coisa deu errado ao tentar criar sua chave de API, tente novamente.",
            className: "p-3",
          });
        },
      },
    );
  };

  const handleCopyKeyAndCloseModal = async () => {
    await copy(preview);

    setTimeout(() => {
      created.onClose();
      setPreview("");
    }, 600);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Chaves de API</CardTitle>

          <form action={onCreateKey}>
            <SubmitButton>Adicionar Chave</SubmitButton>
          </form>
        </CardHeader>

        {props.keys.length <= 0 ? (
          <CardContent>
            <CardDescription className="text-center">Você ainda não tem nenhuma chave de api criada.</CardDescription>
          </CardContent>
        ) : null}

        {props.keys.length > 0 ? (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </Card>

      <AlertDialog open={created.isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nova Chave</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Sua chave de API foi criada com sucesso! Sua chave de API serve para acessar seus produtos e coleções e
                criar carrinhos e pedidos,{" "}
                <strong>essa é a única vez que você poderá ver essa chave, mantenha ela em um lugar seguro.</strong>
              </p>

              <div className="flex items-center justify-between rounded-md bg-foreground/5 p-2">
                <pre>{visible ? preview : preview.slice(0, 7).padEnd(preview.length, "*")}</pre>

                <Button variant="ghost" size="sm" onClick={() => toggleVisible()}>
                  {visible ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                </Button>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction className="w-[160px] gap-2" onClick={handleCopyKeyAndCloseModal}>
              <span className="sr-only">copiar chave</span>
              <CopyIcon className="h-4 w-4" /> {copied ? "Copiado!" : "Copiar Chave"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={revoked.isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar chave</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Ao revogar essa chave, suas aplicações que utilizam essa chave não terão mais acesso aos seus dados.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                revoked.onClose();
                setKey("");
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={revoke.isLoading}
              className="w-[132px]"
              onClick={() => {
                revoke.mutate(
                  { key },
                  {
                    onSuccess: () => {
                      toast({
                        title: "Chave revogada",
                        description:
                          "Sua chave foi revogada, não se esqueça de atualizar suas aplicações para utilzar uma chave nova.",
                        className: " p-3",
                      });

                      setKey("");
                      revoked.onClose();
                    },
                  },
                );
              }}
            >
              {revoke.isLoading ? "Revogando..." : "Revogar Chave"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
