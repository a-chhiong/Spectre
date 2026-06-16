// Basic templates for new projects
export const DEFAULT_YAML = `openapi: 3.0.3
info:
  title: OpenStudio API
  description: 
    $ref: "../markdown/description.md"
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
paths:
  /users:
    $ref: "./paths/users.yaml"
`;

export const USER_PATH_YAML = `get:
  summary: Retrieve a list of users
  description: Returns a list of users in the system.
  responses:
    '200':
      description: A successful response
      content:
        application/json:
          schema:
            type: array
            items:
              $ref: "../components/schemas/user.yaml"
`;

export const USER_SCHEMA_YAML = `type: object
properties:
  id:
    type: string
    format: uuid
    description: Unique user identifier
  username:
    type: string
    description: User's registration name
  email:
    type: string
    format: email
`;

export const DEFAULT_MD = `# OpenStudio Project Documentation

Welcome to your **OpenStudio** project. This Markdown file serves as supporting documentation.

## Diagram Example (Mermaid)

Here is a sequence diagram imported from a standalone Mermaid file:

@import "../mermaid/template.mmd"

\`\`\`mermaid
sequenceDiagram
  participant User
  participant Editor
  participant Previewer
  User->>Editor: Type YAML/Markdown
  Editor->>Previewer: Update State
  Previewer->>User: Display live docs & diagrams
\`\`\`

## Diagram Example (PlantUML)

Here is a component diagram imported from a standalone PlantUML file:

@import "../plantuml/template.puml"

\`\`\`plantuml
@startuml
actor User
boundary "OpenStudio" as Studio
control "Project State" as State

User -> Studio : Edit Files
Studio -> State : Debounce Autosave
State -> Studio : Update Live Preview
@enduml
\`\`\`
`;

export const DEFAULT_MERMAID = `sequenceDiagram
  participant User
  participant Editor
  participant Previewer
  User->>Editor: Type YAML/Markdown
  Editor->>Previewer: Update State
  Previewer->>User: Display live docs & diagrams
`;

export const DEFAULT_PLANTUML = `@startuml
actor User
boundary "OpenStudio" as Studio
control "Project State" as State

User -> Studio : Edit Files
Studio -> State : Debounce Autosave
State -> Studio : Update Live Preview
@enduml
`;

// DBML Project Templates (Native Module System Structure)
export const DEFAULT_DBML_INDEX = `// ============================================================
// Sample DBML Project Schema - Parent DBML
// ============================================================

Project Project_1 {
  database_type: 'Oracle'
  Note: 'Sample DBML Project Database Schema'
}

// Import child schemas
use * from './schemas/auth'
use * from './schemas/role_permissions'
`;

export const DEFAULT_DBML_SCHEMA_AUTH = `// ============================================================
// Authorization and Roles Schema
// ============================================================

Table roles [headercolor: #3498db, note: 'Primary user role definitions'] {
  id integer [pk, increment, note: 'Primary Key identifier']
  role_code varchar(20) [not null, unique, note: 'Unique role code']
  is_active varchar(1) [not null, default: 'Y', note: 'Active flag']
  priority integer [note: 'Role resolution priority']
}

Table permissions [headercolor: #3498db, note: 'Granular system permissions'] {
  perm_code varchar(3) [pk, not null, note: 'Primary permission code']
  label varchar(20) [not null, note: 'Display label']
}

TableGroup "Access_Control" {
  roles
  permissions
}
`;

export const DEFAULT_DBML_SCHEMA_ROLE_PERMISSIONS = `// ============================================================
// Junction Table for Roles and Permissions Mappings
// ============================================================

use * from './auth'

Table role_permissions [headercolor: #27ae60, note: 'Mapping of roles to their granted permissions'] {
  mapping_id varchar(3) [pk, not null, note: 'Record key']
  description varchar(50) [not null, note: 'Mapping description details']
  role_id integer [note: 'Foreign key referencing roles table']
  perm_code varchar(3) [note: 'Foreign key referencing permissions table']
}

Ref: role_permissions.role_id > roles.id [delete: cascade]
Ref: role_permissions.perm_code > permissions.perm_code

TableGroup "Permission_Rules" {
  role_permissions
}
`;

// Default Project folder structure helper function
export function getInitialProjectFiles(key) {
  return [
    { projectKey: key, path: 'openapi/openapi.yaml', content: DEFAULT_YAML, type: 'file' },
    { projectKey: key, path: 'openapi/paths/users.yaml', content: USER_PATH_YAML, type: 'file' },
    { projectKey: key, path: 'openapi/components/schemas/user.yaml', content: USER_SCHEMA_YAML, type: 'file' },
    { projectKey: key, path: 'mermaid/template.mmd', content: DEFAULT_MERMAID, type: 'file' },
    { projectKey: key, path: 'plantuml/template.puml', content: DEFAULT_PLANTUML, type: 'file' },
    { projectKey: key, path: 'markdown/description.md', content: DEFAULT_MD, type: 'file' },
    { projectKey: key, path: 'dbml/index.dbml', content: DEFAULT_DBML_INDEX, type: 'file' },
    { projectKey: key, path: 'dbml/schemas/auth.dbml', content: DEFAULT_DBML_SCHEMA_AUTH, type: 'file' },
    { projectKey: key, path: 'dbml/schemas/role_permissions.dbml', content: DEFAULT_DBML_SCHEMA_ROLE_PERMISSIONS, type: 'file' }
  ];
}
