import { elementEventFullName } from "@angular/compiler/src/view_compiler/view_compiler";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { OperationService, IOperation, FetchClient, InventoryService, RealtimeAction, Realtime} from "@c8y/client";
import { Alert, AlertService} from "@c8y/ngx-components";
import { interval } from "rxjs";

@Component({
  selector: "app-docker",
  templateUrl: "./docker.component.html",
  styleUrls: ["./docker.component.css"],
})
export class DockerComponent implements OnInit {
  containers: any;
  deviceId: string;
  operation: IOperation;
  available: any;
  realtime: any;

  isAvailable: boolean;

  modal: any;
  spanClose: any;

  constructor(
    public route: ActivatedRoute,
    private ops: OperationService,
    private alert: AlertService,
    private fetchClient: FetchClient,
    private invSvc: InventoryService,
  ) {
    this.available = new Object();
  }

  ngOnInit(): void {
    this.deviceId = this.route.snapshot.parent.data.contextData["id"];
    // this.containers = this.route.snapshot.parent.data.contextData["c8y_Docker"] ;
    this.isAvailable = true;
    this.deviceFetchClient();
    this.modal = document.getElementById("docker-modal");
    this.spanClose = document.getElementById("closeModal");
    this.operation = null;
  }

  ngAfterViewChecked() {
 /*   if (Object.keys(<Object>this.available).length > 0) {
      //document.getElementsByName("my-card");
      var queryCards = document.querySelectorAll(".card");
      if (this.available.status == "UNAVAILABLE") {
        //document.getElementById("docker-card").classList.add("d");
        if (this.isAvailable) {
          this.isAvailable = false;
          this.setCardDisabled(queryCards);
        }
      } else {
        //document.getElementById("docker-card").classList.remove("d");
        if (!this.isAvailable) {
          this.isAvailable = true;
          this.setCardEnabled(queryCards);
        }
      }
    } */
  }
  // When the user clicks on the button, open the modal
  displayModal() {
    this.modal.style.display = "block";
  }
  closeModal() {
    this.modal.style.display = "none";
  }

  setCardDisabled(queryCards) {
    for (var i = 0; i < queryCards.length; i++) {
      queryCards[i].classList.add("d");
    }
    for (var i = 0; i < this.containers.length; i++) {
      this.containers[i].status = "Disconnected";
      this.containers[i].cpu = "0.0";
      this.containers[i].memory = "0.0";
    }
  }
  setCardEnabled(queryCards) {
    for (var i = 0; i < queryCards.length; i++) {
      queryCards[i].classList.remove("d");
    }
    this.deviceFetchClient();
  }

  deviceFetchClient() {
    const realtimeOps = {
      realtime: true
    };
    const detail$ = this.invSvc.detail$(this.deviceId, realtimeOps);
    detail$.subscribe((data) => {
      //console.log(data)
      this.containers = data[0]["c8y_Docker"];
      this.available = data[0]["c8y_Availability"];
      //console.log("System is " + this.available.status);
    });
    this.realtime = new Realtime(this.fetchClient);
    const subscription = this.realtime.subscribe('/operations/'+this.deviceId, (data) => {
      if (data.data.data['c8y_Docker'] != undefined) {
        this.operation = data.data.data;
      }
    });

    this.fetchClient.fetch("inventory/managedObjects/" + this.deviceId).then(
      (response) => {
        //try...
        response.json().then((data) => {
          this.containers = data["c8y_Docker"];
          this.available = data["c8y_Availability"];
          //console.log("System is " + this.available.status);
        });
      },
      (error) => {
        //...catch
        console.log(error);
      }
    );
  }

  sendUpdateStatusOperation(item, status): void {
    const dockerOperation: IOperation = {
      deviceId: this.deviceId,
      c8y_Docker: {
        name: item.name,
        containerID: item.containerID,
        command: status.toLowerCase(),
      },
      description: status + " container '" + item.name + "' on thin edge",
    };
    //    this.ops.create(dockerOperation);
    this.ops.create(dockerOperation).then(
      (result) => {
        this.operation = result.data;
        const myAlert: Alert = {
          text: "Docker Update Operation sent to Device",
          type: "success",
          timeout: 8000,
        };
        this.alert.add(myAlert);
        //console.log(result);
        //console.log(myAlert);
      },
      (error) => {
        const myAlert: Alert = {
          text: "Error creating image. " + JSON.stringify(error),
          type: "danger",
          timeout: 8000,
        };
        this.alert.add(myAlert);
      }
    );

    //this.alert.info("Operation '" + status + "' erzeugt.");
  }

  sendCreateOperation(item, status): void {
    const dockerOperation: IOperation = {
      deviceId: this.deviceId,
      c8y_Docker: {
        command: status.toLowerCase(),
        options : {
          name: item.name,
          image: item.image,
          ports: item.ports
        }
      },
      description: status + " container '" + item.name + "' on thin edge",
    };
    //    this.ops.create(dockerOperation);
    this.ops.create(dockerOperation).then(
      (result) => {
        this.operation = result.data;
          const myAlert: Alert = {
          text: "Docker Create Operation sent to Device",
          type: "success",
          timeout: 8000,
        };
        this.alert.add(myAlert);
      },
      (error) => {
        const myAlert: Alert = {
          text: "Error creating container. " + JSON.stringify(error),
          type: "danger",
          timeout: 8000,
        };
        this.alert.add(myAlert);
      }
    );

    //this.alert.info("Operation '" + status + "' erzeugt.");
  }

  start(item): void {
    this.sendUpdateStatusOperation(item, "Start");
  }
  stop(item): void {
    this.sendUpdateStatusOperation(item, "Stop");
  }
  restart(item): void {
    this.sendUpdateStatusOperation(item, "Restart");
  }
  remove(item): void {
    this.sendUpdateStatusOperation(item, "Delete");
  }
  createContainer(): void {
    var xName = document.forms["myForm"]["fname"].value;
    var xImage = document.forms["myForm"]["fimage"].value;
    var xPorts = document.forms["myForm"]["fportmap"].value;
    if (xName == "") {
      alert("Name must be filled out");
    }else {
      if (xImage == ""){
        alert("Image must be filled out");
      }
    }
    let item = {
      name : xName,
      image: xImage,
      ports: xPorts
    }

    const myAlert: Alert = {
      text: "Creating new container + '" + item.name + "'...",
      type: "info",
      timeout: 8000,
    };
    this.alert.add(myAlert);

    this.sendCreateOperation(item, "Create");
    this.closeModal();
  }
}
