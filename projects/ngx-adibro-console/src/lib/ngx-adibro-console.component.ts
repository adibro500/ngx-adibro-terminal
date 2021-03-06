import { Component, OnInit, Input } from '@angular/core';
import { NgxAdibroConsoleService } from './ngx-adibro-console.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-adibro-console',
  template: `
  <div [ngClass]="'ui-welcome-msg'" [style.width.%]="width" [style.height.vh]="height" (click)="focus(in)">
          <div>
                {{welcomeMessage}}
          </div>
          <div *ngFor="let command of commands">
            <div>{{promptMessage}} {{command.text}}</div>
            <div>{{command.response}}</div>
          </div>
      <div>
          <span>{{promptMessage}} <input [ngClass]="'ui-input-command'" #in [(ngModel)]="command" (keydown)="handleInput($event)"  type="text"/></span>
      </div>
  </div>
  `,
  styles: [`
    .ui-input-command {
      color:white;
      background-color:black;
      border: transparent;
      font-family:monospace;
      outline: none;
      width: 80%;
      }
   
    .ui-welcome-msg {
      background-color:black;
      font-family:monospace;
      color:white;
      overflow: scroll;
    }
    /* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1; 
}
 
/* Handle */
::-webkit-scrollbar-thumb {
  background: #888; 
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555; 
}
    `
  ]
})
export class NgxAdibroConsoleComponent implements OnInit {
  @Input() welcomeMessage: string;
  @Input() clearAll: boolean;
  @Input() promptMessage: string;
  @Input() cacheCommands: boolean;
  @Input() width: number;
  @Input() height: number;

  command: any;
  commands: any[] = [];
  commandDups: any[] = []
  subscription: Subscription;
  toggleUp: number = 0;

  handleInput(event: KeyboardEvent) {
    if (this.cacheCommands) {
      if (this.toggleUp <= 0 && event.keyCode == 38) {
        return;
      }
      if (event.keyCode == 38 && this.toggleUp > 0 && this.commandDups[this.toggleUp - 1]) {
        this.command = this.commandDups[this.toggleUp - 1].text;
        if (this.toggleUp > 0) {
          this.toggleUp--;
        }
      }
      if (event.keyCode == 40 && this.toggleUp <= this.commandDups.length - 1) {
        this.command = this.commandDups[this.toggleUp].text;
        if (this.toggleUp <= this.commandDups.length - 1) {
          this.toggleUp++;
        }
      }
    }
    if (event.keyCode == 13) {
      this.commands.push({ text: this.command });
      if (this.cacheCommands && this.command) {
        this.commandDups.push({ text: this.command });
        ++this.toggleUp;
      }
      this.ngxAdibroConsoleService.sendCommand(this.command);
      if (this.command === 'cls' && this.clearAll) {
        this.commands = [];
      }
      this.command = '';
    }
  }

  focus(element: HTMLElement) {
    element.focus();
  }

  constructor(private ngxAdibroConsoleService: NgxAdibroConsoleService) {
    this.subscription = this.ngxAdibroConsoleService.responseHandler.subscribe(response => {
      this.commands[this.commands.length - 1].response = response;
    });
  }

  ngOnInit() {
  }

}
