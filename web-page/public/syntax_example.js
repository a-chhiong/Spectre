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
export const DEFAULT_DBML_TPCH_SF100 = `// ============================================================
// Sample DBML Project Schema - TPCH SF100
// ============================================================

Project "SNOWFLAKE_SAMPLE_DATA" {
    Note {
        '''
        Generated using snowflake-dbml on 2024-05-02 13:24:41
        Database: SNOWFLAKE_SAMPLE_DATA
        Database User: ryanrozich
        Included Schemas: All
        Excluded Schemas: None
        '''
    }
}

Table "tpcds_sf100tcl"."call_center" [headercolor: #3498db] {
    "CC_CALL_CENTER_SK" NUMBER [pk]
    "CC_CALL_CENTER_ID" TEXT
    "CC_REC_START_DATE" DATE
    "CC_REC_END_DATE" DATE
    "CC_CLOSED_DATE_SK" NUMBER
    "CC_OPEN_DATE_SK" NUMBER
    "CC_NAME" TEXT
    "CC_CLASS" TEXT
    "CC_EMPLOYEES" NUMBER
    "CC_SQ_FT" NUMBER
    "CC_HOURS" TEXT
    "CC_MANAGER" TEXT
    "CC_MKT_ID" NUMBER
    "CC_MKT_CLASS" TEXT
    "CC_MKT_DESC" TEXT
    "CC_MARKET_MANAGER" TEXT
    "CC_DIVISION" NUMBER
    "CC_DIVISION_NAME" TEXT
    "CC_COMPANY" NUMBER
    "CC_COMPANY_NAME" TEXT
    "CC_STREET_NUMBER" TEXT
    "CC_STREET_NAME" TEXT
    "CC_STREET_TYPE" TEXT
    "CC_SUITE_NUMBER" TEXT
    "CC_CITY" TEXT
    "CC_COUNTY" TEXT
    "CC_STATE" TEXT
    "CC_ZIP" TEXT
    "CC_COUNTRY" TEXT
    "CC_GMT_OFFSET" NUMBER
    "CC_TAX_PERCENTAGE" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 60
        - Size: 18.50 KB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.790000-08:00
        - Last DDL: None
        - Last Altered: 2024-03-26 14:43:48.125000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( cc_call_center_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."catalog_page" [headercolor: #3498db] {
    "CP_CATALOG_PAGE_SK" NUMBER [pk]
    "CP_CATALOG_PAGE_ID" TEXT
    "CP_START_DATE_SK" NUMBER
    "CP_END_DATE_SK" NUMBER
    "CP_DEPARTMENT" TEXT
    "CP_CATALOG_NUMBER" NUMBER
    "CP_CATALOG_PAGE_NUMBER" NUMBER
    "CP_DESCRIPTION" TEXT
    "CP_TYPE" TEXT
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 50,000
        - Size: 2.67 MB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.755000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-27 20:23:46.621000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( cp_catalog_page_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."catalog_returns" [headercolor: #3498db] {
    "CR_RETURNED_DATE_SK" NUMBER
    "CR_RETURNED_TIME_SK" NUMBER
    "CR_ITEM_SK" NUMBER [pk]
    "CR_REFUNDED_CUSTOMER_SK" NUMBER
    "CR_REFUNDED_CDEMO_SK" NUMBER
    "CR_REFUNDED_HDEMO_SK" NUMBER
    "CR_REFUNDED_ADDR_SK" NUMBER
    "CR_RETURNING_CUSTOMER_SK" NUMBER
    "CR_RETURNING_CDEMO_SK" NUMBER
    "CR_RETURNING_HDEMO_SK" NUMBER
    "CR_RETURNING_ADDR_SK" NUMBER
    "CR_CALL_CENTER_SK" NUMBER
    "CR_CATALOG_PAGE_SK" NUMBER
    "CR_SHIP_MODE_SK" NUMBER
    "CR_WAREHOUSE_SK" NUMBER
    "CR_REASON_SK" NUMBER
    "CR_ORDER_NUMBER" NUMBER [pk]
    "CR_RETURN_QUANTITY" NUMBER
    "CR_RETURN_AMOUNT" NUMBER
    "CR_RETURN_TAX" NUMBER
    "CR_RETURN_AMT_INC_TAX" NUMBER
    "CR_FEE" NUMBER
    "CR_RETURN_SHIP_COST" NUMBER
    "CR_REFUNDED_CASH" NUMBER
    "CR_REVERSED_CHARGE" NUMBER
    "CR_STORE_CREDIT" NUMBER
    "CR_NET_LOSS" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 14,405,363,575
        - Size: 770.86 GB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.803000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-26 21:07:03.279000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( cr_returned_date_sk, cr_item_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."catalog_sales" [headercolor: #3498db] {
    "CS_SOLD_DATE_SK" NUMBER
    "CS_SOLD_TIME_SK" NUMBER
    "CS_SHIP_DATE_SK" NUMBER
    "CS_BILL_CUSTOMER_SK" NUMBER
    "CS_BILL_CDEMO_SK" NUMBER
    "CS_BILL_HDEMO_SK" NUMBER
    "CS_BILL_ADDR_SK" NUMBER
    "CS_SHIP_CUSTOMER_SK" NUMBER
    "CS_SHIP_CDEMO_SK" NUMBER
    "CS_SHIP_HDEMO_SK" NUMBER
    "CS_SHIP_ADDR_SK" NUMBER
    "CS_CALL_CENTER_SK" NUMBER
    "CS_CATALOG_PAGE_SK" NUMBER
    "CS_SHIP_MODE_SK" NUMBER
    "CS_WAREHOUSE_SK" NUMBER
    "CS_ITEM_SK" NUMBER [pk]
    "CS_PROMO_SK" NUMBER
    "CS_ORDER_NUMBER" NUMBER [pk]
    "CS_QUANTITY" NUMBER
    "CS_WHOLESALE_COST" NUMBER
    "CS_LIST_PRICE" NUMBER
    "CS_SALES_PRICE" NUMBER
    "CS_EXT_DISCOUNT_AMT" NUMBER
    "CS_EXT_SALES_PRICE" NUMBER
    "CS_EXT_WHOLESALE_COST" NUMBER
    "CS_EXT_LIST_PRICE" NUMBER
    "CS_EXT_TAX" NUMBER
    "CS_COUPON_AMT" NUMBER
    "CS_EXT_SHIP_COST" NUMBER
    "CS_NET_PAID" NUMBER
    "CS_NET_PAID_INC_TAX" NUMBER
    "CS_NET_PAID_INC_SHIP" NUMBER
    "CS_NET_PAID_INC_SHIP_TAX" NUMBER
    "CS_NET_PROFIT" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 144,006,767,158
        - Size: 9.23 TB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.834000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-26 21:07:03.285000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR(  cs_sold_date_sk, cs_item_sk  )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."customer" [headercolor: #3498db] {
    "C_CUSTOMER_SK" NUMBER [pk]
    "C_CUSTOMER_ID" TEXT
    "C_CURRENT_CDEMO_SK" NUMBER
    "C_CURRENT_HDEMO_SK" NUMBER
    "C_CURRENT_ADDR_SK" NUMBER
    "C_FIRST_SHIPTO_DATE_SK" NUMBER
    "C_FIRST_SALES_DATE_SK" NUMBER
    "C_SALUTATION" TEXT
    "C_FIRST_NAME" TEXT
    "C_LAST_NAME" TEXT
    "C_PREFERRED_CUST_FLAG" TEXT
    "C_BIRTH_DAY" NUMBER
    "C_BIRTH_MONTH" NUMBER
    "C_BIRTH_YEAR" NUMBER
    "C_BIRTH_COUNTRY" TEXT
    "C_LOGIN" TEXT
    "C_EMAIL_ADDRESS" TEXT
    "C_LAST_REVIEW_DATE" TEXT
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 100,000,000
        - Size: 3.36 GB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.611000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-18 16:46:25.527000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( c_customer_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."customer_address" [headercolor: #3498db] {
    "CA_ADDRESS_SK" NUMBER [pk]
    "CA_ADDRESS_ID" TEXT
    "CA_STREET_NUMBER" TEXT
    "CA_STREET_NAME" TEXT
    "CA_STREET_TYPE" TEXT
    "CA_SUITE_NUMBER" TEXT
    "CA_CITY" TEXT
    "CA_COUNTY" TEXT
    "CA_STATE" TEXT
    "CA_ZIP" TEXT
    "CA_COUNTRY" TEXT
    "CA_GMT_OFFSET" NUMBER
    "CA_LOCATION_TYPE" TEXT
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 50,000,000
        - Size: 1.60 GB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.585000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-26 21:07:08.889000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( ca_address_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."customer_demographics" [headercolor: #3498db] {
    "CD_DEMO_SK" NUMBER [pk]
    "CD_GENDER" TEXT
    "CD_MARITAL_STATUS" TEXT
    "CD_EDUCATION_STATUS" TEXT
    "CD_PURCHASE_ESTIMATE" NUMBER
    "CD_CREDIT_RATING" TEXT
    "CD_DEP_COUNT" NUMBER
    "CD_DEP_EMPLOYED_COUNT" NUMBER
    "CD_DEP_COLLEGE_COUNT" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 1,920,800
        - Size: 9.47 MB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.636000-08:00
        - Last DDL: None
        - Last Altered: 2024-02-28 12:44:54.679000-08:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( cd_demo_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."date_dim" [headercolor: #3498db] {
    "D_DATE_SK" NUMBER [pk]
    "D_DATE_ID" TEXT
    "D_DATE" DATE
    "D_MONTH_SEQ" NUMBER
    "D_WEEK_SEQ" NUMBER
    "D_QUARTER_SEQ" NUMBER
    "D_YEAR" NUMBER
    "D_DOW" NUMBER
    "D_MOY" NUMBER
    "D_DOM" NUMBER
    "D_QOY" NUMBER
    "D_FY_YEAR" NUMBER
    "D_FY_QUARTER_SEQ" NUMBER
    "D_FY_WEEK_SEQ" NUMBER
    "D_DAY_NAME" TEXT
    "D_QUARTER_NAME" TEXT
    "D_HOLIDAY" TEXT
    "D_WEEKEND" TEXT
    "D_FOLLOWING_HOLIDAY" TEXT
    "D_FIRST_DOM" NUMBER
    "D_LAST_DOM" NUMBER
    "D_SAME_DAY_LY" NUMBER
    "D_SAME_DAY_LQ" NUMBER
    "D_CURRENT_DAY" TEXT
    "D_CURRENT_WEEK" TEXT
    "D_CURRENT_MONTH" TEXT
    "D_CURRENT_QUARTER" TEXT
    "D_CURRENT_YEAR" TEXT
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 73,049
        - Size: 2.04 MB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.640000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-27 20:23:46.621000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( d_date_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."household_demographics" [headercolor: #3498db] {
    "HD_DEMO_SK" NUMBER [pk]
    "HD_INCOME_BAND_SK" NUMBER
    "HD_BUY_POTENTIAL" TEXT
    "HD_DEP_COUNT" NUMBER
    "HD_VEHICLE_COUNT" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 7,200
        - Size: 30.00 KB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.689000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-27 20:23:45.902000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( hd_demo_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."income_band" [headercolor: #3498db] {
    "IB_INCOME_BAND_SK" NUMBER [pk]
    "IB_LOWER_BOUND" NUMBER
    "IB_UPPER_BOUND" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 20
        - Size: 1.50 KB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.678000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-27 20:23:46.613000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( ib_income_band_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."inventory" [headercolor: #3498db] {
    "INV_DATE_SK" NUMBER [pk]
    "INV_ITEM_SK" NUMBER [pk]
    "INV_WAREHOUSE_SK" NUMBER [pk]
    "INV_QUANTITY_ON_HAND" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 1,965,337,830
        - Size: 7.32 GB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.724000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-26 21:07:06.521000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( inv_date_sk, inv_item_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."item" [headercolor: #3498db] {
    "I_ITEM_SK" NUMBER [pk]
    "I_ITEM_ID" TEXT
    "I_REC_START_DATE" DATE
    "I_REC_END_DATE" DATE
    "I_ITEM_DESC" TEXT
    "I_CURRENT_PRICE" NUMBER
    "I_WHOLESALE_COST" NUMBER
    "I_BRAND_ID" NUMBER
    "I_BRAND" TEXT
    "I_CLASS_ID" NUMBER
    "I_CLASS" TEXT
    "I_CATEGORY_ID" NUMBER
    "I_CATEGORY" TEXT
    "I_MANUFACT_ID" NUMBER
    "I_MANUFACT" TEXT
    "I_SIZE" TEXT
    "I_FORMULATION" TEXT
    "I_COLOR" TEXT
    "I_UNITS" TEXT
    "I_CONTAINER" TEXT
    "I_MANAGER_ID" NUMBER
    "I_PRODUCT_NAME" TEXT
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 502,000
        - Size: 31.89 MB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.688000-08:00
        - Last DDL: None
        - Last Altered: 2024-02-23 13:52:14.457000-08:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( i_item_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."promotion" [headercolor: #3498db] {
    "P_PROMO_SK" NUMBER [pk]
    "P_PROMO_ID" TEXT
    "P_START_DATE_SK" NUMBER
    "P_END_DATE_SK" NUMBER
    "P_ITEM_SK" NUMBER
    "P_COST" NUMBER
    "P_RESPONSE_TARGET" NUMBER
    "P_PROMO_NAME" TEXT
    "P_CHANNEL_DMAIL" TEXT
    "P_CHANNEL_EMAIL" TEXT
    "P_CHANNEL_CATALOG" TEXT
    "P_CHANNEL_TV" TEXT
    "P_CHANNEL_RADIO" TEXT
    "P_CHANNEL_PRESS" TEXT
    "P_CHANNEL_EVENT" TEXT
    "P_CHANNEL_DEMO" TEXT
    "P_CHANNEL_DETAILS" TEXT
    "P_PURPOSE" TEXT
    "P_DISCOUNT_ACTIVE" TEXT
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 2,500
        - Size: 102.00 KB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.613000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-27 20:23:45.917000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( p_promo_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."reason" [headercolor: #3498db] {
    "R_REASON_SK" NUMBER [pk]
    "R_REASON_ID" TEXT
    "R_REASON_DESC" TEXT
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 75
        - Size: 2.50 KB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.529000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-27 20:23:48.905000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( r_reason_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."ship_mode" [headercolor: #3498db] {
    "SM_SHIP_MODE_SK" NUMBER [pk]
    "SM_SHIP_MODE_ID" TEXT
    "SM_TYPE" TEXT
    "SM_CODE" TEXT
    "SM_CARRIER" TEXT
    "SM_CONTRACT" TEXT
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 20
        - Size: 3.00 KB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.529000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-27 20:23:46.228000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( sm_ship_mode_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."store" [headercolor: #3498db] {
    "S_STORE_SK" NUMBER [pk]
    "S_STORE_ID" TEXT
    "S_REC_START_DATE" DATE
    "S_REC_END_DATE" DATE
    "S_CLOSED_DATE_SK" NUMBER
    "S_STORE_NAME" TEXT
    "S_NUMBER_EMPLOYEES" NUMBER
    "S_FLOOR_SPACE" NUMBER
    "S_HOURS" TEXT
    "S_MANAGER" TEXT
    "S_MARKET_ID" NUMBER
    "S_GEOGRAPHY_CLASS" TEXT
    "S_MARKET_DESC" TEXT
    "S_MARKET_MANAGER" TEXT
    "S_DIVISION_ID" NUMBER
    "S_DIVISION_NAME" TEXT
    "S_COMPANY_ID" NUMBER
    "S_COMPANY_NAME" TEXT
    "S_STREET_NUMBER" TEXT
    "S_STREET_NAME" TEXT
    "S_STREET_TYPE" TEXT
    "S_SUITE_NUMBER" TEXT
    "S_CITY" TEXT
    "S_COUNTY" TEXT
    "S_STATE" TEXT
    "S_ZIP" TEXT
    "S_COUNTRY" TEXT
    "S_GMT_OFFSET" NUMBER
    "S_TAX_PRECENTAGE" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 1,902
        - Size: 166.50 KB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.566000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-27 20:23:48.905000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( s_store_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."store_returns" [headercolor: #3498db] {
    "SR_RETURNED_DATE_SK" NUMBER
    "SR_RETURN_TIME_SK" NUMBER
    "SR_ITEM_SK" NUMBER
    "SR_CUSTOMER_SK" NUMBER
    "SR_CDEMO_SK" NUMBER
    "SR_HDEMO_SK" NUMBER
    "SR_ADDR_SK" NUMBER
    "SR_STORE_SK" NUMBER
    "SR_REASON_SK" NUMBER
    "SR_TICKET_NUMBER" NUMBER
    "SR_RETURN_QUANTITY" NUMBER
    "SR_RETURN_AMT" NUMBER
    "SR_RETURN_TAX" NUMBER
    "SR_RETURN_AMT_INC_TAX" NUMBER
    "SR_FEE" NUMBER
    "SR_RETURN_SHIP_COST" NUMBER
    "SR_REFUNDED_CASH" NUMBER
    "SR_REVERSED_CHARGE" NUMBER
    "SR_STORE_CREDIT" NUMBER
    "SR_NET_LOSS" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 28,794,603,867
        - Size: 933.88 GB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.568000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-26 21:07:03.279000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( sr_returned_date_sk, sr_item_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."store_sales" [headercolor: #3498db] {
    "SS_SOLD_DATE_SK" NUMBER
    "SS_SOLD_TIME_SK" NUMBER
    "SS_ITEM_SK" NUMBER [pk]
    "SS_CUSTOMER_SK" NUMBER
    "SS_CDEMO_SK" NUMBER
    "SS_HDEMO_SK" NUMBER
    "SS_ADDR_SK" NUMBER
    "SS_STORE_SK" NUMBER
    "SS_PROMO_SK" NUMBER
    "SS_TICKET_NUMBER" NUMBER [pk]
    "SS_QUANTITY" NUMBER
    "SS_WHOLESALE_COST" NUMBER
    "SS_LIST_PRICE" NUMBER
    "SS_SALES_PRICE" NUMBER
    "SS_EXT_DISCOUNT_AMT" NUMBER
    "SS_EXT_SALES_PRICE" NUMBER
    "SS_EXT_WHOLESALE_COST" NUMBER
    "SS_EXT_LIST_PRICE" NUMBER
    "SS_EXT_TAX" NUMBER
    "SS_COUPON_AMT" NUMBER
    "SS_NET_PAID" NUMBER
    "SS_NET_PAID_INC_TAX" NUMBER
    "SS_NET_PROFIT" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 288,010,550,524
        - Size: 10.37 TB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.569000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-26 21:07:03.279000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR(  ss_sold_date_sk, ss_item_sk  )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."time_dim" [headercolor: #3498db] {
    "T_TIME_SK" NUMBER [pk]
    "T_TIME_ID" TEXT
    "T_TIME" NUMBER
    "T_HOUR" NUMBER
    "T_MINUTE" NUMBER
    "T_SECOND" NUMBER
    "T_AM_PM" TEXT
    "T_SHIFT" TEXT
    "T_SUB_SHIFT" TEXT
    "T_MEAL_TIME" TEXT
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 86,400
        - Size: 1.07 MB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.585000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-27 20:18:45.793000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( t_time_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."warehouse" [headercolor: #3498db] {
    "W_WAREHOUSE_SK" NUMBER [pk]
    "W_WAREHOUSE_ID" TEXT
    "W_WAREHOUSE_NAME" TEXT
    "W_WAREHOUSE_SQ_FT" NUMBER
    "W_STREET_NUMBER" TEXT
    "W_STREET_NAME" TEXT
    "W_STREET_TYPE" TEXT
    "W_SUITE_NUMBER" TEXT
    "W_CITY" TEXT
    "W_COUNTY" TEXT
    "W_STATE" TEXT
    "W_ZIP" TEXT
    "W_COUNTRY" TEXT
    "W_GMT_OFFSET" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 30
        - Size: 7.50 KB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.578000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-27 20:23:46.614000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( w_warehouse_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."web_page" [headercolor: #3498db] {
    "WP_WEB_PAGE_SK" NUMBER [pk]
    "WP_WEB_PAGE_ID" TEXT
    "WP_REC_START_DATE" DATE
    "WP_REC_END_DATE" DATE
    "WP_CREATION_DATE_SK" NUMBER
    "WP_ACCESS_DATE_SK" NUMBER
    "WP_AUTOGEN_FLAG" TEXT
    "WP_CUSTOMER_SK" NUMBER
    "WP_URL" TEXT
    "WP_TYPE" TEXT
    "WP_CHAR_COUNT" NUMBER
    "WP_LINK_COUNT" NUMBER
    "WP_IMAGE_COUNT" NUMBER
    "WP_MAX_AD_COUNT" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 5,004
        - Size: 77.00 KB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.600000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-27 20:18:52.266000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( wp_web_page_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."web_returns" [headercolor: #3498db] {
    "WR_RETURNED_DATE_SK" NUMBER
    "WR_RETURNED_TIME_SK" NUMBER
    "WR_ITEM_SK" NUMBER [pk]
    "WR_REFUNDED_CUSTOMER_SK" NUMBER
    "WR_REFUNDED_CDEMO_SK" NUMBER
    "WR_REFUNDED_HDEMO_SK" NUMBER
    "WR_REFUNDED_ADDR_SK" NUMBER
    "WR_RETURNING_CUSTOMER_SK" NUMBER
    "WR_RETURNING_CDEMO_SK" NUMBER
    "WR_RETURNING_HDEMO_SK" NUMBER
    "WR_RETURNING_ADDR_SK" NUMBER
    "WR_WEB_PAGE_SK" NUMBER
    "WR_REASON_SK" NUMBER
    "WR_ORDER_NUMBER" NUMBER [pk]
    "WR_RETURN_QUANTITY" NUMBER
    "WR_RETURN_AMT" NUMBER
    "WR_RETURN_TAX" NUMBER
    "WR_RETURN_AMT_INC_TAX" NUMBER
    "WR_FEE" NUMBER
    "WR_RETURN_SHIP_COST" NUMBER
    "WR_REFUNDED_CASH" NUMBER
    "WR_REVERSED_CHARGE" NUMBER
    "WR_ACCOUNT_CREDIT" NUMBER
    "WR_NET_LOSS" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 7,200,334,357
        - Size: 353.73 GB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.529000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-26 21:07:06.777000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( wr_returned_date_sk, wr_item_sk )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."web_sales" [headercolor: #3498db] {
    "WS_SOLD_DATE_SK" NUMBER
    "WS_SOLD_TIME_SK" NUMBER
    "WS_SHIP_DATE_SK" NUMBER
    "WS_ITEM_SK" NUMBER [pk]
    "WS_BILL_CUSTOMER_SK" NUMBER
    "WS_BILL_CDEMO_SK" NUMBER
    "WS_BILL_HDEMO_SK" NUMBER
    "WS_BILL_ADDR_SK" NUMBER
    "WS_SHIP_CUSTOMER_SK" NUMBER
    "WS_SHIP_CDEMO_SK" NUMBER
    "WS_SHIP_HDEMO_SK" NUMBER
    "WS_SHIP_ADDR_SK" NUMBER
    "WS_WEB_PAGE_SK" NUMBER
    "WS_WEB_SITE_SK" NUMBER
    "WS_SHIP_MODE_SK" NUMBER
    "WS_WAREHOUSE_SK" NUMBER
    "WS_PROMO_SK" NUMBER
    "WS_ORDER_NUMBER" NUMBER [pk]
    "WS_QUANTITY" NUMBER
    "WS_WHOLESALE_COST" NUMBER
    "WS_LIST_PRICE" NUMBER
    "WS_SALES_PRICE" NUMBER
    "WS_EXT_DISCOUNT_AMT" NUMBER
    "WS_EXT_SALES_PRICE" NUMBER
    "WS_EXT_WHOLESALE_COST" NUMBER
    "WS_EXT_LIST_PRICE" NUMBER
    "WS_EXT_TAX" NUMBER
    "WS_COUPON_AMT" NUMBER
    "WS_EXT_SHIP_COST" NUMBER
    "WS_NET_PAID" NUMBER
    "WS_NET_PAID_INC_TAX" NUMBER
    "WS_NET_PAID_INC_SHIP" NUMBER
    "WS_NET_PAID_INC_SHIP_TAX" NUMBER
    "WS_NET_PROFIT" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 71,997,815,522
        - Size: 4.71 TB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.529000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-26 21:07:06.777000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR(  ws_sold_date_sk, ws_item_sk  )
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpcds_sf100tcl"."web_site" [headercolor: #3498db] {
    "WEB_SITE_SK" NUMBER [pk]
    "WEB_SITE_ID" TEXT
    "WEB_REC_START_DATE" DATE
    "WEB_REC_END_DATE" DATE
    "WEB_NAME" TEXT
    "WEB_OPEN_DATE_SK" NUMBER
    "WEB_CLOSE_DATE_SK" NUMBER
    "WEB_CLASS" TEXT
    "WEB_MANAGER" TEXT
    "WEB_MKT_ID" NUMBER
    "WEB_MKT_CLASS" TEXT
    "WEB_MKT_DESC" TEXT
    "WEB_MARKET_MANAGER" TEXT
    "WEB_COMPANY_ID" NUMBER
    "WEB_COMPANY_NAME" TEXT
    "WEB_STREET_NUMBER" TEXT
    "WEB_STREET_NAME" TEXT
    "WEB_STREET_TYPE" TEXT
    "WEB_SUITE_NUMBER" TEXT
    "WEB_CITY" TEXT
    "WEB_COUNTY" TEXT
    "WEB_STATE" TEXT
    "WEB_ZIP" TEXT
    "WEB_COUNTRY" TEXT
    "WEB_GMT_OFFSET" NUMBER
    "WEB_TAX_PERCENTAGE" NUMBER
    Note {
        '''
        BASE TABLE
        
        Metrics:
        - Rows: 96
        - Size: 22.00 KB
        
        Timestamps:
        - Created: 2021-11-11 13:44:37.528000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-27 20:23:48.905000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: LINEAR( web_site_sk )
        -Auto Clustering: NO
        
        '''
    }
}

// Foreign key relationship SYS_CONSTRAINT_0dc05c3d-2621-49a9-9629-603abf3dced4.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_CALL_CENTER_SK" > "tpcds_sf100tcl"."call_center"."CC_CALL_CENTER_SK"
}

// Foreign key relationship SYS_CONSTRAINT_fb71196b-9ca1-4e0c-b4bd-5c626570eb58.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_CALL_CENTER_SK" > "tpcds_sf100tcl"."call_center"."CC_CALL_CENTER_SK"
}

// Foreign key relationship SYS_CONSTRAINT_207fdd91-e2b5-4de0-bd91-1f6b74ebda6d.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_CATALOG_PAGE_SK" > "tpcds_sf100tcl"."catalog_page"."CP_CATALOG_PAGE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_fa2b7ad7-7097-46b7-82af-d86d07d48f4b.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_CATALOG_PAGE_SK" > "tpcds_sf100tcl"."catalog_page"."CP_CATALOG_PAGE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_59df9a05-0ba8-43af-8a09-6a70148044fb.
Ref {
    "tpcds_sf100tcl"."catalog_returns".("CR_ITEM_SK", "CR_ORDER_NUMBER") > "tpcds_sf100tcl"."catalog_sales".("CS_ITEM_SK", "CS_ORDER_NUMBER")
}

// Foreign key relationship SYS_CONSTRAINT_c7beca82-0adb-4b79-a6d8-836d38bd6e22.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_REFUNDED_CUSTOMER_SK" > "tpcds_sf100tcl"."customer"."C_CUSTOMER_SK"
}

// Foreign key relationship SYS_CONSTRAINT_b5582f70-c9fd-454d-9f96-eee04c538b80.
Ref {
    "tpcds_sf100tcl"."web_returns"."WR_REFUNDED_CUSTOMER_SK" > "tpcds_sf100tcl"."customer"."C_CUSTOMER_SK"
}

// Foreign key relationship SYS_CONSTRAINT_53546e32-e51c-45ee-a046-edc2faf9191f.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_RETURNING_CUSTOMER_SK" > "tpcds_sf100tcl"."customer"."C_CUSTOMER_SK"
}

// Foreign key relationship SYS_CONSTRAINT_01bfd300-b527-44cf-a04c-fd591ad7d3a0.
Ref {
    "tpcds_sf100tcl"."web_page"."WP_CUSTOMER_SK" > "tpcds_sf100tcl"."customer"."C_CUSTOMER_SK"
}

// Foreign key relationship SYS_CONSTRAINT_cc753d5c-7f6a-4047-a678-a64ce131d3d9.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_BILL_CUSTOMER_SK" > "tpcds_sf100tcl"."customer"."C_CUSTOMER_SK"
}

// Foreign key relationship SYS_CONSTRAINT_c7c5c946-fa70-4ea9-bc68-0ecd7f250367.
Ref {
    "tpcds_sf100tcl"."web_returns"."WR_RETURNING_CUSTOMER_SK" > "tpcds_sf100tcl"."customer"."C_CUSTOMER_SK"
}

// Foreign key relationship SYS_CONSTRAINT_0da09752-aee2-4acf-8d77-a79269ac8f4f.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_SHIP_CUSTOMER_SK" > "tpcds_sf100tcl"."customer"."C_CUSTOMER_SK"
}

// Foreign key relationship SYS_CONSTRAINT_3658765a-437a-4e54-9bf0-37d3e64d5128.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_SHIP_CUSTOMER_SK" > "tpcds_sf100tcl"."customer"."C_CUSTOMER_SK"
}

// Foreign key relationship SYS_CONSTRAINT_0d4b2699-fd2d-4520-838c-e02cacd465ca.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_BILL_CUSTOMER_SK" > "tpcds_sf100tcl"."customer"."C_CUSTOMER_SK"
}

// Foreign key relationship SYS_CONSTRAINT_8fd651e1-6a9a-43ef-a0ad-4bbbab6db6a2.
Ref {
    "tpcds_sf100tcl"."store_sales"."SS_CUSTOMER_SK" > "tpcds_sf100tcl"."customer"."C_CUSTOMER_SK"
}

// Foreign key relationship SYS_CONSTRAINT_cbe2c9f2-d942-4389-8ae9-a202a3f01640.
Ref {
    "tpcds_sf100tcl"."store_returns"."SR_CUSTOMER_SK" > "tpcds_sf100tcl"."customer"."C_CUSTOMER_SK"
}

// Foreign key relationship SYS_CONSTRAINT_ce75527b-bc82-4b34-8372-25b8abcc36a3.
Ref {
    "tpcds_sf100tcl"."customer"."C_CURRENT_ADDR_SK" > "tpcds_sf100tcl"."customer_address"."CA_ADDRESS_SK"
}

// Foreign key relationship SYS_CONSTRAINT_47e502ab-b99f-43de-a734-c416f8fca16e.
Ref {
    "tpcds_sf100tcl"."web_returns"."WR_REFUNDED_ADDR_SK" > "tpcds_sf100tcl"."customer_address"."CA_ADDRESS_SK"
}

// Foreign key relationship SYS_CONSTRAINT_9249cacb-4d3b-47cc-b652-0da737522672.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_SHIP_ADDR_SK" > "tpcds_sf100tcl"."customer_address"."CA_ADDRESS_SK"
}

// Foreign key relationship SYS_CONSTRAINT_8594c5a3-abf2-4c7d-90a9-259506e79b48.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_BILL_ADDR_SK" > "tpcds_sf100tcl"."customer_address"."CA_ADDRESS_SK"
}

// Foreign key relationship SYS_CONSTRAINT_45846ee1-68ac-419f-ab32-dc92fff58de6.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_REFUNDED_ADDR_SK" > "tpcds_sf100tcl"."customer_address"."CA_ADDRESS_SK"
}

// Foreign key relationship SYS_CONSTRAINT_2f7c7542-174f-4548-b80d-1c877e8ed85f.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_RETURNING_ADDR_SK" > "tpcds_sf100tcl"."customer_address"."CA_ADDRESS_SK"
}

// Foreign key relationship SYS_CONSTRAINT_8e5eddd7-1ebc-4094-a4d1-1cdf1d3a4f6e.
Ref {
    "tpcds_sf100tcl"."web_returns"."WR_RETURNING_ADDR_SK" > "tpcds_sf100tcl"."customer_address"."CA_ADDRESS_SK"
}

// Foreign key relationship SYS_CONSTRAINT_ea1f6542-04eb-4a4a-b052-e7954fdb9351.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_SHIP_ADDR_SK" > "tpcds_sf100tcl"."customer_address"."CA_ADDRESS_SK"
}

// Foreign key relationship SYS_CONSTRAINT_e81f8b52-c1ec-4e87-a8fb-a37b91ce6105.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_BILL_ADDR_SK" > "tpcds_sf100tcl"."customer_address"."CA_ADDRESS_SK"
}

// Foreign key relationship SYS_CONSTRAINT_13ad18d7-6143-48c1-be86-72c123ff5601.
Ref {
    "tpcds_sf100tcl"."store_sales"."SS_ADDR_SK" > "tpcds_sf100tcl"."customer_address"."CA_ADDRESS_SK"
}

// Foreign key relationship SYS_CONSTRAINT_5fd8faa5-de41-47b8-b295-b5755dae5ef8.
Ref {
    "tpcds_sf100tcl"."store_returns"."SR_ADDR_SK" > "tpcds_sf100tcl"."customer_address"."CA_ADDRESS_SK"
}

// Foreign key relationship SYS_CONSTRAINT_94ccf5ae-e318-41ba-becb-3a0f59c6fe80.
Ref {
    "tpcds_sf100tcl"."customer"."C_CURRENT_CDEMO_SK" > "tpcds_sf100tcl"."customer_demographics"."CD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_fcef6f5f-9928-4085-a063-0b31727b8f0c.
Ref {
    "tpcds_sf100tcl"."web_returns"."WR_RETURNING_CDEMO_SK" > "tpcds_sf100tcl"."customer_demographics"."CD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_af902054-a5b8-48e6-9fae-249528d0fcb5.
Ref {
    "tpcds_sf100tcl"."web_returns"."WR_REFUNDED_CDEMO_SK" > "tpcds_sf100tcl"."customer_demographics"."CD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_595c9485-4fdf-48ad-81be-0aeb7e4915b2.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_RETURNING_CDEMO_SK" > "tpcds_sf100tcl"."customer_demographics"."CD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_cb15628d-128a-4c32-9d7c-111c899263d9.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_REFUNDED_CDEMO_SK" > "tpcds_sf100tcl"."customer_demographics"."CD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_e6a1b051-8444-41b4-a1e2-dfe6e04a47cb.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_BILL_CDEMO_SK" > "tpcds_sf100tcl"."customer_demographics"."CD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_c911a900-3216-435d-add6-e3cd1f8c01e4.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_SHIP_CDEMO_SK" > "tpcds_sf100tcl"."customer_demographics"."CD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_b9d49c42-1c5b-4191-ad35-4216019b491f.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_BILL_CDEMO_SK" > "tpcds_sf100tcl"."customer_demographics"."CD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_771e8e46-e413-4d3e-a8cf-cf6a9cf66548.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_SHIP_CDEMO_SK" > "tpcds_sf100tcl"."customer_demographics"."CD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_61333a40-bef9-44fc-97b8-ea6315507d23.
Ref {
    "tpcds_sf100tcl"."store_sales"."SS_CDEMO_SK" > "tpcds_sf100tcl"."customer_demographics"."CD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_aad57601-59a7-4910-b2fb-4fa5bcbfa479.
Ref {
    "tpcds_sf100tcl"."store_returns"."SR_CDEMO_SK" > "tpcds_sf100tcl"."customer_demographics"."CD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_144b59b3-4638-4739-a9e0-de8b0c4dd202.
Ref {
    "tpcds_sf100tcl"."inventory"."INV_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_5e9af889-a531-4ae3-8ea0-9df1fe3aabd7.
Ref {
    "tpcds_sf100tcl"."customer"."C_FIRST_SALES_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_693462a4-a81a-4b10-a591-f1c0b7d8b8ae.
Ref {
    "tpcds_sf100tcl"."customer"."C_FIRST_SHIPTO_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_a3299f50-4540-454f-9894-bea5a3f04dd4.
Ref {
    "tpcds_sf100tcl"."call_center"."CC_CLOSED_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_08d65b67-13e2-4422-a83c-74d343aafe9c.
Ref {
    "tpcds_sf100tcl"."call_center"."CC_OPEN_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_a7d11510-7989-455d-8409-47d91033b918.
Ref {
    "tpcds_sf100tcl"."catalog_page"."CP_END_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_b8637ee8-b047-420f-819a-5b05c376cdf3.
Ref {
    "tpcds_sf100tcl"."catalog_page"."CP_START_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_dc199994-f3b0-49ae-b6fb-e57cc291625c.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_SHIP_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_500c643d-59a4-4ee8-8025-c1b02dc7f346.
Ref {
    "tpcds_sf100tcl"."web_page"."WP_ACCESS_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_1d1eff71-d534-4145-8cd2-466eb2020197.
Ref {
    "tpcds_sf100tcl"."web_page"."WP_CREATION_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_42ff08fe-c9be-4622-b543-edb1a3db418b.
Ref {
    "tpcds_sf100tcl"."web_returns"."WR_RETURNED_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_c25936e4-5772-48d4-9627-3b44105c2cf0.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_RETURNED_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_8a30e6ff-7e2c-4b37-99aa-0a36760e8bda.
Ref {
    "tpcds_sf100tcl"."web_site"."WEB_CLOSE_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_c9dabdac-56cd-45f4-a883-86ff4d699009.
Ref {
    "tpcds_sf100tcl"."web_site"."WEB_OPEN_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_4ac44e9f-95c1-49bc-b1fe-892fa45321f4.
Ref {
    "tpcds_sf100tcl"."promotion"."P_END_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_1bc2168d-ede6-4574-a163-41d025abc1be.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_SHIP_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_8b238f8c-3765-4952-8045-276de386d3e6.
Ref {
    "tpcds_sf100tcl"."promotion"."P_START_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_6cf0b2d5-be8d-4234-a9ca-4051bb2717ec.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_SOLD_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_49ba2349-e8d1-4aa7-83f4-17ec3e35a743.
Ref {
    "tpcds_sf100tcl"."store"."S_CLOSED_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_f9bace0e-c2de-4fc8-9021-851a42079b03.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_SOLD_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_3cf9a730-af5f-473e-9bfe-5e7c9ee71f80.
Ref {
    "tpcds_sf100tcl"."store_returns"."SR_RETURNED_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_f0798316-6419-4365-9b9f-8871078b614d.
Ref {
    "tpcds_sf100tcl"."store_sales"."SS_SOLD_DATE_SK" > "tpcds_sf100tcl"."date_dim"."D_DATE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_3163c6b4-35fc-4b7b-8b06-c7d1ce943950.
Ref {
    "tpcds_sf100tcl"."customer"."C_CURRENT_HDEMO_SK" > "tpcds_sf100tcl"."household_demographics"."HD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_070e7516-e155-410b-85ca-fb72c675dc44.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_SHIP_HDEMO_SK" > "tpcds_sf100tcl"."household_demographics"."HD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_7a392a53-e28a-4635-bbe3-3102ad4892a9.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_BILL_HDEMO_SK" > "tpcds_sf100tcl"."household_demographics"."HD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_6af039f0-75ae-4313-a877-8defa4b9dc62.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_SHIP_HDEMO_SK" > "tpcds_sf100tcl"."household_demographics"."HD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_b19cf8e2-3eca-4c44-baa9-d4f46bb810a0.
Ref {
    "tpcds_sf100tcl"."web_returns"."WR_RETURNING_HDEMO_SK" > "tpcds_sf100tcl"."household_demographics"."HD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_9916f927-434f-43d5-b4d3-d63203ded9d3.
Ref {
    "tpcds_sf100tcl"."web_returns"."WR_REFUNDED_HDEMO_SK" > "tpcds_sf100tcl"."household_demographics"."HD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_31e50b3f-d71b-45a8-806e-5a5c4ab59fb6.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_REFUNDED_HDEMO_SK" > "tpcds_sf100tcl"."household_demographics"."HD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_0e7d7484-07a5-400b-98ea-6503cccf1f27.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_RETURNING_HDEMO_SK" > "tpcds_sf100tcl"."household_demographics"."HD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_18b57de5-fe55-4ea6-85a2-ad0eab9235c9.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_BILL_HDEMO_SK" > "tpcds_sf100tcl"."household_demographics"."HD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_1f4ba39f-dd77-455b-a548-6442288dd8da.
Ref {
    "tpcds_sf100tcl"."store_sales"."SS_HDEMO_SK" > "tpcds_sf100tcl"."household_demographics"."HD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_6e95709e-36ef-4f3d-acb0-2abf93752f97.
Ref {
    "tpcds_sf100tcl"."store_returns"."SR_HDEMO_SK" > "tpcds_sf100tcl"."household_demographics"."HD_DEMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_ce6d59ce-1d12-4c36-be5d-0bbae8324974.
Ref {
    "tpcds_sf100tcl"."inventory"."INV_ITEM_SK" > "tpcds_sf100tcl"."item"."I_ITEM_SK"
}

// Foreign key relationship SYS_CONSTRAINT_06d47f02-6dc1-4017-97a7-defbf452c2d9.
Ref {
    "tpcds_sf100tcl"."web_returns"."WR_ITEM_SK" > "tpcds_sf100tcl"."item"."I_ITEM_SK"
}

// Foreign key relationship SYS_CONSTRAINT_a72f6433-ce15-4f03-bb94-096a4e847440.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_ITEM_SK" > "tpcds_sf100tcl"."item"."I_ITEM_SK"
}

// Foreign key relationship SYS_CONSTRAINT_d83dbf8f-baeb-4ece-b96a-3b2b02e4f3b7.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_ITEM_SK" > "tpcds_sf100tcl"."item"."I_ITEM_SK"
}

// Foreign key relationship SYS_CONSTRAINT_4fce6047-caad-4382-a519-005d8bf16283.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_ITEM_SK" > "tpcds_sf100tcl"."item"."I_ITEM_SK"
}

// Foreign key relationship SYS_CONSTRAINT_200a9b17-c8d5-4c9f-9b13-1b6ffb73884f.
Ref {
    "tpcds_sf100tcl"."promotion"."P_ITEM_SK" > "tpcds_sf100tcl"."item"."I_ITEM_SK"
}

// Foreign key relationship SYS_CONSTRAINT_1c4062b9-158f-4ea0-9d74-ebd61f5e132b.
Ref {
    "tpcds_sf100tcl"."store_returns"."SR_ITEM_SK" > "tpcds_sf100tcl"."item"."I_ITEM_SK"
}

// Foreign key relationship SYS_CONSTRAINT_fc66b2af-c81c-4724-ac15-57f4d5e3ebb3.
Ref {
    "tpcds_sf100tcl"."store_sales"."SS_ITEM_SK" > "tpcds_sf100tcl"."item"."I_ITEM_SK"
}

// Foreign key relationship SYS_CONSTRAINT_b15d4e52-36c5-4cde-9b8f-b47a72109a6a.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_PROMO_SK" > "tpcds_sf100tcl"."promotion"."P_PROMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_ccc88d1c-16b1-4ba4-9454-af20904b46ff.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_PROMO_SK" > "tpcds_sf100tcl"."promotion"."P_PROMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_f6fd4edb-12fb-4534-b10b-8d6f14396c21.
Ref {
    "tpcds_sf100tcl"."store_sales"."SS_PROMO_SK" > "tpcds_sf100tcl"."promotion"."P_PROMO_SK"
}

// Foreign key relationship SYS_CONSTRAINT_c9b7b4a3-8c2e-4f73-ac6b-c6d64a73ab7c.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_REASON_SK" > "tpcds_sf100tcl"."reason"."R_REASON_SK"
}

// Foreign key relationship SYS_CONSTRAINT_119e4df8-d8ac-4046-b466-2a8212ce43f1.
Ref {
    "tpcds_sf100tcl"."web_returns"."WR_REASON_SK" > "tpcds_sf100tcl"."reason"."R_REASON_SK"
}

// Foreign key relationship SYS_CONSTRAINT_488c5194-62ab-401f-95d5-5e9c06c62bb6.
Ref {
    "tpcds_sf100tcl"."store_returns"."SR_REASON_SK" > "tpcds_sf100tcl"."reason"."R_REASON_SK"
}

// Foreign key relationship SYS_CONSTRAINT_4a647d41-0540-4240-8790-5405e45e52a6.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_SHIP_MODE_SK" > "tpcds_sf100tcl"."ship_mode"."SM_SHIP_MODE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_3bdbc078-86af-4ae5-8917-a618b4e1321a.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_SHIP_MODE_SK" > "tpcds_sf100tcl"."ship_mode"."SM_SHIP_MODE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_14149f1e-66a6-4758-a2bc-e3bab7c6399a.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_SHIP_MODE_SK" > "tpcds_sf100tcl"."ship_mode"."SM_SHIP_MODE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_49bbe885-0e58-4387-b38c-b93c63674e40.
Ref {
    "tpcds_sf100tcl"."store_sales"."SS_STORE_SK" > "tpcds_sf100tcl"."store"."S_STORE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_00f6e78e-96d4-4bbc-90b0-a2978b368f4c.
Ref {
    "tpcds_sf100tcl"."store_returns"."SR_STORE_SK" > "tpcds_sf100tcl"."store"."S_STORE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_6f64e064-123f-4234-9159-d84be7e0ae91.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_SOLD_TIME_SK" > "tpcds_sf100tcl"."time_dim"."T_TIME_SK"
}

// Foreign key relationship SYS_CONSTRAINT_9ab551e9-d4cf-4a8b-a94c-355f8a8db7b9.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_SOLD_TIME_SK" > "tpcds_sf100tcl"."time_dim"."T_TIME_SK"
}

// Foreign key relationship SYS_CONSTRAINT_312f601f-1ebd-41ea-a61b-4921f9d7ab27.
Ref {
    "tpcds_sf100tcl"."web_returns"."WR_RETURNED_TIME_SK" > "tpcds_sf100tcl"."time_dim"."T_TIME_SK"
}

// Foreign key relationship SYS_CONSTRAINT_5fdbb4da-f828-4929-8a62-611b0638681a.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_RETURNED_TIME_SK" > "tpcds_sf100tcl"."time_dim"."T_TIME_SK"
}

// Foreign key relationship SYS_CONSTRAINT_dc5db614-fb99-4c0b-bf8b-5f8741cd0225.
Ref {
    "tpcds_sf100tcl"."store_sales"."SS_SOLD_TIME_SK" > "tpcds_sf100tcl"."time_dim"."T_TIME_SK"
}

// Foreign key relationship SYS_CONSTRAINT_46199aeb-533d-4bf7-9b38-99b35585ea81.
Ref {
    "tpcds_sf100tcl"."store_returns"."SR_RETURN_TIME_SK" > "tpcds_sf100tcl"."time_dim"."T_TIME_SK"
}

// Foreign key relationship SYS_CONSTRAINT_04c657dd-ec26-481e-8ef2-dc95f2873cfb.
Ref {
    "tpcds_sf100tcl"."inventory"."INV_WAREHOUSE_SK" > "tpcds_sf100tcl"."warehouse"."W_WAREHOUSE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_cbb52474-91d6-488d-b1e2-a0313031d486.
Ref {
    "tpcds_sf100tcl"."catalog_sales"."CS_WAREHOUSE_SK" > "tpcds_sf100tcl"."warehouse"."W_WAREHOUSE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_f40b1906-ca04-4e07-a5a1-7b6785e9f16e.
Ref {
    "tpcds_sf100tcl"."catalog_returns"."CR_WAREHOUSE_SK" > "tpcds_sf100tcl"."warehouse"."W_WAREHOUSE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_6c58ec56-0436-4f91-bf3b-e6b3f380c00f.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_WAREHOUSE_SK" > "tpcds_sf100tcl"."warehouse"."W_WAREHOUSE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_f2b5a87c-73dc-4979-8dcb-851d748d8b84.
Ref {
    "tpcds_sf100tcl"."web_returns"."WR_WEB_PAGE_SK" > "tpcds_sf100tcl"."web_page"."WP_WEB_PAGE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_73688b3f-812a-46da-8cce-e22232e402c2.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_WEB_PAGE_SK" > "tpcds_sf100tcl"."web_page"."WP_WEB_PAGE_SK"
}

// Foreign key relationship SYS_CONSTRAINT_bb60a45a-6bb1-4ca8-806e-8e52f4ed4ca4.
Ref {
    "tpcds_sf100tcl"."web_returns".("WR_ITEM_SK", "WR_ORDER_NUMBER") > "tpcds_sf100tcl"."web_sales".("WS_ITEM_SK", "WS_ORDER_NUMBER")
}

// Foreign key relationship SYS_CONSTRAINT_9787d433-6618-485f-831d-241eeffa9dff.
Ref {
    "tpcds_sf100tcl"."web_sales"."WS_WEB_SITE_SK" > "tpcds_sf100tcl"."web_site"."WEB_SITE_SK"
}

TableGroup tpcds_sf100tcl {
    "tpcds_sf100tcl"."call_center"
    "tpcds_sf100tcl"."catalog_page"
    "tpcds_sf100tcl"."catalog_returns"
    "tpcds_sf100tcl"."catalog_sales"
    "tpcds_sf100tcl"."customer"
    "tpcds_sf100tcl"."customer_address"
    "tpcds_sf100tcl"."customer_demographics"
    "tpcds_sf100tcl"."date_dim"
    "tpcds_sf100tcl"."household_demographics"
    "tpcds_sf100tcl"."income_band"
    "tpcds_sf100tcl"."inventory"
    "tpcds_sf100tcl"."item"
    "tpcds_sf100tcl"."promotion"
    "tpcds_sf100tcl"."reason"
    "tpcds_sf100tcl"."ship_mode"
    "tpcds_sf100tcl"."store"
    "tpcds_sf100tcl"."store_returns"
    "tpcds_sf100tcl"."store_sales"
    "tpcds_sf100tcl"."time_dim"
    "tpcds_sf100tcl"."warehouse"
    "tpcds_sf100tcl"."web_page"
    "tpcds_sf100tcl"."web_returns"
    "tpcds_sf100tcl"."web_sales"
    "tpcds_sf100tcl"."web_site"
}
`;

