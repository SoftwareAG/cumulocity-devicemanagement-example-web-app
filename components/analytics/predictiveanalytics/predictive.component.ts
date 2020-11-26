import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { OperationService, IOperation, FetchClient } from '@c8y/client';
import { Alert, AlertService } from '@c8y/ngx-components';

@Component({
    selector: 'app-predictive-analytics',
    templateUrl: "./predictive.component.html",
    styleUrls: ['./predictive.component.css']
  })

  export class PredictiveAnalyticsComponent implements OnInit {
    ML_models: any;
    ML_data: any;
    
    deviceId: string;

    constructor(public route: ActivatedRoute,
                private fetchClient: FetchClient,
                private ops: OperationService,
                private alert: AlertService) {}        // 1

     ngOnInit() {
        var data = this.route.snapshot.parent.data.contextData;
        this.deviceId = data["id"];

        this.fetchMLModels();
        this.fetchThinEdgeModel();
         
     }

     fetchMLModels(){
      this.ML_data = [];
      this.fetchClient.fetch('/service/zementis/models').then((response) => { //try...
        response.json().then( (data) => {
            //this.ML_data = data["models"];
            for(var i = 0; i < data["models"].length; i++) {
              this.fetchClient.fetch('/service/zementis/model/' + data["models"][i]).then((response) => { //try...
                response.json().then( (model) => {
                    console.log(model);
                    this.ML_data.push(model);
  
                });  

              } ,(error) => { //...catch
                 console.log(error);
              }  ); 
            }
            
        } );  

     } ,(error) => { //...catch
        console.log(error);
     }  ); 
     }

     fetchThinEdgeModel(){
      this.fetchClient.fetch("inventory/managedObjects/" + this.deviceId).then(
        (response) => {
          //try...
          response.json().then((data) => {
            this.ML_models = data["c8y_ThinEdge_Model"];     
          //  console.log(this.epl_models); //thin edge models
          });
        },
        (error) => {
          //...catch
          console.log(error);
        }
      );
     }

     isModelStatusActive(model):boolean{
        for(var i = 0; i < this.ML_models.length; i++) {
          if (model.name == this.ML_models[i].name){
            return true;
          }
        }
        return false;
       }

       switchModelOnOff(model: any, event: any, trigger: any){
        //console.log(model); // {}   
        //console.log(trigger); // {} 
        var isActive = this.isModelStatusActive(model);
        
        const objIndex = this.ML_data.findIndex((obj => obj.id == model.id));
        
        if (trigger && !isActive){
          console.log("switch ON");
          this.switchModelOn(model);
          this.ML_data[objIndex].state = "active";
        }else if(!trigger && isActive){
          console.log("switch OFF");
          this.switchModelOff(model);
          this.ML_data[objIndex].state = "inactive";
        }else if ((trigger && isActive) || (!trigger && !isActive) ){
          console.log("Try to prevent check.");
          event.preventDefault();
        }
        
     }

     switchModelOn(model: any){
        const modelOnOperation: IOperation = {
            deviceId: this.deviceId,
            c8y_ThinEdge_Model: {
              name: model.name,
              type: "PredictiveAnalytics",
              id: model.id,
              order: "load"
            },
            description: `Load model '${model.name}'`
        };
        this.sendOperation(modelOnOperation);
    }
    switchModelOff(model: any){
        const modelOffOperation: IOperation = {
            deviceId: this.deviceId,
            c8y_ThinEdge_Model: {
              name: model.name,
              type: "PredictiveAnalytics",
              id: model.id,
              order: "delete"
            },
            description: `Delete model '${model.name}'`
          };
          this.sendOperation(modelOffOperation);
    }

    sendOperation(operation){
        this.ops.create(operation).then(result => {
            const myAlert:Alert = {
              text :`${operation.description}`, 
              type: "info",
              timeout : 8000
            };
            this.alert.add(myAlert);
          },error => {
            const myAlert:Alert = {
              text : "Error creating operation. " + JSON.stringify(error), 
              type: "danger",
              timeout : 8000
            };
            this.alert.add(myAlert);
          } );

     }

  }