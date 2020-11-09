import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FetchClient } from "@c8y/client";

@Component({
    selector: 'app-analytics',
    templateUrl: "./analytics.component.html",
    styleUrls: ['./analytics.component.css']
  })

  export class AnalyticsComponent implements OnInit {
    epl_data: any;
    aBuilder_data: any;
    constructor(public route: ActivatedRoute,
                private fetchClient: FetchClient) {}        // 1

     ngOnInit() {
         this.fetchClient.fetch('service/cep/eplfiles').then((response) => { //try...
            response.json().then( (data) => {
                this.epl_data = data["eplfiles"];
           //     console.log(this.epl_data);
            } );  

         } ,(error) => { //...catch
            console.log(error);
         }  );    

         this.fetchClient.fetch('service/cep/analyticsbuilder').then((response) => { //try...
            response.json().then( (data) => {
                this.aBuilder_data = data["analyticsbuilder"];
          //      console.log(this.aBuilder_data);
            } );  

         } ,(error) => { //...catch
            console.log(error);
         }  ); 
     }
  }