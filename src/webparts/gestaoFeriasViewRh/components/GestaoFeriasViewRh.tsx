import * as React from "react";
import type { IGestaoFeriasViewRhProps } from "./IGestaoFeriasViewRhProps";
import {
  DetailsList,
  IColumn,
  IStyle,
  IconButton,
  Stack,
  Text,
} from "@fluentui/react";
import { SolicitacaoFerias } from "../../../types/SolicitacaoFeiras";
import { Colaborador } from "../../../types/Colaborador";

const orderById = (a: SolicitacaoFerias, b: SolicitacaoFerias): number => {
  return a.Id - b.Id;
};

const groupSolicitacaoFeirasByColaboradorId = (
  solicitacaoFerias: SolicitacaoFerias[],
  colaboradores: Colaborador[]
): { [key: number]: SolicitacaoFerias[] } => {
  return colaboradores.reduce((acc, colaborador) => {
    const solicitacoesColaborador = solicitacaoFerias.filter(
      (solicitacaoFerias) => solicitacaoFerias.ColaboradorId === colaborador.Id
    );

    solicitacoesColaborador.sort(orderById);

    const key = colaborador.Id;
    acc[key] = solicitacoesColaborador;

    return acc;
  }, {} as { [key: number]: SolicitacaoFerias[] });
};