export const DEFAULT_DBML_TPCH_SF1 = `// ============================================================
// Sample DBML Project Schema - TPCH SF1
// ============================================================

Project "SNOWFLAKE_SAMPLE_DATA" {
    Note {
        '''
        Generated using snowflake-dbml on 2024-05-01 01:38:02
        Database: SNOWFLAKE_SAMPLE_DATA
        Database User: ryanrozich
        Included Schemas: All
        Excluded Schemas: None
        '''
    }
}

Table "tpch_sf100"."customer" [headercolor: #3498db] {
    "C_CUSTKEY" NUMBER
    "C_NAME" TEXT
    "C_ADDRESS" TEXT
    "C_NATIONKEY" NUMBER
    "C_PHONE" TEXT
    "C_ACCTBAL" NUMBER
    "C_MKTSEGMENT" TEXT
    "C_COMMENT" TEXT
    Note {
        '''
        BASE TABLE
        Comment: Customer data as defined by TPC-H
        
        Metrics:
        - Rows: 15,000,000
        - Size: 1.01 GB
        
        Timestamps:
        - Created: 2021-11-11 13:44:38.535000-08:00
        - Last DDL: None
        - Last Altered: 2024-04-22 04:42:11.109000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: <none>
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpch_sf100"."lineitem" [headercolor: #3498db] {
    "L_ORDERKEY" NUMBER
    "L_PARTKEY" NUMBER
    "L_SUPPKEY" NUMBER
    "L_LINENUMBER" NUMBER
    "L_QUANTITY" NUMBER
    "L_EXTENDEDPRICE" NUMBER
    "L_DISCOUNT" NUMBER
    "L_TAX" NUMBER
    "L_RETURNFLAG" TEXT
    "L_LINESTATUS" TEXT
    "L_SHIPDATE" DATE
    "L_COMMITDATE" DATE
    "L_RECEIPTDATE" DATE
    "L_SHIPINSTRUCT" TEXT
    "L_SHIPMODE" TEXT
    "L_COMMENT" TEXT
    Note {
        '''
        BASE TABLE
        Comment: Lineitem data as defined by TPC-H
        
        Metrics:
        - Rows: 600,037,902
        - Size: 15.47 GB
        
        Timestamps:
        - Created: 2021-11-11 13:44:38.537000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-19 16:48:04.350000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: <none>
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpch_sf100"."nation" [headercolor: #3498db] {
    "N_NATIONKEY" NUMBER
    "N_NAME" TEXT
    "N_REGIONKEY" NUMBER
    "N_COMMENT" TEXT
    Note {
        '''
        BASE TABLE
        Comment: Nation data as defined by TPC-H
        
        Metrics:
        - Rows: 25
        - Size: 4.00 KB
        
        Timestamps:
        - Created: 2021-11-11 13:44:38.513000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-19 16:48:04.351000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: <none>
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpch_sf100"."orders" [headercolor: #3498db] {
    "O_ORDERKEY" NUMBER
    "O_CUSTKEY" NUMBER
    "O_ORDERSTATUS" TEXT
    "O_TOTALPRICE" NUMBER
    "O_ORDERDATE" DATE
    "O_ORDERPRIORITY" TEXT
    "O_CLERK" TEXT
    "O_SHIPPRIORITY" NUMBER
    "O_COMMENT" TEXT
    Note {
        '''
        BASE TABLE
        Comment: Orders data as defined by TPC-H
        
        Metrics:
        - Rows: 150,000,000
        - Size: 4.33 GB
        
        Timestamps:
        - Created: 2021-11-11 13:44:38.617000-08:00
        - Last DDL: None
        - Last Altered: 2024-04-24 00:34:47.650000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: <none>
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpch_sf100"."part" [headercolor: #3498db] {
    "P_PARTKEY" NUMBER
    "P_NAME" TEXT
    "P_MFGR" TEXT
    "P_BRAND" TEXT
    "P_TYPE" TEXT
    "P_SIZE" NUMBER
    "P_CONTAINER" TEXT
    "P_RETAILPRICE" NUMBER
    "P_COMMENT" TEXT
    Note {
        '''
        BASE TABLE
        Comment: Part data as defined by TPC-H
        
        Metrics:
        - Rows: 20,000,000
        - Size: 511.17 MB
        
        Timestamps:
        - Created: 2021-11-11 13:44:39.355000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-19 16:48:09.489000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: <none>
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpch_sf100"."partsupp" [headercolor: #3498db] {
    "PS_PARTKEY" NUMBER
    "PS_SUPPKEY" NUMBER
    "PS_AVAILQTY" NUMBER
    "PS_SUPPLYCOST" NUMBER
    "PS_COMMENT" TEXT
    Note {
        '''
        BASE TABLE
        Comment: Partsupp data as defined by TPC-H
        
        Metrics:
        - Rows: 80,000,000
        - Size: 3.51 GB
        
        Timestamps:
        - Created: 2021-11-11 13:44:39.331000-08:00
        - Last DDL: None
        - Last Altered: 2024-04-26 04:12:33.352000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: <none>
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpch_sf100"."region" [headercolor: #3498db] {
    "R_REGIONKEY" NUMBER
    "R_NAME" TEXT
    "R_COMMENT" TEXT
    Note {
        '''
        BASE TABLE
        Comment: Region data as defined by TPC-H
        
        Metrics:
        - Rows: 5
        - Size: 4.00 KB
        
        Timestamps:
        - Created: 2021-11-11 13:44:39.624000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-19 16:48:04.846000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: <none>
        -Auto Clustering: NO
        
        '''
    }
}

Table "tpch_sf100"."supplier" [headercolor: #3498db] {
    "S_SUPPKEY" NUMBER
    "S_NAME" TEXT
    "S_ADDRESS" TEXT
    "S_NATIONKEY" NUMBER
    "S_PHONE" TEXT
    "S_ACCTBAL" NUMBER
    "S_COMMENT" TEXT
    Note {
        '''
        BASE TABLE
        Comment: Supplier data as defined by TPC-H
        
        Metrics:
        - Rows: 1,000,000
        - Size: 65.60 MB
        
        Timestamps:
        - Created: 2021-11-11 13:44:39.626000-08:00
        - Last DDL: None
        - Last Altered: 2023-10-19 16:48:04.543000-07:00
        
        Ownership:
        - Owner: None
        - Last DDL By: None
        
        Clustering:
        - Clustering Key: <none>
        -Auto Clustering: NO
        
        '''
    }
}

// Primary key relationship inferred from primary key hints for tpch_sf100.customer.
Ref {
    "tpch_sf100"."orders"."O_CUSTKEY" > "tpch_sf100"."customer"."C_CUSTKEY"
}

// Primary key relationship inferred from primary key hints for tpch_sf100.nation.
Ref {
    "tpch_sf100"."customer"."C_NATIONKEY" > "tpch_sf100"."nation"."N_NATIONKEY"
}

// Primary key relationship inferred from primary key hints for tpch_sf100.nation.
Ref {
    "tpch_sf100"."supplier"."S_NATIONKEY" > "tpch_sf100"."nation"."N_NATIONKEY"
}

// Primary key relationship inferred from primary key hints for tpch_sf100.orders.
Ref {
    "tpch_sf100"."lineitem"."L_ORDERKEY" > "tpch_sf100"."orders"."O_ORDERKEY"
}

// Primary key relationship inferred from primary key hints for tpch_sf100.part.
Ref {
    "tpch_sf100"."lineitem"."L_PARTKEY" > "tpch_sf100"."part"."P_PARTKEY"
}

// Primary key relationship inferred from primary key hints for tpch_sf100.part.
Ref {
    "tpch_sf100"."partsupp"."PS_PARTKEY" > "tpch_sf100"."part"."P_PARTKEY"
}

// Primary key relationship inferred from primary key hints for tpch_sf100.region.
Ref {
    "tpch_sf100"."nation"."N_REGIONKEY" > "tpch_sf100"."region"."R_REGIONKEY"
}

// Primary key relationship inferred from primary key hints for tpch_sf100.supplier.
Ref {
    "tpch_sf100"."lineitem"."L_SUPPKEY" > "tpch_sf100"."supplier"."S_SUPPKEY"
}

// Primary key relationship inferred from primary key hints for tpch_sf100.supplier.
Ref {
    "tpch_sf100"."partsupp"."PS_SUPPKEY" > "tpch_sf100"."supplier"."S_SUPPKEY"
}

TableGroup tpch_sf100 {
    "tpch_sf100"."customer"
    "tpch_sf100"."lineitem"
    "tpch_sf100"."nation"
    "tpch_sf100"."orders"
    "tpch_sf100"."part"
    "tpch_sf100"."partsupp"
    "tpch_sf100"."region"
    "tpch_sf100"."supplier"
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
    { projectKey: key, path: 'dbml/TPCH_SF100.dbml', content: DEFAULT_DBML_TPCH_SF100, type: 'file' },
    { projectKey: key, path: 'dbml/TPCH_SF1.dbml', content: DEFAULT_DBML_TPCH_SF1, type: 'file' }
  ];
}
