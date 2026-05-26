/* =========================================================
   state.js — Глобальное состояние AI Annotator
   Загружается первым. Все остальные модули читают/пишут эти переменные.
   ========================================================= */

// --- ФЛАГИ РЕЖИМОВ ---
var isInspecting    = false; // Режим выбора/инспектирования элементов
var isEditing       = false; // Пользователь вводит текст в стикере (аннотация на паузе)
var isEditMode      = false; // Режим перемещения/редактирования элементов
var isDragging      = false; // Идёт drag-and-drop
var isResizing      = false; // Идёт resize
var isTemplateMode  = false; // Режим вставки шаблонов

// --- НАПРАВЛЕНИЕ RESIZE ---
var resizeDirection = ''; // 'nw','n','ne','e','se','s','sw','w'

// --- ВЫДЕЛЕНИЕ И D&D ---
var selectedEditElement = null;   // Текущий выделенный элемент в edit-режиме
var lastHoveredElement  = null;   // Последний элемент под курсором
var dropTarget          = null;   // Цель сброса при drag
var dropPosition        = null;   // 'top' | 'bottom' | 'left' | 'right'

var dragStartMouseX  = 0;
var dragStartMouseY  = 0;
var dragStartElRect  = null;
var resizeStartWidth = 0;
var resizeStartHeight = 0;
var resizeStartLeft  = 0;
var resizeStartTop   = 0;

// --- ТРЕКИНГ ИЗМЕНЕНИЙ (Edit Mode) ---
/**
 * Лог изменений: каждый элемент — { selector, property, oldValue, newValue }
 * @type {Array<{selector: string, property: string, oldValue: string, newValue: string}>}
 */
var editChangesLog = [];

/**
 * Снимок начального состояния выделенного элемента (для трекинга «было»)
 * @type {Object|null}
 */
var editElementSnapshot = null;

// --- АННОТАЦИИ ---
/**
 * @type {Array<{
 *   id: string,
 *   element: Element,
 *   selector: string,
 *   tagName: string,
 *   html: string,
 *   text: string,
 *   minimized: boolean
 * }>}
 */
var annotations = [];

// --- ОВЕРЛЕИ (внешний DOM) ---
var hoverOverlay        = null; // Временная рамка наведения (inspect)
var labelOverlay        = null; // Временный тег-лейбл (inspect)
var editHoverOverlay    = null; // Временная рамка наведения (edit)
var editSelectedOverlay = null; // Рамка выделенного элемента (edit)
var editLabelOverlay    = null; // Тег-лейбл выделенного (edit)
var dropIndicator       = null; // Индикатор места вставки
var editContextMenu     = null; // Контекстное меню (edit)

// --- ШАБЛОНЫ ---
var insertingTemplateData = null; // Данные шаблона ожидающего вставки
var insertedTemplates = [];       // Список вставленных шаблонов [{id, label, element, selector}]

// --- SHADOW DOM ---
var rootContainer = null; // Корневой div с Shadow DOM
var shadowRoot    = null; // ShadowRoot расширения

// --- RAF-ТРОТТЛИНГ ---
var rafScheduled = false; // requestAnimationFrame уже запланирован?
