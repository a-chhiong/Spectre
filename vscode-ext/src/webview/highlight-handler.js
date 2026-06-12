// ─── highlight-handler.js ─────────────────────────────────────────────────────
// Stripped port of web-page/src/utils/highlight-handler.js.
// ALL CodeMirror-specific exports dropped (LanguageSupport, EditorView,
// ViewPlugin, MatchDecorator, etc.) — this extension has no editor.
//
// Exports two highlight.js-compatible language definitions:
//   plantumlLanguage  → for .puml / .plantuml / .pu standalone files
//   mermaidLanguage   → for .mmd / .mermaid standalone files
//
// Both are registered via hljs.registerLanguage() in markdown.js.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
//  1. PLANTUML LANGUAGE DEFINITION (highlight.js format)
// ─────────────────────────────────────────────────────────────────────────────

const plantumlKeywords = [
  'across','activate','again','allow_mixing','allowmixing','also','alt','as',
  'attribute','attributes','autonumber','bold','bottom','box','break','caption',
  'center','circle','circled','circles','color','create','critical','dashed',
  'deactivate','description','destroy','detach','dotted','down','else','elseif',
  'empty','end','endcaption','endfooter','endheader','endif','endlegend',
  'endtitle','endwhile','false','field','fields','footbox','footer','fork',
  'group','header','hide','hnote','if','is','italic','kill','left','legend',
  'link','loop','mainframe','member','members','method','methods','namespace',
  'newpage','normal','note','of','on','opt','order','over','page','par',
  'partition','plain','private','protected','public','ref','repeat','return',
  'right','rnote','rotate','show','skin','skinparam','split','sprite','start',
  'stereotype','stereotypes','stop','style','then','title','together','top',
  'true','up','while',
  // gantt
  'starts','ends','closed','after','colored','lasts','happens','in','at',
  'are','to','the','and','printscale','ganttscale','projectscale','daily',
  'weekly','monthly','quarterly','yearly','zoom','day','days','week','weeks',
  'complete','displays','same','row','pauses',
];

const plantumlTypes = [
  'abstract','action','actor','agent','annotation','archimate','artifact',
  'boundary','card','cloud','collections','component','control','database',
  'diamond','entity','enum','exception','file','folder','frame','hexagon',
  'json','label','map','metaclass','node','object','package','participant',
  'person','process','protocol','queue','rectangle','relationship','stack',
  'state','storage','struct','usecase','class','interface','concise','robust',
  // gantt
  'monday','tuesday','wednesday','thursday','friday','saturday','sunday',
  'today','project','labels','last','first','column',
];

/**
 * highlight.js language definition for PlantUML.
 * Register via: hljs.registerLanguage('plantuml', () => plantumlLanguage)
 */
export const plantumlLanguage = {
  name: 'plantuml',
  case_insensitive: true,
  contains: [
    // Block comment
    { className: 'comment', begin: "/'", end: "'/" },
    // Line comment
    { className: 'comment', begin: "'", end: '$' },
    // @start / @end directives
    {
      className: 'meta',
      begin: /@(start|end)(uml|mindmap|gantt|board|wbs|json|yaml|salt|dot|ditaa|creole|files|latex|math|tree|timeline|chronology|wireframe|bpm|ebnf|regex|nwdiag|sequence|class|object|component|deployment|state|activity|usecase|er|c4|flow|bpel|git|hcl|jcckit|chen|cute|def|packet|kanban|archimate|block)\b/i,
    },
    // Preprocessor directives
    { className: 'meta', begin: /![a-zA-Z_0-9]+/ },
    // Hex / named colors
    { className: 'number', begin: /#[0-9a-fA-F]{3,8}\b/ },
    // Strings
    { className: 'string', begin: '"', end: '"' },
    // Numbers
    { className: 'number', begin: /\b\d+(\.\d+)?\b/ },
    // Keywords
    {
      className: 'keyword',
      begin: `\\b(${plantumlKeywords.join('|')})\\b`,
    },
    // Types / shapes
    {
      className: 'type',
      begin: `\\b(${plantumlTypes.join('|')})\\b`,
    },
    // Arrows and connectors
    { className: 'operator', begin: /(-[-.>|]+|==+|--+|\.\.[.>]+|<[-.]*)/ },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
//  2. MERMAID LANGUAGE DEFINITION (highlight.js format)
// ─────────────────────────────────────────────────────────────────────────────

const mermaidKeywords = [
  'participant','actor','boundary','control','entity','database','collections',
  'queue','as','box','create','destroy','autonumber','activate','deactivate',
  'alt','else','opt','loop','par','and','rect','critical','option','break',
  'note','over','of','to','link','click','style','classdef','class','subgraph',
  'end','title','acctitle','accdescr','direction','interpolate','fill','stroke',
  'stroke-width','linkstyle','theme','left','right',
  // gantt
  'dateformat','axisformat','section','completed','active','milestone','crit',
  // gitgraph
  'commit','branch','checkout','merge','tag','id','type','reverse',
];

const mermaidDiagramTypes = [
  'graph','flowchart','sequencediagram','classdiagram','statediagram',
  'statediagram-v2','erdiagram','journey','gantt','pie','quadrantchart',
  'requirementdiagram','gitgraph','c4context','c4container','c4component',
  'mindmap','timeline','zenuml','block-beta','packetbeta','kanban','architecture',
  'tb','td','bt','rl','lr',
];

/**
 * highlight.js language definition for Mermaid.
 * Register via: hljs.registerLanguage('mermaid', () => mermaidLanguage)
 */
export const mermaidLanguage = {
  name: 'mermaid',
  case_insensitive: true,
  contains: [
    // Line comment
    { className: 'comment', begin: /%%[^\n]*/ },
    // Directives %%{ ... }%%
    { className: 'meta', begin: /%%\{/, end: /\}%%/ },
    // Strings
    { className: 'string', begin: '"', end: '"' },
    // Numbers
    { className: 'number', begin: /\b\d+(\.\d+)?\b/ },
    // Diagram type identifiers
    {
      className: 'meta',
      begin: `\\b(${mermaidDiagramTypes.join('|')})\\b`,
    },
    // Keywords
    {
      className: 'keyword',
      begin: `\\b(${mermaidKeywords.join('|')})\\b`,
    },
    // Arrows
    { className: 'operator', begin: /(-->|-\.->|===>|--[|>ox])/ },
  ],
};