export default function GestaoFeriasViewRh(
  props: IGestaoFeriasViewRhProps
): JSX.Element {
  const { colaboradores, solicitacaoFerias } = props;

  const solicitacaoFeriasGrouped = React.useMemo(() => {
    return groupSolicitacaoFeirasByColaboradorId(
      solicitacaoFerias,
      colaboradores
    );
  }, [solicitacaoFerias]);

  const columns: IColumn[] = React.useMemo(() => {
    return [
      {
        key: "column1",
        name: "Status",
        minWidth: 100,
        maxWidth: 150,
        onRender: (colaborador: Colaborador) => {
          const item = solicitacaoFeriasGrouped[colaborador.Id][0];
          const periodoAquisitivo = item
            ? new Date(item.PeriodoAquisitivo)
            : new Date(colaborador.DataAdmissao);
          const saldoDias = new Date().getTime() - periodoAquisitivo.getTime();
          let saldoDiasInDays =
            Math.floor(saldoDias / (1000 * 3600 * 24)) / 365;
          saldoDiasInDays = Math.floor(saldoDiasInDays);
          saldoDiasInDays *= 30;

          const fimPeriodoAtual = new Date(periodoAquisitivo);
          fimPeriodoAtual.setDate(fimPeriodoAtual.getDate() + 365);

          const fimPeriodoAtualMaiorQueHoje =
            fimPeriodoAtual.getTime() > new Date().getTime();

          const anoAtual = new Date().getFullYear();
          const hasItemPeriodoAtual =
            new Date(periodoAquisitivo).getFullYear() === anoAtual;

          let style: IStyle = {
            borderRadius: "1rem",
            padding: "0.25rem 0.5rem",
            margin: "0.5rem",
            height: "1.5rem",
          };

          if (saldoDiasInDays <= 0) {
            style = {
              ...style,
              color: "#437406",
              backgroundColor: "#CFFFB8",
            };
            return <Text styles={{ root: style }}>Regularizado</Text>;
          } else if (saldoDiasInDays === 30 && hasItemPeriodoAtual) {
            style = {
              ...style,
              color: "#8F6200",
              backgroundColor: "#FFEBC0",
            };
            return <Text styles={{ root: style }}>Agendado</Text>;
          } else if (saldoDiasInDays === 30 && !fimPeriodoAtualMaiorQueHoje) {
            style = {
              ...style,
              color: "#8F6200",
              backgroundColor: "#FFEBC0",
            };
            return <Text styles={{ root: style }}>Pendente agendamento</Text>;
          } else {
            style = {
              ...style,
              color: "#b80022",
              backgroundColor: "#f6d4db",
            };
            return <Text styles={{ root: style }}>Atrasado</Text>;
          }
        },
      },
      {
        key: "column2",
        name: "Nome do Colaborador",
        fieldName: "Title",
        minWidth: 100,
        maxWidth: 150,
        onRender: (colaborador: Colaborador) => {
          return <span>{colaborador?.Title || ""}</span>;
        },
      },

      {
        key: "column3",
        name: "Data de início do período aquisitivo",
        fieldName: "InicioPeriodoAtual",
        minWidth: 100,
        maxWidth: 150,
        onRender: (colaborador: Colaborador) => {
          const item = solicitacaoFeriasGrouped[colaborador.Id][0];
          const periodoAquisitivo = item
            ? new Date(item.PeriodoAquisitivo)
            : new Date(colaborador.DataAdmissao);
          return <span>{periodoAquisitivo.toLocaleDateString()}</span>;
        },
      },

      {
        key: "column4",
        name: "Data de fim do período aquisitivo",
        fieldName: "FimPeriodoAtual",
        minWidth: 100,
        maxWidth: 150,
        onRender: (colaborador: Colaborador) => {
          const item = solicitacaoFeriasGrouped[colaborador.Id][0];
          const periodoAquisitivo = item
            ? new Date(item.PeriodoAquisitivo)
            : new Date(colaborador.DataAdmissao);
          const fimPeriodoAtual = new Date(periodoAquisitivo);
          fimPeriodoAtual.setDate(fimPeriodoAtual.getDate() + 365);

          return <span>{fimPeriodoAtual.toLocaleDateString()}</span>;
        },
      },
      {
        key: "column5",
        name: "Data limite para agendamento",
        fieldName: "DataLimiteAgendarFerias",
        minWidth: 100,
        maxWidth: 150,
        onRender: (colaborador: Colaborador) => {
          const item = solicitacaoFeriasGrouped[colaborador.Id][0];
          const periodoAquisitivo = item
            ? new Date(item.PeriodoAquisitivo)
            : new Date(colaborador.DataAdmissao);
          const dataLimiteSairFerias = new Date(periodoAquisitivo);
          dataLimiteSairFerias.setDate(
            dataLimiteSairFerias.getDate() + 365 * 2 - 61
          );
          const dataLimiteAgendarFerias = new Date(dataLimiteSairFerias);
          dataLimiteAgendarFerias.setDate(
            dataLimiteAgendarFerias.getDate() - 45
          );
          return (
            <span>
              {new Date(dataLimiteAgendarFerias).toLocaleDateString()}
            </span>
          );
        },
      },
      {
        key: "column6",
        name: "Data limite para sair de férias",
        minWidth: 100,
        maxWidth: 100,
        onRender: (colaborador: Colaborador) => {
          const item = solicitacaoFeriasGrouped[colaborador.Id][0];
          const periodoAquisitivo = item
            ? new Date(item.PeriodoAquisitivo)
            : new Date(colaborador.DataAdmissao);
          const dataLimiteSairFerias = new Date(periodoAquisitivo);
          dataLimiteSairFerias.setDate(
            dataLimiteSairFerias.getDate() + 365 * 2 - 61
          );

          return (
            <span>{new Date(dataLimiteSairFerias).toLocaleDateString()}</span>
          );
        },
      },
      {
        key: "column7",
        name: "Saldo de dias",
        fieldName: "SaldoDias",
        minWidth: 100,
        maxWidth: 100,
        onRender: (colaborador: Colaborador) => {
          const item = solicitacaoFeriasGrouped[colaborador.Id][0];
          const periodoAquisitivo = item
            ? new Date(item.PeriodoAquisitivo)
            : new Date(colaborador.DataAdmissao);
          const saldoDias = new Date().getTime() - periodoAquisitivo.getTime();
          let saldoDiasInDays =
            Math.floor(saldoDias / (1000 * 3600 * 24)) / 365;
          saldoDiasInDays = Math.floor(saldoDiasInDays);
          saldoDiasInDays *= 30;

          return <span>{saldoDiasInDays <= 0 ? 0 : saldoDiasInDays}</span>;
        },
      },
      {
        key: "column8",
        name: "Ver agendamento",
        minWidth: 100,
        maxWidth: 200,
        onRender: (colaborador: Colaborador) => {
          const item = solicitacaoFeriasGrouped[colaborador.Id][0];
          const periodoAquisitivo = item
            ? new Date(item.PeriodoAquisitivo)
            : new Date(colaborador.DataAdmissao);
          const anoAtual = new Date(periodoAquisitivo).getFullYear();
          const hasItemPeriodoAtual =
            new Date(periodoAquisitivo).getFullYear() === anoAtual;

          const listId = "3f6aca03-ed95-49d7-91a4-aae35eaa1958";
          const styles = {
            fontSize: "1rem",
          };
          if (!hasItemPeriodoAtual) {
            return <></>;
          } else {
            return (
              <IconButton
                iconProps={{ iconName: "View" }}
                style={styles}
                onClick={() =>
                  window.open(
                    `/sites/newportal/_layouts/15/SPListForm.aspx?PageType=4&List=${listId}&ID=${item.Id}`
                  )
                }
              />
            );
          }
        },
      },
    ];
  }, [solicitacaoFerias]);

  return (
    <Stack>
      <DetailsList columns={columns} items={colaboradores} selectionMode={0} />
    </Stack>
  );
}
