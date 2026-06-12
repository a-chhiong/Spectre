# target: building a vscode extension
1. strip all the code-editor, folder-tree features but mainly focus on code-viewer.
2. bring similar user experience from web-page to vs-code extension.
3. bring diagram-processor and highlight-handler from web-page to vs-code extension.
4. everything else would use native vscode features, e.g., 
    - file-system operations
    - command-palette
    - syntax hightlight: only if supported by webview, otherwise use code-viewer's highlight-handler.
    - folder-tree
5. use webview to display the code-viewer.
6. adding export to html/pdf/svg/png just like code-review currently has.
7. bring zoom in/out for diagram for any supported diagram type (plantuml, mermaid, graphviz, etc.)
    7.1 in web-page, it has a zoom-slider for user to adjust the zoom level.
    7.2 for plantuml and graphviz, it has a reset button to reset the zoom level.

    