import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material'

@Injectable()
export class ModalService {

  stack: MatDialogRef<any>[] = [];

  constructor(private dialog: MatDialog) {}

  /**
   * Open a new modal window with the specified configuration.
   */
  open(content: any, config: MatDialogConfig = {}): MatDialogRef<any> {
    const dialog = this.dialog.open(content, config);

    this.stack.push(dialog);

    return dialog;
  }
  /**
   * Clear all active modals from the stack.
   */
  clear() {
    this.stack.forEach(dialogRef => dialogRef.close());
    this.stack = [];
  }

}
