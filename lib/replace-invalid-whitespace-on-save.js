'use babel';

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,
  watchedEditors: null,

  activate(state) {
    this.watchedEditors = new WeakSet()
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.workspace.observeTextEditors(editor => {
      return this.handleEvents(editor)
    }))
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  handleEvents (editor) {
    if (this.watchedEditors.has(editor)) return

    let buffer = editor.getBuffer()

    let bufferSavedSubscription = buffer.onWillSave(() => {
      return buffer.transact(() => {
          if (buffer.getText().indexOf(' ') != -1) {
            let cursor = editor.getCursorBufferPosition();
            buffer.setText(buffer.getText().replace(' ', ' '))
            editor.setCursorBufferPosition(cursor);
          }
      })
    })

    let editorDestroyedSubscription = editor.onDidDestroy(() => {
      bufferSavedSubscription.dispose()
      editorDestroyedSubscription.dispose()
      this.subscriptions.remove(bufferSavedSubscription)
      this.subscriptions.remove(editorDestroyedSubscription)
      this.watchedEditors.delete(editor)
    })

    this.subscriptions.add(bufferSavedSubscription)
    this.subscriptions.add(editorDestroyedSubscription)
    this.watchedEditors.add(editor)
  }

};
