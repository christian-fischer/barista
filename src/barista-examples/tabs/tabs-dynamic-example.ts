import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'component-barista-example',
  template: `
    <dt-tab-group>
      <dt-tab>
        <ng-template dtTabLabel>Physical CPU</ng-template>
        <ng-template dtTabContent>
          <h3>Physical CPUs content</h3>
        </ng-template>
      </dt-tab>
      <dt-tab>
        <ng-template dtTabLabel>CPU ready time</ng-template>
        <ng-template dtTabContent>
          <h3>cpu-ready-time content</h3>
        </ng-template>
      </dt-tab>
      <dt-tab *ngIf="hasProblems" color="error">
        <ng-template dtTabLabel>11 problems</ng-template>
        <ng-template dtTabContent>
          <h3>Housten we have 11 problems!</h3>
        </ng-template>
      </dt-tab>
    </dt-tab-group>
    <button dt-button (click)="hasProblems = !hasProblems">
      Toggle problems
    </button>
  `,
})
export class TabsDynamicExample {
  hasProblems = false;
}
