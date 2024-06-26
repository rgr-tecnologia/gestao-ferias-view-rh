import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import GestaoFeriasViewRh from "./components/GestaoFeriasViewRh";
import { IGestaoFeriasViewRhProps } from "./components/IGestaoFeriasViewRhProps";
import { SPHttpClient } from "@microsoft/sp-http";
import { SolicitacaoFerias } from "../../types/SolicitacaoFeiras";
import { Colaborador } from "../../types/Colaborador";

export default class GestaoFeriasViewRhWebPart extends BaseClientSideWebPart<IGestaoFeriasViewRhProps> {
  private colaboradores: Colaborador[] = [];
  private solicitacaoFerias: SolicitacaoFerias[] = [];

  public render(): void {
    const element: React.ReactElement<IGestaoFeriasViewRhProps> =
      React.createElement(GestaoFeriasViewRh, {
        colaboradores: this.colaboradores,
        solicitacaoFerias: this.solicitacaoFerias,
      });

    ReactDom.render(element, this.domElement);
  }

  private async getColaboradores(): Promise<
    {
      Id: number;
      Title: string;
      DataAdmissao: string;
    }[]
  > {
    const listId = "2511179d-6e7d-4027-b73f-7136363f96f2";
    const response = await this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl +
        `/_api/web/lists('${listId}')/items`,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      throw new Error("Failed to get items");
    }

    const data = await response.json();

    return data.value;
  }

  private async getSolicitacaoFerias(): Promise<SolicitacaoFerias[]> {
    const listId = "3f6aca03-ed95-49d7-91a4-aae35eaa1958";
    const response = await this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl +
        `/_api/web/lists('${listId}')/items`,
      SPHttpClient.configurations.v1
    );
    if (!response.ok) {
      throw new Error("Failed to get items");
    }
    const data = await response.json();
    return data.value;
  }

  protected async onInit(): Promise<void> {
    this.colaboradores = await this.getColaboradores();
    this.solicitacaoFerias = await this.getSolicitacaoFerias();

    return Promise.resolve();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}
