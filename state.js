/* =========================================================
   state.js — Глобальное состояние AI Annotator V3
   ========================================================= */

// --- ФЛАГИ РЕЖИМОВ ---
var isInspecting    = false;
var isEditing       = false;
var isEditMode      = false;
var isDragging      = false;
var isResizing      = false;
var isTemplateMode  = false;
var isPropsPanelOpen = false; // Панель свойств открыта/закрыта
var isSubInspecting = false; // Выбор доп. элементов с CTRL

// --- НАПРАВЛЕНИЕ RESIZE ---
var resizeDirection = '';

// --- ВЫДЕЛЕНИЕ И D&D ---
var selectedEditElement = null;
var lastHoveredElement  = null;
var dropTarget          = null;
var dropPosition        = null;

var dragStartMouseX  = 0;
var dragStartMouseY  = 0;
var dragStartElRect  = null;
var resizeStartWidth = 0;
var resizeStartHeight = 0;
var resizeStartLeft  = 0;
var resizeStartTop   = 0;

// --- SNAP LINES ---
var snapLineH = null; // горизонтальная snap-линия
var snapLineV = null; // вертикальная snap-линия
var snapSentinels = []; // rects других элементов для snap
var currentSnapX = null; // текущий snap X (null = нет snap)
var currentSnapY = null; // текущий snap Y (null = нет snap)

// --- ТРЕКИНГ ИЗМЕНЕНИЙ ---
var editChangesLog = [];
var editElementSnapshot = null;

// --- UNDO / REDO ---
var undoStack = [];
var redoStack = [];

// --- АННОТАЦИИ ---
var annotations = [];

// --- ОВЕРЛЕИ ---
var hoverOverlay        = null;
var labelOverlay        = null;
var editHoverOverlay    = null;
var editSelectedOverlay = null;
var editLabelOverlay    = null;
var dropIndicator       = null;
var editContextMenu     = null;

// --- ШАБЛОНЫ ---
var insertingTemplateData = null;
var insertedTemplates = [];

// --- SHADOW DOM ---
var rootContainer = null;
var shadowRoot    = null;

// --- RAF-ТРОТТЛИНГ ---
var rafScheduled = false;
