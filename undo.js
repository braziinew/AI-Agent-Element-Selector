/* =========================================================
   undo.js — Система Undo / Redo
   Зависит от: state.js, helpers.js
   ========================================================= */

const UNDO_MAX = 60;

/**
 * Добавляет действие в стек undo и сбрасывает redo.
 * @param {{ type: string, [key: string]: any }} action
 */
function pushUndo(action) {
  undoStack.push(action);
  if (undoStack.length > UNDO_MAX) undoStack.shift();
  redoStack = [];
  _updateUndoRedoBtns();
  saveAnnotatorState();
}

/** Отменяет последнее действие */
function performUndo() {
  if (!undoStack.length) return;
  const action = undoStack.pop();
  _executeAction(action, true);
  redoStack.push(action);
  _updateUndoRedoBtns();
  showToastNotification('↩ Отменено');
  saveAnnotatorState();
}

/** Повторяет отменённое действие */
function performRedo() {
  if (!redoStack.length) return;
  const action = redoStack.pop();
  _executeAction(action, false);
  undoStack.push(action);
  _updateUndoRedoBtns();
  showToastNotification('↪ Повторено');
  saveAnnotatorState();
}

/**
 * Применяет или отменяет действие.
 * @param {Object} action
 * @param {boolean} isUndo — true = применить отмену, false = применить повтор
 */
function _executeAction(action, isUndo) {
  switch (action.type) {

    case 'style': {
      const el = action.el;
      if (el && document.body.contains(el)) {
        el.style[action.property] = isUndo ? action.oldVal : action.newVal;
        if (selectedEditElement === el) {
          updateEditPositions();
          _syncPropsPanelValues();
        }
      }
      break;
    }

    case 'text': {
      const el = action.el;
      if (el && document.body.contains(el)) {
        el.textContent = isUndo ? action.oldText : action.newText;
        if (selectedEditElement === el) _syncPropsPanelValues();
      }
      break;
    }

    case 'move-dom': {
      const el = action.el;
      if (!el) break;
      if (isUndo) {
        if (action.oldParent && document.body.contains(action.oldParent)) {
          action.oldParent.insertBefore(el, action.oldNext || null);
        }
      } else {
        if (action.newParent && document.body.contains(action.newParent)) {
          action.newParent.insertBefore(el, action.newNext || null);
        }
      }
      break;
    }

    case 'delete': {
      if (isUndo) {
        // Восстановить удалённый элемент
        if (action.parent && document.body.contains(action.parent)) {
          action.parent.insertBefore(action.el, action.next || null);
        }
      } else {
        if (action.el && document.body.contains(action.el)) action.el.remove();
      }
      break;
    }

    case 'clone': {
      if (isUndo) {
        if (action.clone && document.body.contains(action.clone)) action.clone.remove();
      } else {
        if (action.original && document.body.contains(action.original)) {
          action.original.parentNode?.insertBefore(action.clone, action.original.nextSibling);
        }
      }
      break;
    }

    case 'visibility': {
      const el = action.el;
      if (el && document.body.contains(el)) {
        el.style.visibility = isUndo ? action.oldVal : 'hidden';
      }
      break;
    }
  }

  scheduleUpdatePositions();
}

/** Обновляет состояние кнопок Undo/Redo в Master Panel */
function _updateUndoRedoBtns() {
  if (!shadowRoot) return;
  const u = shadowRoot.getElementById('btn-undo');
  const r = shadowRoot.getElementById('btn-redo');
  if (u) u.disabled = undoStack.length === 0;
  if (r) r.disabled = redoStack.length === 0;
}
