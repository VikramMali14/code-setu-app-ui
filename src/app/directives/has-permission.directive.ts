import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AccessMenuService, PermissionAction } from '../services/access-menu.service';

export interface HasPermissionConfig {
  module: string;
  action?: PermissionAction;
}

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnInit {
  private moduleName: string = '';
  private actionName: PermissionAction = 'READ';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private accessMenuService: AccessMenuService
  ) {}

  @Input() set appHasPermission(val: HasPermissionConfig | string) {
    if (typeof val === 'string') {
      const parts = val.split(':');
      this.moduleName = parts[0];
      this.actionName = (parts[1] as PermissionAction) || 'READ';
    } else if (val) {
      this.moduleName = val.module;
      this.actionName = val.action || 'READ';
    }
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    if (!this.moduleName) {
      return;
    }

    const hasAccess = this.accessMenuService.hasPermission(this.moduleName, this.actionName);

    this.viewContainer.clear();
    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
