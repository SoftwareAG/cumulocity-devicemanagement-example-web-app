import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { OperationService, IOperation, FetchClient } from "@c8y/client";
import { Alert, AlertService } from "@c8y/ngx-components";

@Component({
  selector: "app-analytics-epl",
  templateUrl: "./apamaepl.component.html",
  styleUrls: ["./apamaepl.component.css"],
})
export class AnalyticsEPLComponent implements OnInit {
  epl_data: any;
  epl_models: any;

  deviceId: string;
  eplUrl: string;

  isdeviceAvailable: boolean;

  constructor(
    public route: ActivatedRoute,
    private fetchClient: FetchClient,
    private ops: OperationService,
    private alert: AlertService
  ) {} // 1

  ngOnInit() {
    console.log("ngOnInit execute...");
    var data = this.route.snapshot.parent.data.contextData;
    this.deviceId = data["id"];

    const indexObj = data["self"].indexOf("/inventory/");
    this.eplUrl = data["self"].slice(0, indexObj) + "/apps/apamaepl";
    //console.log("URL: " + this.url);

    this.fetchEPLModels();
    this.fetchThinEdgeModels();
  }

  fetchThinEdgeModels(){
    this.fetchClient.fetch("inventory/managedObjects/" + this.deviceId).then(
      (response) => {
        //try...
        response.json().then((data) => {
          this.epl_models = data["c8y_ThinEdge_Model"];     
        //  console.log(this.epl_models); //thin edge models
        });
      },
      (error) => {
        //...catch
        console.log(error);
      }
    );
  }

  fetchEPLModels() {
    console.log("Fetch new epl models...");
    this.fetchClient.fetch("service/cep/eplfiles").then(
      (response) => {
        //try...
        response.json().then((data) => {
          this.epl_data = data["eplfiles"];
         // console.log(this.epl_data); //plattform models
          // var available = data["c8y_Availability"];
        });
      },
      (error) => {
        //...catch
        console.log(error);
      }
    );
  }

  isModelStatusActive(model): boolean {
 
    for (var i = 0; i < this.epl_models.length; i++) {
      if (model.name == this.epl_models[i].name) {
        return true;
      }
    }
    return false;
  }
  sendOperation(operation) {
    this.ops.create(operation).then(
      (result) => {
        const myAlert: Alert = {
          text: `${operation.description}`,
          type: "info",
          timeout: 8000,
        };
        this.alert.add(myAlert);
      },
      (error) => {
        const myAlert: Alert = {
          text: "Error creating operations. " + JSON.stringify(error),
          type: "danger",
          timeout: 8000,
        };
        this.alert.add(myAlert);
      }
    );
  }
  switchModelOn(model: any) {
    const modelOnOperation: IOperation = {
      deviceId: this.deviceId,
      c8y_ThinEdge_Model: {
        name: model.name,
        type: "EPL",
        id: model.id,
        order: "load",
      },
      description: `Load model '${model.name}'`,
    };
    this.sendOperation(modelOnOperation);
  }
  switchModelOff(model: any) {
    const modelOffOperation: IOperation = {
      deviceId: this.deviceId,
      c8y_ThinEdge_Model: {
        name: model.name,
        type: "EPL",
        id: model.id,
        order: "delete",
      },
      description: `Delete model '${model.name}'`,
    };
    this.sendOperation(modelOffOperation);
  }
  switchModelOnOff(model: any, event: any, trigger: any) {
    console.log(model); // {}
    console.log(trigger); // {}
    var isActive = this.isModelStatusActive(model);

    const objIndex = this.epl_data.findIndex((obj) => obj.id == model.id);

    if (trigger && !isActive) {
      console.log("switch ON");
      this.switchModelOn(model);
      this.epl_data[objIndex].state = "active";
    } else if (!trigger && isActive) {
      console.log("switch OFF");
      this.switchModelOff(model);
      this.epl_data[objIndex].state = "inactive";
    } else if ((trigger && isActive) || (!trigger && !isActive)) {
      console.log("Try to prevent check.");
      event.preventDefault();
    }
  }
}
